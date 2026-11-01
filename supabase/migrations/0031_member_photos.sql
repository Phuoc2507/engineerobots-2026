-- Ảnh rõ mặt của từng thành viên để BTC đối chiếu khi điểm danh / check-in.
-- Ảnh nằm ở bucket riêng tư member-photos, đường dẫn <team_id>/<tên ngẫu nhiên>.jpg.
-- Bảng member_photos gắn ảnh theo (đội, email) chứ không theo team_members.id,
-- vì update_team xóa rồi chèn lại thành viên mỗi lần đội trưởng sửa hồ sơ.
-- Chỉ đội trưởng được đổi ảnh; thành viên trong đội và staff được xem.

CREATE TABLE IF NOT EXISTS public.member_photos (
    team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email      TEXT NOT NULL,
    path       TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, email)
);
ALTER TABLE public.member_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read own team photos" ON public.member_photos;
CREATE POLICY "Members read own team photos" ON public.member_photos
    FOR SELECT TO authenticated USING (team_id IN (SELECT public.my_team_ids()));
DROP POLICY IF EXISTS "Staff read photos" ON public.member_photos;
CREATE POLICY "Staff read photos" ON public.member_photos
    FOR SELECT TO authenticated USING (public.is_staff());

-- Đội do người đang đăng nhập làm đội trưởng
CREATE OR REPLACE FUNCTION public.my_led_team_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT id FROM teams WHERE lower(leader_email) = lower(auth.jwt() ->> 'email');
$$;

-- Ghi ảnh mới cho một thành viên, trả về đường dẫn ảnh cũ để client xóa khỏi bucket
CREATE OR REPLACE FUNCTION public.set_member_photo(p_email text, p_path text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_team_id UUID;
    v_email   TEXT := lower(trim(p_email));
    v_old     TEXT;
BEGIN
    SELECT id INTO v_team_id FROM teams WHERE lower(leader_email) = lower(auth.jwt() ->> 'email') LIMIT 1;
    IF v_team_id IS NULL THEN RAISE EXCEPTION 'Chỉ đội trưởng được cập nhật ảnh thành viên.'; END IF;
    IF NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = v_team_id AND lower(email) = v_email) THEN
        RAISE EXCEPTION 'Email không thuộc thành viên nào của đội.';
    END IF;
    IF p_path IS NULL OR p_path NOT LIKE v_team_id::text || '/%' THEN
        RAISE EXCEPTION 'Đường dẫn ảnh không hợp lệ.';
    END IF;
    SELECT path INTO v_old FROM member_photos WHERE team_id = v_team_id AND email = v_email;
    INSERT INTO member_photos (team_id, email, path, updated_at) VALUES (v_team_id, v_email, p_path, now())
    ON CONFLICT (team_id, email) DO UPDATE SET path = excluded.path, updated_at = now();
    RETURN v_old;
END;
$$;

REVOKE ALL ON FUNCTION public.my_led_team_ids()            FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_member_photo(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_led_team_ids()            TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_member_photo(text, text) TO authenticated;

-- Bucket riêng tư, ảnh đã được nén ở trình duyệt nên giới hạn 2 MB là đủ
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('member-photos', 'member-photos', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

DROP POLICY IF EXISTS "Member photos read" ON storage.objects;
CREATE POLICY "Member photos read" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'member-photos'
           AND ((storage.foldername(name))[1] IN (SELECT public.my_team_ids()::text) OR public.is_staff()));
DROP POLICY IF EXISTS "Member photos leader upload" ON storage.objects;
CREATE POLICY "Member photos leader upload" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'member-photos' AND (storage.foldername(name))[1] IN (SELECT public.my_led_team_ids()::text));
DROP POLICY IF EXISTS "Member photos leader delete" ON storage.objects;
CREATE POLICY "Member photos leader delete" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'member-photos' AND (storage.foldername(name))[1] IN (SELECT public.my_led_team_ids()::text));

-- Trả thêm photo_path của từng thành viên cho trang check-in
CREATE OR REPLACE FUNCTION public.staff_lookup_team_by_qr(p_token text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_team teams%ROWTYPE;
    v_today DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ BTC/trọng tài được quét mã.'; END IF;
    SELECT * INTO v_team FROM teams WHERE qr_code_token = lower(trim(p_token));
    IF v_team.id IS NULL THEN RAISE EXCEPTION 'Mã QR không thuộc đội nào.'; END IF;
    RETURN jsonb_build_object(
        'team', jsonb_build_object('id', v_team.id, 'team_name', v_team.team_name, 'robot_name', v_team.robot_name,
                                   'major', v_team.major, 'status', v_team.status,
                                   'inspection_passed', v_team.inspection_passed,
                                   'inspection_data', v_team.inspection_data, 'inspection_at', v_team.inspection_at),
        'members', coalesce((SELECT jsonb_agg(jsonb_build_object('full_name', m.full_name, 'student_id', m.student_id, 'role', m.role,
                                                                 'photo_path', p.path)
                                              ORDER BY m.role, m.full_name)
                             FROM team_members m
                             LEFT JOIN member_photos p ON p.team_id = m.team_id AND p.email = lower(m.email)
                             WHERE m.team_id = v_team.id), '[]'),
        'bookings', coalesce((SELECT jsonb_agg(jsonb_build_object('id', b.id, 'starts_at', s.starts_at, 'ends_at', s.ends_at,
                                                                  'location', s.location, 'status', b.status, 'check_in_at', b.check_in_at)
                                               ORDER BY s.starts_at)
                              FROM practice_arena_bookings b JOIN practice_slots s ON s.id = b.slot_id
                              WHERE b.team_id = v_team.id AND b.status <> 'CANCELLED'
                                AND (s.starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE = v_today), '[]'),
        'next_match', (SELECT jsonb_build_object('id', m.id, 'match_code', m.match_code, 'stage', m.stage,
                                                 'start_time', m.start_time,
                                                 'color', CASE WHEN m.red_team_id = v_team.id THEN 'RED' ELSE 'BLUE' END)
                       FROM matches m WHERE v_team.id IN (m.red_team_id, m.blue_team_id) AND m.status <> 'FINISHED'
                       ORDER BY m.start_time NULLS LAST LIMIT 1)
    );
END;
$$;
