-- Form đăng ký bỏ ô "Ngành": major không còn bắt buộc (cột giữ lại, mặc định '').
-- Email đội trưởng và thành viên phải là email sinh viên K26: 26…@student.hcmute.edu.vn.
ALTER TABLE public.teams ALTER COLUMN major SET DEFAULT '';

CREATE OR REPLACE FUNCTION public._validate_team(p_team jsonb, p_members jsonb, p_leader_email text, p_team_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_count  INT;
    v_ids    TEXT[];
    v_emails TEXT[];
    v_taken  TEXT;
    m        JSONB;
BEGIN
    IF jsonb_typeof(p_members) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Danh sách thành viên không hợp lệ.';
    END IF;
    v_count := jsonb_array_length(p_members) + 1;
    IF v_count < 3 OR v_count > 5 THEN
        RAISE EXCEPTION 'Đội phải có từ 3 đến 5 thành viên (kể cả đội trưởng).';
    END IF;

    IF length(trim(coalesce(p_team ->> 'team_name', ''))) NOT BETWEEN 3 AND 100 THEN
        RAISE EXCEPTION 'Tên đội cần từ 3 đến 100 ký tự.';
    END IF;
    IF length(trim(coalesce(p_team ->> 'leader_full_name', ''))) = 0 THEN
        RAISE EXCEPTION 'Thiếu họ tên đội trưởng.';
    END IF;
    IF coalesce(p_team ->> 'leader_phone', '') !~ '^0[0-9]{9}$' THEN
        RAISE EXCEPTION 'Số điện thoại đội trưởng phải gồm 10 chữ số, bắt đầu bằng 0.';
    END IF;
    IF lower(coalesce(p_leader_email, '')) NOT LIKE '26%@student.hcmute.edu.vn' THEN
        RAISE EXCEPTION 'Đội trưởng phải đăng nhập bằng email sinh viên K26 (26…@student.hcmute.edu.vn).';
    END IF;

    v_ids    := ARRAY[trim(p_team ->> 'leader_student_id')];
    v_emails := ARRAY[lower(p_leader_email)];
    FOR m IN SELECT * FROM jsonb_array_elements(p_members) LOOP
        IF length(trim(coalesce(m ->> 'full_name', ''))) = 0 THEN
            RAISE EXCEPTION 'Thiếu họ tên thành viên.';
        END IF;
        IF coalesce(m ->> 'role', 'MEMBER') NOT IN ('MEMBER', 'PILOT') THEN
            RAISE EXCEPTION 'Vai trò thành viên không hợp lệ.';
        END IF;
        IF coalesce(nullif(trim(m ->> 'phone'), ''), '0000000000') !~ '^0[0-9]{9}$' THEN
            RAISE EXCEPTION 'Số điện thoại của % không hợp lệ.', trim(m ->> 'full_name');
        END IF;
        v_ids    := v_ids || trim(m ->> 'student_id');
        v_emails := v_emails || lower(trim(m ->> 'email'));
    END LOOP;

    IF EXISTS (SELECT 1 FROM unnest(v_ids) s WHERE s IS NULL OR s !~ '^26[0-9]{6}$') THEN
        RAISE EXCEPTION 'MSSV phải gồm 8 chữ số và bắt đầu bằng 26 (K26).';
    END IF;
    IF EXISTS (SELECT 1 FROM unnest(v_emails) e WHERE e IS NULL OR e NOT LIKE '26%@student.hcmute.edu.vn') THEN
        RAISE EXCEPTION 'Email thành viên phải bắt đầu bằng 26 và có đuôi @student.hcmute.edu.vn.';
    END IF;
    IF (SELECT count(DISTINCT s) FROM unnest(v_ids) s) <> v_count
       OR (SELECT count(DISTINCT e) FROM unnest(v_emails) e) <> v_count THEN
        RAISE EXCEPTION 'Có MSSV hoặc email bị trùng trong đội.';
    END IF;

    SELECT string_agg(student_id || ' (' || email || ')', ', ') INTO v_taken
    FROM team_members
    WHERE (student_id = ANY (v_ids) OR lower(email) = ANY (v_emails))
      AND team_id IS DISTINCT FROM p_team_id;
    IF v_taken IS NOT NULL THEN
        RAISE EXCEPTION 'Đã thuộc đội khác: %', v_taken;
    END IF;
END;
$$;

-- register_team / update_team ghi major = trim(p_team ->> 'major'): thiếu khóa thì thành NULL → giữ giá trị cũ / ''.
CREATE OR REPLACE FUNCTION public.register_team(p_team jsonb, p_members jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_uid     UUID := auth.uid();
    v_email   TEXT := lower(auth.jwt() ->> 'email');
    v_team_id UUID;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Bạn cần đăng nhập trước khi đăng ký.';
    END IF;
    IF v_email IS NULL OR v_email NOT LIKE '%@student.hcmute.edu.vn' THEN
        RAISE EXCEPTION 'Chỉ chấp nhận tài khoản email @student.hcmute.edu.vn.';
    END IF;
    IF NOT public.registration_open() THEN
        RAISE EXCEPTION 'Đã hết hạn đăng ký.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.my_team_ids()) THEN
        RAISE EXCEPTION 'Tài khoản này đã thuộc một đội thi.';
    END IF;

    PERFORM public._validate_team(p_team, p_members, v_email, NULL);

    BEGIN
        INSERT INTO teams (team_name, robot_name, slogan, leader_email, leader_phone, major, leader_user_id, qr_code_token)
        VALUES (
            trim(p_team ->> 'team_name'),
            nullif(trim(p_team ->> 'robot_name'), ''),
            nullif(trim(p_team ->> 'slogan'), ''),
            v_email,
            p_team ->> 'leader_phone',
            coalesce(trim(p_team ->> 'major'), ''),
            v_uid,
            replace(gen_random_uuid()::text, '-', '')
        )
        RETURNING id INTO v_team_id;
    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'Tên đội "%" đã có người dùng, vui lòng chọn tên khác.', trim(p_team ->> 'team_name');
    END;

    INSERT INTO team_members (team_id, student_id, full_name, email, phone, role, user_id, joined_at)
    VALUES (v_team_id, trim(p_team ->> 'leader_student_id'), trim(p_team ->> 'leader_full_name'),
            v_email, p_team ->> 'leader_phone', 'LEADER', v_uid, now());

    INSERT INTO team_members (team_id, student_id, full_name, email, phone, role)
    SELECT v_team_id, trim(x ->> 'student_id'), trim(x ->> 'full_name'), lower(trim(x ->> 'email')),
           nullif(trim(x ->> 'phone'), ''), coalesce(x ->> 'role', 'MEMBER')
    FROM jsonb_array_elements(p_members) x;

    RETURN v_team_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_team(p_team jsonb, p_members jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_uid    UUID := auth.uid();
    v_email  TEXT := lower(auth.jwt() ->> 'email');
    v_team   teams%ROWTYPE;
    v_old    JSONB;
BEGIN
    SELECT * INTO v_team FROM teams WHERE leader_user_id = v_uid FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chỉ đội trưởng mới được sửa hồ sơ đội.';
    END IF;
    IF v_team.status NOT IN ('PENDING', 'REJECTED') THEN
        RAISE EXCEPTION 'Đội đã được BTC duyệt, không thể tự sửa. Vui lòng liên hệ BTC.';
    END IF;
    IF NOT public.registration_open() THEN
        RAISE EXCEPTION 'Đã hết hạn chỉnh sửa hồ sơ.';
    END IF;

    PERFORM public._validate_team(p_team, p_members, v_email, v_team.id);

    BEGIN
        UPDATE teams SET
            team_name    = trim(p_team ->> 'team_name'),
            robot_name   = nullif(trim(p_team ->> 'robot_name'), ''),
            slogan       = nullif(trim(p_team ->> 'slogan'), ''),
            leader_phone = p_team ->> 'leader_phone',
            major        = coalesce(trim(p_team ->> 'major'), major),
            status       = 'PENDING',
            updated_at   = now()
        WHERE id = v_team.id;
    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'Tên đội "%" đã có người dùng, vui lòng chọn tên khác.', trim(p_team ->> 'team_name');
    END;

    UPDATE team_members SET
        student_id = trim(p_team ->> 'leader_student_id'),
        full_name  = trim(p_team ->> 'leader_full_name'),
        phone      = p_team ->> 'leader_phone'
    WHERE team_id = v_team.id AND role = 'LEADER';

    SELECT coalesce(jsonb_object_agg(lower(email), jsonb_build_object('uid', user_id, 'at', joined_at)), '{}')
    INTO v_old
    FROM team_members WHERE team_id = v_team.id AND role <> 'LEADER';

    DELETE FROM team_members WHERE team_id = v_team.id AND role <> 'LEADER';

    INSERT INTO team_members (team_id, student_id, full_name, email, phone, role, user_id, joined_at)
    SELECT v_team.id, trim(x ->> 'student_id'), trim(x ->> 'full_name'), lower(trim(x ->> 'email')),
           nullif(trim(x ->> 'phone'), ''), coalesce(x ->> 'role', 'MEMBER'),
           (v_old -> lower(trim(x ->> 'email')) ->> 'uid')::uuid,
           (v_old -> lower(trim(x ->> 'email')) ->> 'at')::timestamptz
    FROM jsonb_array_elements(p_members) x;

    RETURN v_team.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_member(p_member_id uuid, p_student_id text, p_full_name text, p_email text, p_phone text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    m team_members;
    v_email TEXT := lower(trim(p_email));
    v_changed BOOLEAN;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được sửa thành viên.'; END IF;
    SELECT * INTO m FROM team_members WHERE id = p_member_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy thành viên.'; END IF;
    IF coalesce(trim(p_full_name), '') = '' THEN RAISE EXCEPTION 'Họ tên không được trống.'; END IF;
    IF trim(p_student_id) !~ '^26[0-9]{6}$' THEN RAISE EXCEPTION 'MSSV phải là 8 số, bắt đầu bằng 26.'; END IF;
    IF v_email NOT LIKE '26%@student.hcmute.edu.vn' THEN RAISE EXCEPTION 'Email phải bắt đầu bằng 26 và có đuôi @student.hcmute.edu.vn.'; END IF;
    IF EXISTS (SELECT 1 FROM team_members WHERE id <> m.id AND student_id = trim(p_student_id)) THEN
        RAISE EXCEPTION 'MSSV % đã có trong một đội khác.', trim(p_student_id); END IF;
    IF EXISTS (SELECT 1 FROM team_members WHERE id <> m.id AND lower(email) = v_email) THEN
        RAISE EXCEPTION 'Email % đã có trong một đội khác.', v_email; END IF;

    v_changed := lower(m.email) <> v_email;
    UPDATE team_members
    SET student_id = trim(p_student_id), full_name = trim(p_full_name), email = v_email, phone = nullif(trim(p_phone), ''),
        user_id = CASE WHEN v_changed THEN NULL ELSE user_id END,
        joined_at = CASE WHEN v_changed THEN NULL ELSE joined_at END
    WHERE id = m.id;

    IF m.role = 'LEADER' THEN
        UPDATE teams
        SET leader_email = v_email,
            leader_phone = coalesce(nullif(trim(p_phone), ''), leader_phone),
            leader_user_id = CASE WHEN v_changed THEN (SELECT id FROM auth.users WHERE lower(email) = v_email LIMIT 1) ELSE leader_user_id END,
            updated_at = now()
        WHERE id = m.team_id;
    END IF;
END;
$$;
