-- 0017: Thể lệ (3) ENGINEERING PATH 2026: robot tự do cơ chế (càng đẩy, con lăn, tay gắp...), cấu kiện là bóng pickleball,
-- 2 Kiến thức mỗi đội, Cơ hội vàng +30, Đồ án đặt lên đế nhỏ trong Ô Bảo vệ 120 × 120 mm, khiếu nại 3 phút.
-- Chiến thắng tuyệt đối cần đủ 2 Kiến thức + Cơ hội vàng + Cầu + Địa hình + Đồ án + Đèn.
-- Giữ rule_key cũ để không vỡ dữ liệu trận đã ghi.

UPDATE scoring_rules SET rule_name = 'Qua Checkpoint Chặng 1', score_value = 10, max_per_match = 1, is_active = true,
    description = 'Toàn bộ xe đi qua hoàn toàn vị trí Checkpoint; Retry sau đó được đặt lại tại Checkpoint' WHERE rule_key = 'STAGE1_CHECKPOINT';
UPDATE scoring_rules SET rule_name = 'Về đích Chặng 1', score_value = 20, max_per_match = 1, is_active = true,
    description = '2 bánh xe cắt ngang vạch chữ T cuối đường line, trong 60 giây' WHERE rule_key = 'STAGE1_FINISH';
UPDATE scoring_rules SET rule_name = 'Mất line (Chặng 1)', score_value = -5, is_active = true,
    description = 'Tất cả bánh xe ra khỏi line đen và không tự phục hồi trong 5 giây' WHERE rule_key = 'STAGE1_OFF_TRACK';
UPDATE scoring_rules SET rule_name = 'Đâm rào / va chạm vách biên (Chặng 1)', score_value = -5, is_active = true,
    description = 'Mỗi lần robot chạm hoặc đâm vào rào chắn, vách biên làn đua' WHERE rule_key = 'FOUL_BARRIER';

UPDATE scoring_rules SET rule_name = 'Cấu kiện Kiến thức vào Trạm thành tựu', score_value = 15, max_per_match = 2, is_active = true,
    description = 'Bóng Kiến thức màu đội vượt gờ chặn, nằm trọn trong Trạm thành tựu 300 × 300 mm (không tự lăn ra)' WHERE rule_key = 'STAGE2_BLOCK';
UPDATE scoring_rules SET rule_name = 'Cấu kiện Cơ hội vàng vào Trạm thành tựu', score_value = 30, max_per_match = 1, is_active = true,
    description = 'Chỉ Vòng Chung kết; cần đủ 2 Kiến thức trước; là chỉ số ưu tiên khi hòa điểm' WHERE rule_key = 'STAGE2_GOLDEN_BLOCK';
UPDATE scoring_rules SET rule_name = 'Đâm húc phá hoại / ép khóa cứng robot đối phương > 5 giây', score_value = -10, is_active = true,
    description = 'Cố ý lấy đà đâm húc gây hư hại, hoặc ép khóa cứng robot đối phương quá 5 giây khi không tranh chấp cấu kiện'
    WHERE rule_key = 'FOUL_GATE_BLOCKING';
UPDATE scoring_rules SET rule_name = 'Rời khỏi khu vực Chặng 2', score_value = -10, is_active = true,
    description = 'Robot hoàn toàn ra khỏi khu vực thi đấu Chặng 2' WHERE rule_key = 'FOUL_LEAVE_C2';
UPDATE scoring_rules SET rule_name = 'Húc văng cấu kiện Kiến thức ra ngoài sân', score_value = -10, is_active = true,
    description = 'Cố ý húc văng bóng Kiến thức của đối phương ra ngoài biên Chặng 2; Trọng tài đặt lại. Tự làm văng bóng của mình thì bóng bị vô hiệu'
    WHERE rule_key = 'FOUL_KNOCK_OUT_BLOCK';

UPDATE scoring_rules SET rule_name = 'Vượt Cầu Bản lĩnh', score_value = 10, max_per_match = 1, is_active = true,
    description = 'Toàn bộ thân xe qua cầu, khi đã có tối thiểu 2 cấu kiện hợp lệ ở Chặng 2' WHERE rule_key = 'STAGE3_BRIDGE';
UPDATE scoring_rules SET rule_name = 'Vượt Đường Thử thách', score_value = 20, max_per_match = 1, is_active = true,
    description = 'Toàn bộ thân xe và bánh xe qua khỏi thanh gờ thứ 5, không đi vòng ra ngoài' WHERE rule_key = 'STAGE3_TERRAIN';
