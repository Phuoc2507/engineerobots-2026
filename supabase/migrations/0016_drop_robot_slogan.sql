-- 0016: Bỏ tên robot và slogan khỏi đăng ký (web không hỏi nữa). Cột teams.robot_name / slogan vẫn giữ cho dữ liệu cũ,
--  chỉ bỏ cột "Robot" khỏi Google Sheet (tab teams, standings).

CREATE OR REPLACE FUNCTION public.sheet_export(p_key TEXT, p_dataset TEXT)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v JSON;
BEGIN
    IF p_key IS NULL OR length(p_key) < 32 OR NOT EXISTS (SELECT 1 FROM sheet_export_keys WHERE key = p_key) THEN
        RAISE EXCEPTION 'Khóa Google Sheet không hợp lệ.';
    END IF;

    IF p_dataset = 'teams' THEN
        SELECT json_agg(r ORDER BY r."Đăng ký lúc") INTO v FROM (
            SELECT t.team_name AS "Đội", t.major AS "Ngành", t.cohort AS "Khóa",
                   CASE t.status WHEN 'APPROVED' THEN 'Đã duyệt' WHEN 'REJECTED' THEN 'Cần bổ sung' ELSE 'Chờ duyệt' END AS "Trạng thái",
                   CASE WHEN t.inspection_passed THEN 'Đạt' ELSE '' END AS "Kiểm tra KT",
                   (SELECT count(*) FROM team_members m WHERE m.team_id = t.id)::INT AS "Số TV",
                   t.leader_email AS "Email đội trưởng", t.leader_phone AS "SĐT đội trưởng",
                   to_char(t.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI') AS "Đăng ký lúc",
                   t.review_note AS "Ghi chú duyệt"
            FROM teams t) r;
    ELSIF p_dataset = 'members' THEN
        SELECT json_agg(r ORDER BY r."Đội", r."Vai trò") INTO v FROM (
            SELECT t.team_name AS "Đội",
                   CASE m.role WHEN 'LEADER' THEN 'Đội trưởng' WHEN 'PILOT' THEN 'Pilot' ELSE 'Thành viên' END AS "Vai trò",
                   m.student_id AS "MSSV", m.full_name AS "Họ tên", m.email AS "Email", m.phone AS "SĐT",
                   CASE t.status WHEN 'APPROVED' THEN 'Đã duyệt' WHEN 'REJECTED' THEN 'Cần bổ sung' ELSE 'Chờ duyệt' END AS "Trạng thái đội"
            FROM team_members m JOIN teams t ON t.id = m.team_id) r;
    ELSIF p_dataset = 'matches' THEN
        SELECT json_agg(r ORDER BY r."Giờ thi đấu" NULLS LAST, r."Mã trận") INTO v FROM (
            SELECT m.match_code AS "Mã trận", m.stage AS "Vòng",
                   to_char(m.start_time AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI') AS "Giờ thi đấu",
                   rt.team_name AS "Đội Đỏ", m.red_score AS "Điểm Đỏ", m.blue_score AS "Điểm Xanh", bt.team_name AS "Đội Xanh",
                   m.status AS "Trạng thái", wt.team_name AS "Đội thắng"
            FROM matches m
            LEFT JOIN teams rt ON rt.id = m.red_team_id
            LEFT JOIN teams bt ON bt.id = m.blue_team_id
            LEFT JOIN teams wt ON wt.id = m.winner_team_id) r;
    ELSIF p_dataset = 'standings' THEN
        SELECT json_agg(json_build_object(
                   'Vòng', s.stage, 'Đội', s.team_name, 'Trận', s.played, 'Thắng', s.won,
                   'Hòa', s.drawn, 'Thua', s.lost, 'Điểm XH', s.points, 'Lỗi', s.fouls,
                   'Điểm ghi', s.score_for, 'Điểm thua', s.score_against)) INTO v
        FROM public.get_standings() s;
    ELSIF p_dataset = 'votes' THEN
        SELECT json_agg(json_build_object('Hạng mục', r.vote_category, 'Đội', r.team_name, 'Lượt bình chọn', r.votes)) INTO v
        FROM public.vote_results() r;
    ELSIF p_dataset = 'practice' THEN
        SELECT json_agg(r ORDER BY r."Bắt đầu") INTO v FROM (
            SELECT to_char(s.starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI') AS "Bắt đầu",
                   to_char(s.ends_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'HH24:MI') AS "Kết thúc",
                   s.location AS "Địa điểm", t.team_name AS "Đội", b.status AS "Trạng thái",
                   to_char(b.check_in_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI') AS "Check-in"
            FROM practice_arena_bookings b
            JOIN practice_slots s ON s.id = b.slot_id
            JOIN teams t ON t.id = b.team_id) r;
    ELSE
        RAISE EXCEPTION 'Bảng không hỗ trợ: %', p_dataset;
    END IF;
    RETURN coalesce(v, '[]'::JSON);
END;
$$;
