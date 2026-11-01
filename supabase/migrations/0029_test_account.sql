-- Tài khoản thử nghiệm của BTC: được đi hết luồng đăng ký đội dù không phải K26
-- (bỏ điều kiện tiền tố 26 cho MSSV/email của cả đội; vẫn bắt 8 số và đuôi email trường).
-- Danh sách khớp TEST_ACCOUNTS trong src/lib/site.ts. Xóa đội thử nghiệm ở /admin trước ngày thi.
CREATE OR REPLACE FUNCTION public.is_test_account(p_email text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
    SELECT lower(coalesce(p_email, '')) IN ('25134107@student.hcmute.edu.vn');
$$;

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
    v_test   BOOLEAN := public.is_test_account(p_leader_email);
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
    IF NOT v_test AND lower(coalesce(p_leader_email, '')) NOT LIKE '26%@student.hcmute.edu.vn' THEN
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

    IF EXISTS (SELECT 1 FROM unnest(v_ids) s WHERE s IS NULL OR s !~ CASE WHEN v_test THEN '^[0-9]{8}$' ELSE '^26[0-9]{6}$' END) THEN
        RAISE EXCEPTION 'MSSV phải gồm 8 chữ số và bắt đầu bằng 26 (K26).';
    END IF;
    IF EXISTS (SELECT 1 FROM unnest(v_emails) e WHERE e IS NULL OR e NOT LIKE CASE WHEN v_test THEN '%@student.hcmute.edu.vn' ELSE '26%@student.hcmute.edu.vn' END) THEN
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