UPDATE scoring_rules SET rule_name = 'Đặt Đồ án lên đế trong Ô Bảo vệ', score_value = 25, max_per_match = 1, is_active = true,
    description = 'Bóng Đồ án từ Trạm Thực nghiệm vượt Dốc Kiên trì, đặt vững trên đế nhỏ trong Ô Bảo vệ 120 × 120 mm trên Đài Bảo vệ'
    WHERE rule_key = 'STAGE3_PROJECT';
UPDATE scoring_rules SET rule_name = 'Bật Đèn Vinh Quang', score_value = 40, max_per_match = 1, is_active = true,
    description = 'Sau khi Đồ án đã ở trên đế: leo Dốc Thăng hoa lên Bục Vinh Quang, nhấn nút trên vách ngăn' WHERE rule_key = 'STAGE3_LAMP';
UPDATE scoring_rules SET rule_name = 'Chạm vạch giới hạn Đường Thử thách', score_value = -5, is_active = true,
    description = 'Nhiệm vụ 1 Chặng 3: robot chạm cạnh giới hạn Đường Thử thách (3.3 / 3.4)' WHERE rule_key = 'FOUL_TERRAIN_LINE';
UPDATE scoring_rules SET rule_name = 'Làm rơi cấu kiện Đồ án', score_value = -5, is_active = true,
    description = 'Nhiệm vụ 2 Chặng 3: bóng rơi khỏi dốc hoặc Đài Bảo vệ; đưa về Trạm Thực nghiệm' WHERE rule_key = 'FOUL_DROP_PROJECT';
UPDATE scoring_rules SET rule_name = 'Rời khỏi khu vực Chặng 3', score_value = -10, is_active = true,
    description = 'Robot ra khỏi khu vực thi đấu Chặng 3' WHERE rule_key = 'FOUL_LEAVE_C3';
UPDATE scoring_rules SET rule_name = 'Lấn sang phần sân đối phương', score_value = -15, is_active = true,
    description = 'Robot sang phần sân độc lập của đối phương ở Chặng 3; buộc Retry về ô 3.1 / 3.2' WHERE rule_key = 'FOUL_CROSS_SIDE';

UPDATE scoring_rules SET rule_name = 'Chạm tay trái phép vào robot', score_value = -10, is_active = true,
    description = 'Chạm vào robot khi chưa có hiệu lệnh đồng ý Retry của Trọng tài' WHERE rule_key = 'FOUL_HAND_TOUCH';
UPDATE scoring_rules SET rule_name = 'Xuất phát sớm', score_value = -5, is_active = true,
    description = 'Bật robot trước hiệu lệnh "Bắt đầu"; dừng robot, trả về vị trí ban đầu' WHERE rule_key = 'FOUL_FALSE_START';
UPDATE scoring_rules SET rule_name = 'Chiếm giữ Cầu Bản lĩnh quá 15 giây', score_value = -15, is_active = true,
    description = 'Cố tình đỗ trên cầu quá 15 giây không thao tác để câu giờ / chặn đối phương; Trọng tài cưỡng chế lùi xe'
    WHERE rule_key = 'FOUL_BRIDGE_PARK';
UPDATE scoring_rules SET rule_name = 'Xâm phạm Trạm thành tựu đối phương', score_value = -20, is_active = true,
    description = 'Tác động vào cấu kiện đã nằm trong Trạm thành tựu của đối phương; phục hồi nguyên trạng' WHERE rule_key = 'FOUL_INVADE_ZONE';

UPDATE app_settings SET value = '3', updated_at = now() WHERE key = 'appeal_window_minutes';

-- Chiến thắng tuyệt đối: đủ toàn bộ lộ trình Chặng 2 + 3 (thể lệ VI.3.2)
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
        IF (SELECT count(*) FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE2_BLOCK') < 2
           OR NOT EXISTS (SELECT 1 FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE2_GOLDEN_BLOCK')
           OR NOT EXISTS (SELECT 1 FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_BRIDGE')
           OR NOT EXISTS (SELECT 1 FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_TERRAIN')
           OR NOT EXISTS (SELECT 1 FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_PROJECT')
           OR NOT EXISTS (SELECT 1 FROM match_events WHERE match_id = p_match AND team_color = p_color AND event_type = 'STAGE3_LAMP') THEN
            RAISE EXCEPTION 'Chưa đủ điều kiện Chiến thắng tuyệt đối: cần 2 Kiến thức, Cơ hội vàng, Cầu, Đường Thử thách, Đồ án và Đèn Vinh Quang.';
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
