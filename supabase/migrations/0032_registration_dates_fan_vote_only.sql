-- Thời gian đăng ký chính thức 02/11 – hết ngày 11/11/2026: hạn đóng khớp SITE.registrationDeadline.
CREATE OR REPLACE FUNCTION public.registration_open()
RETURNS boolean
LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT now() <= TIMESTAMPTZ '2026-11-11 23:59:59+07'; $$;

-- Bình chọn khán giả chỉ còn hạng mục "Đội được yêu thích nhất" (khớp VOTE_CATEGORIES)
CREATE OR REPLACE FUNCTION public.cast_vote(p_fingerprint text, p_team uuid, p_category text DEFAULT 'FAN_FAVORITE')
RETURNS void
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
    IF p_category IS DISTINCT FROM 'FAN_FAVORITE' THEN RAISE EXCEPTION 'Hạng mục không hợp lệ.'; END IF;
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
