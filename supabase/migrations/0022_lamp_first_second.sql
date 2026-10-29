-- 0022: Đèn Vinh Quang (user chốt 29/10/2026)
--  • Đội nhấn sáng Đèn Vinh Quang trước trong trận: +40; đội nhấn sau: +10.
--  • Trọng tài vẫn bấm STAGE3_LAMP; ref_add_event tự lấy giá trị STAGE3_LAMP_SECOND
--    nếu đối phương đã có STAGE3_LAMP trong trận.

UPDATE scoring_rules SET
    rule_name = 'Bật Đèn Vinh Quang (trước +40 / sau +10)',
    description = 'Sau khi Đồ án đã ở trên đế: leo Dốc Thăng hoa lên Bục Vinh Quang, nhấn nút trên vách ngăn. Đội nhấn trước +40, đội nhấn sau +10'
    WHERE rule_key = 'STAGE3_LAMP';

INSERT INTO scoring_rules (rule_key, rule_name, score_value, max_per_match, is_active, description) VALUES
    ('STAGE3_LAMP_SECOND', 'Bật Đèn Vinh Quang sau đối phương', 10, 1, true,
     'Giá trị điểm khi đội nhấn đèn sau đối phương; tự áp dụng khi trọng tài ghi STAGE3_LAMP')
ON CONFLICT (rule_key) DO UPDATE SET
    rule_name = EXCLUDED.rule_name, score_value = EXCLUDED.score_value, max_per_match = EXCLUDED.max_per_match,
    is_active = EXCLUDED.is_active, description = EXCLUDED.description;

CREATE OR REPLACE FUNCTION public.ref_add_event(p_match UUID, p_color TEXT, p_rule_key TEXT, p_notes TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
    r scoring_rules%ROWTYPE;
    v_value INT;
    v_id UUID;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ trọng tài được chấm điểm.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE') THEN RAISE EXCEPTION 'Phe không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') AND NOT (v.status = 'FINISHED' AND public.is_head_referee()) THEN
        RAISE EXCEPTION 'Trận chưa bắt đầu hoặc đã kết thúc.';
    END IF;
    SELECT * INTO r FROM scoring_rules WHERE rule_key = p_rule_key AND is_active;
    IF r.id IS NULL THEN RAISE EXCEPTION 'Luật % không tồn tại hoặc đã tắt.', p_rule_key; END IF;
    IF p_rule_key IN ('STAGE3_CORNER_POINT', 'STAGE3_MASTER_POINT', 'STAGE3_LAMP_SECOND') THEN
        RAISE EXCEPTION 'Điểm này được tính tự động.';
    END IF;
    IF r.max_per_match IS NOT NULL AND (SELECT count(*) FROM match_events
            WHERE match_id = p_match AND team_color = p_color AND event_type = p_rule_key) >= r.max_per_match THEN
        RAISE EXCEPTION '% đã đạt tối đa % lần trong trận.', r.rule_name, r.max_per_match;
    END IF;
    v_value := r.score_value;
    -- Đèn Vinh Quang: đội nhấn sau đối phương chỉ được giá trị STAGE3_LAMP_SECOND
    IF p_rule_key = 'STAGE3_LAMP' AND EXISTS (SELECT 1 FROM match_events
            WHERE match_id = p_match AND event_type = 'STAGE3_LAMP' AND team_color <> p_color) THEN
        v_value := public._rule_value('STAGE3_LAMP_SECOND');
    END IF;
    INSERT INTO match_events (match_id, team_color, event_type, point_value, match_timestamp_seconds, referee_id, notes)
    VALUES (p_match, p_color, p_rule_key, v_value, v.duration_seconds - public._live_remaining(v), auth.uid(), p_notes)
    RETURNING id INTO v_id;
    PERFORM public._recompute_score(p_match);
    RETURN v_id;
END;
$$;
