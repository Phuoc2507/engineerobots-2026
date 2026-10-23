-- Đăng ký đội (Giai đoạn 2): đội trưởng đăng nhập Google @student.hcmute.edu.vn rồi gọi register_team().
-- Mọi thao tác GHI đi qua hàm SECURITY DEFINER để kiểm tra nghiệp vụ trong 1 transaction;
-- client chỉ được ĐỌC đội của chính mình (đội trưởng hoặc thành viên có email trùng).

ALTER TABLE teams ADD COLUMN leader_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX teams_leader_user_id_key ON teams (leader_user_id);

-- Mỗi sinh viên chỉ thuộc 1 đội
CREATE UNIQUE INDEX team_members_student_id_key ON team_members (student_id);
CREATE UNIQUE INDEX team_members_email_key      ON team_members (lower(email));
CREATE INDEX team_members_team_id_idx           ON team_members (team_id);

ALTER TABLE team_members
    ADD CONSTRAINT team_members_student_id_k26 CHECK (student_id ~ '^26[0-9]{6}$'),
    ADD CONSTRAINT team_members_email_domain   CHECK (lower(email) LIKE '%@student.hcmute.edu.vn'),
    ADD CONSTRAINT team_members_role_check     CHECK (role IN ('LEADER', 'MEMBER', 'PILOT'));

-- Danh sách đội mà người đang đăng nhập thuộc về (SECURITY DEFINER để policy 2 bảng không gọi đệ quy nhau)
CREATE OR REPLACE FUNCTION public.my_team_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT id FROM teams WHERE leader_user_id = auth.uid()
    UNION
    SELECT team_id FROM team_members WHERE lower(email) = lower(auth.jwt() ->> 'email');
$$;

CREATE POLICY "Team read own" ON teams
    FOR SELECT TO authenticated USING (id IN (SELECT public.my_team_ids()));
CREATE POLICY "Members read own team" ON team_members
    FOR SELECT TO authenticated USING (team_id IN (SELECT public.my_team_ids()));

-- p_team:    { team_name, robot_name?, slogan?, major, leader_phone, leader_student_id, leader_full_name }
-- p_members: [ { student_id, full_name, email, phone?, role: MEMBER|PILOT } ]  (2–4 người, KHÔNG gồm đội trưởng)
CREATE OR REPLACE FUNCTION public.register_team(p_team JSONB, p_members JSONB)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_uid     UUID := auth.uid();
    v_email   TEXT := lower(auth.jwt() ->> 'email');
    v_team_id UUID;
    v_count   INT;
    v_ids     TEXT[];
    v_emails  TEXT[];
    v_taken   TEXT;
    m         JSONB;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Bạn cần đăng nhập trước khi đăng ký.';
    END IF;
    IF v_email IS NULL OR v_email NOT LIKE '%@student.hcmute.edu.vn' THEN
        RAISE EXCEPTION 'Chỉ chấp nhận tài khoản email @student.hcmute.edu.vn.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.my_team_ids()) THEN
        RAISE EXCEPTION 'Tài khoản này đã thuộc một đội thi.';
    END IF;

    IF jsonb_typeof(p_members) <> 'array' THEN
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

    -- Gom MSSV/email của cả đội (đội trưởng đứng đầu) để kiểm tra trùng
    v_ids    := ARRAY[trim(p_team ->> 'leader_student_id')];
    v_emails := ARRAY[v_email];
    FOR m IN SELECT * FROM jsonb_array_elements(p_members) LOOP
        IF length(trim(coalesce(m ->> 'full_name', ''))) = 0 THEN
            RAISE EXCEPTION 'Thiếu họ tên thành viên.';
        END IF;
        IF coalesce(m ->> 'role', 'MEMBER') NOT IN ('MEMBER', 'PILOT') THEN
            RAISE EXCEPTION 'Vai trò thành viên không hợp lệ.';
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

    SELECT string_agg(student_id, ', ') INTO v_taken
    FROM team_members
    WHERE student_id = ANY (v_ids) OR lower(email) = ANY (v_emails);
    IF v_taken IS NOT NULL THEN
        RAISE EXCEPTION 'MSSV đã thuộc đội khác: %', v_taken;
    END IF;

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

    INSERT INTO team_members (team_id, student_id, full_name, email, phone, role)
    VALUES (v_team_id, trim(p_team ->> 'leader_student_id'), trim(p_team ->> 'leader_full_name'),
            v_email, p_team ->> 'leader_phone', 'LEADER');

    INSERT INTO team_members (team_id, student_id, full_name, email, phone, role)
    SELECT v_team_id, trim(x ->> 'student_id'), trim(x ->> 'full_name'), lower(trim(x ->> 'email')),
           nullif(trim(x ->> 'phone'), ''), coalesce(x ->> 'role', 'MEMBER')
    FROM jsonb_array_elements(p_members) x;

    RETURN v_team_id;
END;
$$;

-- Chỉ người đã đăng nhập mới gọi được
REVOKE ALL ON FUNCTION public.my_team_ids()                FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.register_team(JSONB, JSONB)  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_team_ids()               TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_team(JSONB, JSONB) TO authenticated;
