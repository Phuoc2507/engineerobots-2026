-- 0015: Bỏ bước "thành viên xác nhận"; thêm nhầm thì đội báo BTC, BTC sửa ở /admin/teams.
--  • admin_update_member: BTC sửa MSSV / họ tên / email / SĐT một thành viên (đổi email → bỏ liên kết tài khoản cũ).
--    Sửa đội trưởng thì cập nhật luôn leader_email / leader_phone của đội.
--  • claim_membership: đội trưởng mới (BTC đổi email) đăng nhập lần đầu sẽ được gắn leader_user_id.

CREATE OR REPLACE FUNCTION public.admin_update_member(p_member_id UUID, p_student_id TEXT, p_full_name TEXT, p_email TEXT, p_phone TEXT)
RETURNS VOID
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
    IF v_email NOT LIKE '%@student.hcmute.edu.vn' THEN RAISE EXCEPTION 'Email phải là email trường @student.hcmute.edu.vn.'; END IF;
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

    UPDATE teams SET leader_user_id = auth.uid()
    WHERE lower(leader_email) = lower(auth.jwt() ->> 'email') AND leader_user_id IS NULL;

    IF v_team_id IS NULL THEN
        SELECT team_id INTO v_team_id FROM team_members WHERE lower(email) = lower(auth.jwt() ->> 'email');
    END IF;
    RETURN v_team_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_member(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_member(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
