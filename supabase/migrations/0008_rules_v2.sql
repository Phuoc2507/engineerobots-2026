-- 0008: Thể lệ 26/TB-BTC-ENGINEEROBOTS bản cập nhật 24/10/2026
-- Checkpoint Chặng 1, Trạm thành tựu, Cơ hội vàng +25, Cầu Bản lĩnh, cứ điểm có tên,
-- Vinh quang chỉ tính khi giữ ≥ 1 cứ điểm góc, khiếu nại 2 phút, 1 cảnh cáo rồi truất quyền.
-- Giữ nguyên các rule_key cũ để không vỡ dữ liệu trận đã ghi.

-- Luật mới
INSERT INTO scoring_rules (rule_key, rule_name, score_value, max_per_match, is_active, description) VALUES
    ('STAGE1_CHECKPOINT', 'Qua Checkpoint Chặng 1', 10, 1, true, 'Toàn bộ xe đi qua vạch Checkpoint cuối Đường Danh vọng; lưu vị trí Retry tại đó'),
    ('FOUL_BARRIER', 'Đâm rào chắn (Chặng 1)', -5, NULL, true, 'Mỗi lần robot đâm vào rào chắn ở Chặng 1'),
    ('FOUL_LEAVE_C2', 'Ra khỏi khu vực Chặng 2', -10, NULL, true, 'Theo bảng tổng hợp điểm của thể lệ (phần mô tả ghi -15; BTC chỉnh nếu cần)'),
    ('FOUL_LEAVE_C3', 'Ra khỏi khu vực Chặng 3', -10, NULL, true, 'Mỗi lần robot ra khỏi khu vực Chặng 3'),
    ('STAGE3_BRIDGE', 'Vượt Cầu Bản lĩnh', 10, 1, true, 'Toàn bộ thân xe qua khỏi Cầu Bản lĩnh'),
    ('FOUL_BRIDGE_PARK', 'Chiếm giữ Cầu Bản lĩnh quá 15 giây', -15, NULL, true, 'Robot đứng trên cầu quá 15 giây, buộc lùi về')
ON CONFLICT (rule_key) DO UPDATE SET rule_name = EXCLUDED.rule_name, score_value = EXCLUDED.score_value,
    max_per_match = EXCLUDED.max_per_match, is_active = EXCLUDED.is_active, description = EXCLUDED.description;

-- Cập nhật luật cũ
UPDATE scoring_rules SET rule_name = 'Về đích Chặng 1', score_value = 20, max_per_match = 1, is_active = true,
    description = '≥ 2 bánh dẫn động cắt vạch chữ T 300 mm cuối Đường Thách thức' WHERE rule_key = 'STAGE1_FINISH';
UPDATE scoring_rules SET rule_name = 'Mất line (Chặng 1)', score_value = -5, max_per_match = NULL, is_active = true,
    description = 'Mỗi lần mất line; đội được Retry (tính 1 lần Retry)' WHERE rule_key = 'STAGE1_OFF_TRACK';
UPDATE scoring_rules SET rule_name = 'Cấu kiện Kiến thức vào Trạm thành tựu', score_value = 15, max_per_match = 3, is_active = true,
    description = 'Nằm hoàn toàn trên mặt sàn và trọn trong Trạm thành tựu của đội lúc hết giờ' WHERE rule_key = 'STAGE2_BLOCK';
UPDATE scoring_rules SET rule_name = 'Cấu kiện Cơ hội vàng vào Trạm thành tựu', score_value = 25, max_per_match = 1, is_active = true,
    description = 'Chỉ Vòng Chung kết; cần ≥ 2 khối Kiến thức trước; mở khóa Chặng 3' WHERE rule_key = 'STAGE2_GOLDEN_BLOCK';
UPDATE scoring_rules SET rule_name = 'Cố ý ngăn chặn đối phương ghi điểm', score_value = -10,
    description = 'Mỗi lần cố ý ngăn chặn đối phương ghi điểm' WHERE rule_key = 'FOUL_GATE_BLOCKING';
