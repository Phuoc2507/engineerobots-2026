-- 0016: Rà soát bảo mật + hiệu năng (29/10/2026)
--  • head_declare_winner: bỏ quyền gọi của anon (hàm vẫn tự kiểm tra trọng tài chính, đây là phòng thủ thêm).
--  • cast_vote: chặn spam phiếu bằng cách đổi "dấu vân tay" liên tục. Mỗi mạng (IP, lưu dạng băm)
--    tối đa 120 phiếu mới / 10 phút: đủ cho cả khán đài dùng chung wifi, chặn được script bơm phiếu.
--  • Index cho các khóa ngoại hay dùng để join (lịch thi, xếp hạng, bình chọn, đặt sa bàn).

REVOKE EXECUTE ON FUNCTION public.head_declare_winner(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.head_declare_winner(UUID, TEXT, TEXT) TO authenticated;

ALTER TABLE fan_votes ADD COLUMN IF NOT EXISTS voter_ip TEXT;
CREATE INDEX IF NOT EXISTS fan_votes_ip_time_idx ON fan_votes (voter_ip, created_at);

CREATE OR REPLACE FUNCTION public.cast_vote(p_fingerprint TEXT, p_team UUID, p_category TEXT DEFAULT 'MOST_CREATIVE_ROBOT')
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    h JSON := nullif(current_setting('request.headers', true), '')::JSON;
    v_ip TEXT := nullif(trim(coalesce(h ->> 'cf-connecting-ip', split_part(h ->> 'x-forwarded-for', ',', 1))), '');
BEGIN
    IF NOT coalesce((SELECT (value #>> '{}')::BOOLEAN FROM app_settings WHERE key = 'voting_open'), false) THEN
        RAISE EXCEPTION 'Cổng bình chọn chưa mở.';
    END IF;
    IF p_fingerprint IS NULL OR length(p_fingerprint) NOT BETWEEN 16 AND 100 THEN RAISE EXCEPTION 'Phiếu không hợp lệ.'; END IF;
    IF p_category NOT IN ('MOST_CREATIVE_ROBOT', 'BEST_DESIGN', 'FAN_FAVORITE') THEN RAISE EXCEPTION 'Hạng mục không hợp lệ.'; END IF;
    IF NOT EXISTS (SELECT 1 FROM teams WHERE id = p_team AND status = 'APPROVED') THEN RAISE EXCEPTION 'Đội không hợp lệ.'; END IF;

    v_ip := md5('erobot-vote:' || v_ip);
    IF v_ip IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM fan_votes WHERE voter_fingerprint = p_fingerprint AND vote_category = p_category)
       AND (SELECT count(*) FROM fan_votes WHERE voter_ip = v_ip AND created_at > now() - INTERVAL '10 minutes') >= 120 THEN
        RAISE EXCEPTION 'Mạng của bạn gửi quá nhiều phiếu, thử lại sau ít phút.';
    END IF;

    INSERT INTO fan_votes (voter_fingerprint, voted_team_id, vote_category, voter_ip) VALUES (p_fingerprint, p_team, p_category, v_ip)
    ON CONFLICT (voter_fingerprint, vote_category) DO UPDATE SET voted_team_id = EXCLUDED.voted_team_id, created_at = now();
END;
$$;

CREATE INDEX IF NOT EXISTS fan_votes_team_idx ON fan_votes (voted_team_id);
CREATE INDEX IF NOT EXISTS matches_red_team_idx ON matches (red_team_id);
CREATE INDEX IF NOT EXISTS matches_blue_team_idx ON matches (blue_team_id);
CREATE INDEX IF NOT EXISTS matches_winner_team_idx ON matches (winner_team_id);
CREATE INDEX IF NOT EXISTS match_appeals_team_idx ON match_appeals (team_id);
CREATE INDEX IF NOT EXISTS match_appeals_event_idx ON match_appeals (event_id);
CREATE INDEX IF NOT EXISTS practice_bookings_team_idx ON practice_arena_bookings (team_id);
CREATE INDEX IF NOT EXISTS team_members_user_idx ON team_members (user_id);
