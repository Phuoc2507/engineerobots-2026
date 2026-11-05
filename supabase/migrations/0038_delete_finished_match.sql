-- 0038: BTC xóa được cả trận đã kết thúc (trận thử, trận nhập nhầm). Trận đang đấu hoặc tạm dừng thì phải kết thúc trước khi xóa.
-- Sự kiện điểm, biên bản, khiếu nại và trạng thái sa bàn của trận bị xóa theo (ON DELETE CASCADE).
CREATE OR REPLACE FUNCTION public.admin_delete_match(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_status TEXT;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xóa trận.'; END IF;
    SELECT status INTO v_status FROM matches WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy trận.'; END IF;
    IF v_status IN ('RUNNING', 'PAUSED') THEN
        RAISE EXCEPTION 'Trận đang đấu, hãy kết thúc trận trước khi xóa.';
    END IF;
    DELETE FROM matches WHERE id = p_id;
END;
$$;

-- Trận đã đấu nay xóa được, nên thông báo khi xóa đội chỉ cần nhắc xóa trận trước
CREATE OR REPLACE FUNCTION public.admin_delete_team(p_team_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xóa đội.'; END IF;
    PERFORM 1 FROM teams WHERE id = p_team_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy đội.'; END IF;
    IF EXISTS (SELECT 1 FROM matches WHERE p_team_id IN (red_team_id, blue_team_id, winner_team_id)) THEN
        RAISE EXCEPTION 'Đội đã có trong lịch thi đấu — xóa các trận của đội ở mục Trận đấu trước.';
    END IF;
    DELETE FROM teams WHERE id = p_team_id;
END;
$$;