UPDATE scoring_rules SET rule_name = 'Xuất phát sớm', score_value = -5,
    description = 'Dừng robot và đưa về vị trí ban đầu' WHERE rule_key = 'FOUL_FALSE_START';
UPDATE scoring_rules SET rule_name = 'Can thiệp Trạm thành tựu đối phương', score_value = -20,
    description = 'Phục hồi cấu kiện về nguyên trạng' WHERE rule_key = 'FOUL_INVADE_ZONE';
UPDATE scoring_rules SET rule_name = 'Chạm vào robot / sa bàn khi chưa được phép', score_value = -10 WHERE rule_key = 'FOUL_HAND_TOUCH';
UPDATE scoring_rules SET rule_name = 'Cứ điểm góc (Năng động, Sáng tạo, Hội nhập, Bền vững)', score_value = 20,
    description = 'Tự tính: mặt màu đội ngửa lên, nghiêng < 45° lúc hết giờ' WHERE rule_key = 'STAGE3_CORNER_POINT';
UPDATE scoring_rules SET rule_name = 'Cứ điểm Vinh quang', score_value = 50,
    description = 'Tự tính; chỉ được công nhận khi đội giữ ≥ 1 cứ điểm góc' WHERE rule_key = 'STAGE3_MASTER_POINT';
UPDATE scoring_rules SET rule_name = 'Cảnh cáo hành vi', max_per_match = 2,
    description = '1 lần cảnh cáo; tái phạm bị truất quyền thi đấu' WHERE rule_key = 'WARNING';

-- Luật không còn trong thể lệ
UPDATE scoring_rules SET is_active = false WHERE rule_key IN ('FOUL_MULTI_GRAB', 'FOUL_WALL_CLIMB', 'STAGE3_GATE_PASS');

UPDATE app_settings SET value = '2', updated_at = now() WHERE key = 'appeal_window_minutes';

-- Vinh quang chỉ tính khi đội giữ ít nhất 1 cứ điểm góc
CREATE OR REPLACE FUNCTION public._arena_score(p_match uuid, p_color text)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    WITH own AS (
        SELECT count(*) FILTER (WHERE NOT is_golden_core) AS corners,
               bool_or(is_golden_core) AS glory
        FROM arena_control_points WHERE match_id = p_match AND current_owner = p_color
    )
    SELECT (corners * (SELECT score_value FROM scoring_rules WHERE rule_key = 'STAGE3_CORNER_POINT')
            + CASE WHEN coalesce(glory, false) AND corners > 0
                   THEN (SELECT score_value FROM scoring_rules WHERE rule_key = 'STAGE3_MASTER_POINT') ELSE 0 END)::INT
    FROM own;
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
    INSERT INTO arena_control_points (match_id, point_index, point_name, is_golden_core)
    SELECT p_match, i, (ARRAY['Năng động', 'Sáng tạo', 'Hội nhập', 'Bền vững', 'Cứ điểm Vinh quang'])[i], i = 5
    FROM generate_series(1, 5) i;
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
        IF NOT EXISTS (SELECT 1 FROM arena_control_points WHERE match_id = p_match AND is_golden_core AND current_owner = p_color)
           OR (SELECT count(*) FROM arena_control_points WHERE match_id = p_match AND NOT is_golden_core AND current_owner = p_color) < 3 THEN
            RAISE EXCEPTION 'Chưa đủ điều kiện Chiến thắng tuyệt đối: cần Cứ điểm Vinh quang và ít nhất 3/4 cứ điểm góc.';
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

-- Đổi tên cứ điểm của các trận chưa kết thúc
UPDATE arena_control_points c SET point_name = (ARRAY['Năng động', 'Sáng tạo', 'Hội nhập', 'Bền vững', 'Cứ điểm Vinh quang'])[c.point_index]
WHERE c.point_index BETWEEN 1 AND 5;
