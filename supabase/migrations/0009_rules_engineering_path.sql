-- 0009: Thể lệ ENGINEERING PATH 2026 (26/10/2026)
-- Chặng 2: 6 khối Kiến thức (gồm "liên ngành" đoạt từ trạm đối phương), Cơ hội vàng.
-- Chặng 3 chia đôi sân: Cầu +10, Địa hình +20, Bảo vệ Đồ án +25, Đèn Vinh Quang +40.
-- Bỏ cơ chế cứ điểm; Chiến thắng tuyệt đối = bật đèn khi khối Đồ án đã ở Ô bảo vệ.
-- Giữ rule_key cũ để không vỡ dữ liệu trận đã ghi.

INSERT INTO scoring_rules (rule_key, rule_name, score_value, max_per_match, is_active, description) VALUES
    ('STAGE3_TERRAIN', 'Vượt Địa hình Thử thách', 20, 1, true, 'Toàn bộ thân xe qua khỏi vùng Địa hình Chặng 3'),
    ('STAGE3_PROJECT', 'Bảo vệ Đồ án (khối vào Ô bảo vệ)', 25, 1, true, 'Khối Đồ án từ Trạm Thực nghiệm nằm trọn trong Ô bảo vệ trên Đài'),
    ('STAGE3_LAMP', 'Bật Đèn Vinh Quang', 40, 1, true, 'Nhấn nút đèn trên Đỉnh Bục Vinh Quang; đội bật trước khi khối Đồ án đã ở Ô bảo vệ thắng tuyệt đối'),
    ('FOUL_CROSS_SIDE', 'Lấn sang phần sân đối phương', -15, NULL, true, 'Robot vượt vạch giữa Chặng 3 sang nửa sân đối phương; buộc Retry')
ON CONFLICT (rule_key) DO UPDATE SET rule_name = EXCLUDED.rule_name, score_value = EXCLUDED.score_value,
    max_per_match = EXCLUDED.max_per_match, is_active = EXCLUDED.is_active, description = EXCLUDED.description;

UPDATE scoring_rules SET rule_name = 'Cấu kiện Kiến thức vào Trạm thành tựu', score_value = 15, max_per_match = 6, is_active = true,
    description = 'Nằm trọn trong Trạm thành tựu lúc hết giờ; gồm cả khối "liên ngành" lấy từ trạm đối phương sau khi đã có ≥ 2 khối của mình'
    WHERE rule_key = 'STAGE2_BLOCK';
UPDATE scoring_rules SET rule_name = 'Cấu kiện Cơ hội vàng vào Trạm thành tựu', score_value = 25, max_per_match = 1, is_active = true,
    description = 'Cần ≥ 2 khối Kiến thức trước; mở lối sang Chặng 3 qua Cầu Bản lĩnh' WHERE rule_key = 'STAGE2_GOLDEN_BLOCK';
UPDATE scoring_rules SET rule_name = 'Đâm húc phá hoại / khóa chết robot đối phương > 5 giây', score_value = -10, is_active = true,
    description = 'Mỗi lần cố ý đâm húc phá hoại hoặc khóa chết robot đối phương quá 5 giây' WHERE rule_key = 'FOUL_GATE_BLOCKING';
UPDATE scoring_rules SET rule_name = 'Can thiệp Trạm thành tựu đối phương', score_value = -20, is_active = true,
    description = 'Chạm vào trạm đối phương khi không lấy khối liên ngành hợp lệ; phục hồi cấu kiện' WHERE rule_key = 'FOUL_INVADE_ZONE';

-- Cơ chế cứ điểm của thể lệ cũ
UPDATE scoring_rules SET is_active = false WHERE rule_key IN ('STAGE3_CORNER_POINT', 'STAGE3_MASTER_POINT');

CREATE OR REPLACE FUNCTION public._arena_score(p_match uuid, p_color text)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT 0;
$function$;

CREATE OR REPLACE FUNCTION public.head_start(p_match uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v matches%ROWTYPE;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được bắt đầu trận.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('SCHEDULED', 'READY') THEN RAISE EXCEPTION 'Trận đã bắt đầu rồi.'; END IF;
    IF v.red_team_id IS NULL OR v.blue_team_id IS NULL THEN RAISE EXCEPTION 'Trận chưa đủ hai đội.'; END IF;
    IF EXISTS (SELECT 1 FROM teams WHERE id IN (v.red_team_id, v.blue_team_id) AND NOT coalesce(inspection_passed, false)) THEN
        RAISE EXCEPTION 'Cả hai đội phải đạt kiểm tra kỹ thuật trước khi thi đấu.';
    END IF;
    DELETE FROM arena_control_points WHERE match_id = p_match;
    DELETE FROM match_events WHERE match_id = p_match;
    UPDATE matches SET status = 'RUNNING', clock_started_at = now(), started_at = now(),
           remaining_seconds = duration_seconds, red_score = 0, blue_score = 0, winner_team_id = NULL,
           head_referee_id = auth.uid(), updated_at = now()
    WHERE id = p_match;
END;
$function$;

CREATE OR REPLACE FUNCTION public.head_declare_winner(p_match uuid, p_color text, p_kind text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v matches%ROWTYPE;
    v_team UUID;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được xử thắng.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE') THEN RAISE EXCEPTION 'Phe không hợp lệ.'; END IF;
    IF p_kind NOT IN ('KNOCKOUT', 'COIN_TOSS', 'FORFEIT') THEN RAISE EXCEPTION 'Hình thức xử thắng không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    v_team := CASE WHEN p_color = 'RED' THEN v.red_team_id ELSE v.blue_team_id END;
    IF p_kind = 'KNOCKOUT' THEN
        IF v.status NOT IN ('RUNNING', 'PAUSED') THEN RAISE EXCEPTION 'Chiến thắng tuyệt đối chỉ áp dụng khi trận đang diễn ra.'; END IF;
        IF NOT EXISTS (SELECT 1 FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_PROJECT')
           OR NOT EXISTS (SELECT 1 FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_LAMP') THEN
            RAISE EXCEPTION 'Chưa đủ điều kiện Chiến thắng tuyệt đối: cần ghi Bảo vệ Đồ án và Bật Đèn Vinh Quang.';
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
