-- 0024: thể lệ CHÍNH THỨC (31/10/2026, thele/TheLe_ChinhThuc.txt)
-- Đèn Vinh Quang: nhấn trước +40, nhấn sau +25; Retry không giới hạn; mô tả lỗi theo bản chính thức;
-- Chiến thắng tuyệt đối phải đúng trình tự. Không xóa rule_key cũ; không cần rule_key lỗi mới
-- (mọi lỗi trong bản chính thức đã có sẵn).

UPDATE scoring_rules SET score_value = 25,
       rule_name = 'Bật Đèn Vinh Quang sau đối phương (+25)',
       description = 'Đội nhấn sáng Đèn Vinh Quang sau khi đối phương đã nhấn: +25 (tự áp dụng khi đối phương đã có STAGE3_LAMP).'
    WHERE rule_key = 'STAGE3_LAMP_SECOND';

UPDATE scoring_rules SET rule_name = 'Bật Đèn Vinh Quang (trước +40 / sau +25)',
       description = 'Bóng Đồ án đã nằm vững trên đế; robot leo Dốc Thăng hoa lên Bục 200 mm, nhấn nút của đội mình trên vách ngăn làm đèn sáng. Đội nhấn trước +40, đội nhấn sau +25.'
    WHERE rule_key = 'STAGE3_LAMP';

UPDATE scoring_rules SET max_per_match = NULL,
       description = 'Retry không giới hạn số lần; phải được Trọng tài cho phép, đặt robot đúng vào ô Retry 410 × 360 mm của chặng. Số lần Retry dùng để xét phụ khi hòa điểm.'
    WHERE rule_key = 'RETRY';

UPDATE scoring_rules SET description = 'Robot ra khỏi khu vực Chặng 2: −10/lần. Cầu Bản lĩnh là vùng chuyển tiếp: robot đã đủ điều kiện lên Chặng 3 đi qua cầu không bị tính lỗi này.'
    WHERE rule_key = 'FOUL_LEAVE_C2';

UPDATE scoring_rules SET description = 'Robot ra khỏi khu vực Chặng 3 của đội mình: −10/lần.'
    WHERE rule_key = 'FOUL_LEAVE_C3';

UPDATE scoring_rules SET description = 'Chạm tay trái phép vào robot khi chưa được Trọng tài cho Retry: −10/lần. Ngoại lệ: 01 thành viên nhấc robot đưa lên đích Chặng 1 sau TIMEOUT 60 giây.'
    WHERE rule_key = 'FOUL_HAND_TOUCH';

UPDATE scoring_rules SET description = 'Chặng 3: robot lấn sang sân đối phương: −15 và phải Retry.'
    WHERE rule_key = 'FOUL_CROSS_SIDE';

UPDATE scoring_rules SET description = 'Cố ý thu thập bóng Cơ hội vàng khi chưa đủ 2 bóng Kiến thức trong Trạm thành tựu: −10/lần (bị đẩy vào bóng vàng không phạt).'
    WHERE rule_key = 'FOUL_TOUCH_GOLDEN';

-- Chiến thắng tuyệt đối: đủ điều kiện VÀ đúng trình tự
-- (2 Kiến thức + Cơ hội vàng) → Cầu → Đường Thử thách → Đồ án → Đèn Vinh Quang
CREATE OR REPLACE FUNCTION public.head_declare_winner(p_match uuid, p_color text, p_kind text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v matches%ROWTYPE;
    v_team UUID;
    t_block2 TIMESTAMPTZ;
    t_gold TIMESTAMPTZ;
    t_bridge TIMESTAMPTZ;
    t_terrain TIMESTAMPTZ;
    t_project TIMESTAMPTZ;
    t_lamp TIMESTAMPTZ;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được xử thắng.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE') THEN RAISE EXCEPTION 'Phe không hợp lệ.'; END IF;
    IF p_kind NOT IN ('KNOCKOUT', 'COIN_TOSS', 'FORFEIT') THEN RAISE EXCEPTION 'Hình thức xử thắng không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    v_team := CASE WHEN p_color = 'RED' THEN v.red_team_id ELSE v.blue_team_id END;
    IF p_kind = 'KNOCKOUT' THEN
        IF v.status NOT IN ('RUNNING', 'PAUSED') THEN RAISE EXCEPTION 'Chiến thắng tuyệt đối chỉ áp dụng khi trận đang diễn ra.'; END IF;
        SELECT created_at INTO t_block2 FROM match_events
            WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE2_BLOCK'
            ORDER BY created_at OFFSET 1 LIMIT 1;
        SELECT min(created_at) INTO t_gold FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE2_GOLDEN_BLOCK';
        SELECT min(created_at) INTO t_bridge FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_BRIDGE';
        SELECT min(created_at) INTO t_terrain FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_TERRAIN';
        SELECT min(created_at) INTO t_project FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_PROJECT';
        SELECT min(created_at) INTO t_lamp FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_LAMP';
        IF t_block2 IS NULL OR t_gold IS NULL OR t_bridge IS NULL OR t_terrain IS NULL OR t_project IS NULL OR t_lamp IS NULL THEN
            RAISE EXCEPTION 'Chưa đủ điều kiện Chiến thắng tuyệt đối: cần 2 Kiến thức, Cơ hội vàng, Cầu, Đường Thử thách, Đồ án và Đèn Vinh Quang.';
        END IF;
        IF greatest(t_block2, t_gold) > t_bridge OR t_bridge > t_terrain OR t_terrain > t_project OR t_project > t_lamp THEN
            RAISE EXCEPTION 'Không đúng trình tự Chiến thắng tuyệt đối: 2 Kiến thức + Cơ hội vàng → Cầu → Đường Thử thách → Đồ án → Đèn Vinh Quang. Nhấn đèn khi chưa đủ trình tự không phải Chiến thắng tuyệt đối.';
        END IF;
    ELSIF p_kind = 'COIN_TOSS' THEN
        IF v.status <> 'FINISHED' OR v.winner_team_id IS NOT NULL THEN
            RAISE EXCEPTION 'Bốc thăm chỉ dùng khi trận đã kết thúc và vẫn hòa.';
        END IF;
    ELSE
        IF v.status NOT IN ('RUNNING', 'PAUSED', 'FINISHED') THEN RAISE EXCEPTION 'Trận chưa bắt đầu.'; END IF;
    END IF;
    PERFORM public._recompute_score(p_match);
    INSERT INTO match_events (match_id, team_color, event_type, point_value, match_timestamp_seconds, referee_id, notes)
    VALUES (p_match, p_color, p_kind, 0, v.duration_seconds - public._live_remaining(v), auth.uid(), NULL);
    UPDATE matches SET status = 'FINISHED', clock_started_at = NULL, timeout_until = NULL, timeout_team = NULL,
           remaining_seconds = CASE WHEN v.status = 'FINISHED' THEN remaining_seconds ELSE public._live_remaining(v) END,
           finished_at = coalesce(finished_at, now()), winner_team_id = v_team, updated_at = now()
    WHERE id = p_match;
END;
$function$;

REVOKE ALL ON FUNCTION public.head_declare_winner(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.head_declare_winner(uuid, text, text) TO authenticated;
