-- 0037: lập được biên bản khi không có thay đổi điểm (trận bình thường, khiếu nại bị bác) để lưu hồ sơ.
-- Thêm loại CONFIRM "Xác nhận kết quả": chỉ dùng cho trận đã kết thúc và không kèm thay đổi điểm.
ALTER TABLE public.match_minutes DROP CONSTRAINT IF EXISTS match_minutes_reason_type_check;
ALTER TABLE public.match_minutes ADD CONSTRAINT match_minutes_reason_type_check
    CHECK (reason_type IN ('CONFIRM', 'INPUT_ERROR', 'APPEAL', 'REVIEW', 'OTHER'));

CREATE OR REPLACE FUNCTION public.head_revise_match(
    p_match uuid, p_reason_type text, p_reason text, p_remove uuid[], p_add jsonb, p_signatures jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
    v matches%ROWTYPE;
    v_after matches%ROWTYPE;
    r scoring_rules%ROWTYPE;
    a JSONB;
    s JSONB;
    v_removed JSONB := '[]'::jsonb;
    v_added JSONB := '[]'::jsonb;
    v_n INT := coalesce(array_length(p_remove, 1), 0);
    v_color TEXT;
    v_type TEXT;
    v_value INT;
    v_decl TEXT;
    v_seq INT;
    v_id UUID;
    v_changed BOOLEAN;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính hoặc BTC được lập biên bản.'; END IF;
    IF p_reason_type NOT IN ('CONFIRM', 'INPUT_ERROR', 'APPEAL', 'REVIEW', 'OTHER') THEN RAISE EXCEPTION 'Loại biên bản không hợp lệ.'; END IF;
    IF coalesce(trim(p_reason), '') = '' THEN RAISE EXCEPTION 'Cần ghi nội dung / lý do lập biên bản.'; END IF;
    p_add := coalesce(p_add, '[]'::jsonb);
    IF jsonb_typeof(p_add) <> 'array' THEN RAISE EXCEPTION 'Danh sách điểm thêm không hợp lệ.'; END IF;
    v_changed := v_n > 0 OR jsonb_array_length(p_add) > 0;
    IF p_reason_type = 'CONFIRM' AND v_changed THEN
        RAISE EXCEPTION 'Biên bản xác nhận kết quả không kèm thay đổi điểm. Chọn lý do khác hoặc bỏ các thay đổi.';
    END IF;

    IF jsonb_typeof(p_signatures) IS DISTINCT FROM 'array' OR jsonb_array_length(p_signatures) < 2 THEN
        RAISE EXCEPTION 'Cần ít nhất 2 chữ ký của các bên liên quan.';
    END IF;
    FOR s IN SELECT * FROM jsonb_array_elements(p_signatures) LOOP
        IF coalesce(trim(s->>'name'), '') = '' OR coalesce(trim(s->>'role'), '') = '' THEN
            RAISE EXCEPTION 'Mỗi chữ ký cần ghi rõ họ tên và vai trò.';
        END IF;
        IF coalesce(s->>'image', '') !~ '^data:image/png;base64,' OR length(s->>'image') > 300000 THEN
            RAISE EXCEPTION 'Chữ ký của % chưa hợp lệ.', s->>'name';
        END IF;
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_signatures) x WHERE x->>'role' = 'HEAD_REFEREE') THEN
        RAISE EXCEPTION 'Biên bản cần chữ ký của Trọng tài chính.';
    END IF;

    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED', 'FINISHED') THEN RAISE EXCEPTION 'Trận chưa bắt đầu.'; END IF;
    IF p_reason_type = 'CONFIRM' AND v.status <> 'FINISHED' THEN RAISE EXCEPTION 'Trận chưa kết thúc nên chưa xác nhận được kết quả.'; END IF;

    IF v_n > 0 THEN
        SELECT coalesce(jsonb_agg(to_jsonb(e) - 'referee_id' ORDER BY e.created_at), '[]'::jsonb) INTO v_removed
        FROM match_events e WHERE e.match_id = p_match AND e.id = ANY (p_remove);
        IF jsonb_array_length(v_removed) <> v_n THEN
            RAISE EXCEPTION 'Có sự kiện không thuộc trận này hoặc đã bị xóa trước đó. Tải lại trang rồi lập lại biên bản.';
        END IF;
        DELETE FROM match_events WHERE match_id = p_match AND id = ANY (p_remove);
    END IF;

    FOR a IN SELECT * FROM jsonb_array_elements(p_add) LOOP
        v_color := a->>'color';
        IF v_color IS NULL OR v_color NOT IN ('RED', 'BLUE') THEN RAISE EXCEPTION 'Phe không hợp lệ.'; END IF;
        IF a ? 'delta' THEN
            v_type := 'ADJUST';
            v_value := (a->>'delta')::int;
            IF v_value = 0 OR abs(v_value) > 500 THEN RAISE EXCEPTION 'Điểm điều chỉnh tay không hợp lệ.'; END IF;
        ELSE
            SELECT * INTO r FROM scoring_rules WHERE rule_key = a->>'rule_key' AND is_active;
            IF r.id IS NULL OR r.rule_key IN ('STAGE3_CORNER_POINT', 'STAGE3_MASTER_POINT', 'STAGE3_LAMP_SECOND') THEN
                RAISE EXCEPTION 'Mục điểm % không hợp lệ.', a->>'rule_key';
            END IF;
            IF r.max_per_match IS NOT NULL AND (SELECT count(*) FROM match_events
                    WHERE match_id = p_match AND team_color = v_color AND event_type = r.rule_key) >= r.max_per_match THEN
                RAISE EXCEPTION '% của phe % đã đạt tối đa % lần.', r.rule_name, CASE v_color WHEN 'RED' THEN 'Đỏ' ELSE 'Xanh' END, r.max_per_match;
            END IF;
            v_type := r.rule_key;
            v_value := r.score_value;
            IF r.rule_key = 'STAGE3_LAMP' AND coalesce((a->>'second')::boolean, EXISTS (SELECT 1 FROM match_events
                    WHERE match_id = p_match AND event_type = 'STAGE3_LAMP' AND team_color <> v_color)) THEN
                v_value := public._rule_value('STAGE3_LAMP_SECOND');
            END IF;
        END IF;
        INSERT INTO match_events (match_id, team_color, event_type, point_value, referee_id, notes)
        VALUES (p_match, v_color, v_type, v_value, auth.uid(), nullif(trim(a->>'notes'), ''))
        RETURNING id INTO v_id;
        v_added := v_added || jsonb_build_array(jsonb_build_object(
            'id', v_id, 'team_color', v_color, 'event_type', v_type, 'point_value', v_value, 'notes', nullif(trim(a->>'notes'), '')));
    END LOOP;

    -- Không có thay đổi thì giữ nguyên điểm và đội thắng, chỉ lưu biên bản
    IF v_changed THEN
        PERFORM public._recompute_score(p_match);
        IF v.status = 'FINISHED' THEN
            -- Giữ kết quả xử thắng (tuyệt đối / truất quyền / đồng xu) nếu sự kiện đó còn; nếu không, xét lại theo điểm và chỉ số phụ
            SELECT team_color INTO v_decl FROM match_events
            WHERE match_id = p_match AND event_type IN ('KNOCKOUT', 'FORFEIT', 'COIN_TOSS')
            ORDER BY created_at DESC LIMIT 1;
            UPDATE matches SET winner_team_id = CASE v_decl WHEN 'RED' THEN red_team_id WHEN 'BLUE' THEN blue_team_id
                                                            ELSE public._tiebreak_winner(p_match) END,
                               updated_at = now()
            WHERE id = p_match;
        END IF;
    END IF;
    SELECT * INTO v_after FROM matches WHERE id = p_match;

    SELECT coalesce(max(seq), 0) + 1 INTO v_seq FROM match_minutes WHERE match_id = p_match;
    INSERT INTO match_minutes (match_id, seq, reason_type, reason, changes, red_before, blue_before, red_after, blue_after,
                               winner_before, winner_after, signatures, created_by)
    VALUES (p_match, v_seq, p_reason_type, trim(p_reason), jsonb_build_object('removed', v_removed, 'added', v_added),
            v.red_score, v.blue_score, v_after.red_score, v_after.blue_score, v.winner_team_id, v_after.winner_team_id,
            (SELECT jsonb_agg(jsonb_build_object('role', x->>'role', 'name', trim(x->>'name'), 'image', x->>'image', 'signed_at', now()))
             FROM jsonb_array_elements(p_signatures) x),
            lower(auth.jwt() ->> 'email'))
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;
