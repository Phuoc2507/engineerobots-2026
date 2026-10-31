-- BTC xóa hẳn một đội (hồ sơ rác / đăng ký nhầm). Thành viên, lịch chạy thử, khiếu nại, phiếu bình chọn
-- xóa theo ON DELETE CASCADE; đội đã có trong lịch thi đấu thì phải xóa trận trước để không mất kết quả.
CREATE OR REPLACE FUNCTION public.admin_delete_team(p_team_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xóa đội.'; END IF;
    PERFORM 1 FROM teams WHERE id = p_team_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy đội.'; END IF;
    IF EXISTS (SELECT 1 FROM matches WHERE p_team_id IN (red_team_id, blue_team_id, winner_team_id)) THEN
        RAISE EXCEPTION 'Đội đã có trong lịch thi đấu — xóa các trận chưa đấu của đội trước. Trận đã đấu thì không xóa được đội.';
    END IF;
    DELETE FROM teams WHERE id = p_team_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_team(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_team(UUID) TO authenticated;
