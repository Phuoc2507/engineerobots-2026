-- Quản lý đội sau khi đăng ký:
--  • Thành viên được đội trưởng thêm email → đăng nhập là thấy đội (my_team_ids đã có) và được "xác nhận" (claim_membership).
--  • Đội trưởng sửa hồ sơ / thay người khi đội còn PENDING hoặc REJECTED (sửa xong quay về PENDING) và còn hạn đăng ký.
--  • Đội trưởng rút hồ sơ (xóa đội) khi chưa được duyệt; thành viên tự rời đội nếu đội vẫn còn ≥ 3 người.
-- Mọi thao tác ghi vẫn đi qua hàm SECURITY DEFINER.

ALTER TABLE team_members
    ADD COLUMN user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN joined_at TIMESTAMPTZ;

ALTER TABLE teams
    ADD COLUMN review_note TEXT,          -- BTC ghi lý do từ chối / yêu cầu bổ sung
    ADD COLUMN updated_at  TIMESTAMPTZ;

-- Tên đội không phân biệt hoa thường
CREATE UNIQUE INDEX teams_team_name_lower_key ON teams (lower(team_name));

-- Hạn chót đăng ký / chỉnh sửa (khớp SITE.registrationDeadline ở web)
CREATE OR REPLACE FUNCTION public.registration_open()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$ SELECT now() <= TIMESTAMPTZ '2026-11-15 23:59:59+07'; $$;

-- Kiểm tra payload đội (dùng chung cho đăng ký & sửa). p_team_id = đội đang sửa (NULL khi đăng ký mới)
CREATE OR REPLACE FUNCTION public._validate_team(p_team JSONB, p_members JSONB, p_leader_email TEXT, p_team_id UUID)
RETURNS VOID
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
    IF length(trim(coalesce(p_team ->> 'major', ''))) = 0 THEN
        RAISE EXCEPTION 'Vui lòng chọn ngành của đội trưởng.';
    END IF;
    IF coalesce(p_team ->> 'leader_phone', '') !~ '^0[0-9]{9}$' THEN
        RAISE EXCEPTION 'Số điện thoại đội trưởng phải gồm 10 chữ số, bắt đầu bằng 0.';
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
    IF EXISTS (SELECT 1 FROM unnest(v_emails) e WHERE e IS NULL OR e NOT LIKE '%@student.hcmute.edu.vn') THEN
        RAISE EXCEPTION 'Email thành viên phải có đuôi @student.hcmute.edu.vn.';
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

-- Đăng ký mới: giữ nguyên chữ ký cũ, thêm hạn chót + gắn user_id cho đội trưởng
CREATE OR REPLACE FUNCTION public.register_team(p_team JSONB, p_members JSONB)
RETURNS UUID
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
            trim(p_team ->> 'major'),
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

-- Thành viên đăng nhập lần đầu → đánh dấu đã xác nhận. Trả về team_id (NULL nếu không thuộc đội nào)
CREATE OR REPLACE FUNCTION public.claim_membership()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_team_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;
    UPDATE team_members
    SET user_id = auth.uid(), joined_at = coalesce(joined_at, now())
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
      AND user_id IS DISTINCT FROM auth.uid()
    RETURNING team_id INTO v_team_id;

    IF v_team_id IS NULL THEN
        SELECT team_id INTO v_team_id FROM team_members WHERE lower(email) = lower(auth.jwt() ->> 'email');
    END IF;
    RETURN v_team_id;
END;
$$;

-- Đội trưởng sửa hồ sơ & danh sách thành viên (payload giống register_team)
CREATE OR REPLACE FUNCTION public.update_team(p_team JSONB, p_members JSONB)
RETURNS UUID
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
            major        = trim(p_team ->> 'major'),
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

    -- Thay toàn bộ thành viên, giữ trạng thái xác nhận của người còn ở lại (theo email)
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

-- Đội trưởng rút hồ sơ (xóa đội) khi chưa được duyệt
CREATE OR REPLACE FUNCTION public.withdraw_team()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_team teams%ROWTYPE;
BEGIN
    SELECT * INTO v_team FROM teams WHERE leader_user_id = auth.uid() FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chỉ đội trưởng mới được rút hồ sơ.';
    END IF;
    IF v_team.status = 'APPROVED' THEN
        RAISE EXCEPTION 'Đội đã được duyệt. Muốn rút lui vui lòng liên hệ BTC.';
    END IF;
    DELETE FROM teams WHERE id = v_team.id;  -- team_members xóa theo ON DELETE CASCADE
END;
$$;

-- Thành viên (không phải đội trưởng) tự rời đội
CREATE OR REPLACE FUNCTION public.leave_team()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_member team_members%ROWTYPE;
    v_status TEXT;
    v_count  INT;
BEGIN
    SELECT * INTO v_member FROM team_members WHERE lower(email) = lower(auth.jwt() ->> 'email');
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bạn không thuộc đội nào.';
    END IF;
    IF v_member.role = 'LEADER' THEN
        RAISE EXCEPTION 'Đội trưởng không thể rời đội — hãy rút hồ sơ hoặc liên hệ BTC.';
    END IF;

    SELECT status INTO v_status FROM teams WHERE id = v_member.team_id FOR UPDATE;
    IF v_status = 'APPROVED' THEN
        RAISE EXCEPTION 'Đội đã được duyệt, muốn rời đội vui lòng liên hệ BTC.';
    END IF;
    IF NOT public.registration_open() THEN
        RAISE EXCEPTION 'Đã hết hạn đăng ký, không thể tự rời đội.';
    END IF;
    SELECT count(*) INTO v_count FROM team_members WHERE team_id = v_member.team_id;
    IF v_count <= 3 THEN
        RAISE EXCEPTION 'Đội chỉ còn 3 người — nhờ đội trưởng thay bạn bằng thành viên khác trước khi rời.';
    END IF;

    DELETE FROM team_members WHERE id = v_member.id;
    UPDATE teams SET updated_at = now() WHERE id = v_member.team_id;
END;
$$;

REVOKE ALL ON FUNCTION public._validate_team(JSONB, JSONB, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_membership()           FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_team(JSONB, JSONB)    FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.withdraw_team()              FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_team()                 FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registration_open()       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_membership()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_team(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_team()           TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_team()              TO authenticated;
