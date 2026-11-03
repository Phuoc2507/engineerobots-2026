-- 0033: Thư ký nhập điểm, biên bản chỉnh điểm có chữ ký, nội dung trang do BTC tự sửa, bốc thăm bảng đấu

-- ============================================================================
-- 1. Thư ký nhập điểm (mỗi thư ký nhập cho 1 phe, trọng tài chính quan sát)
-- ============================================================================
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role IN ('BTC', 'HEAD_REFEREE', 'REFEREE', 'SECRETARY'));

-- Trong trận: thư ký ghi / xóa điểm. Sau khi trận kết thúc mọi thay đổi phải qua biên bản (head_revise_match)
CREATE OR REPLACE FUNCTION public.ref_add_event(p_match uuid, p_color text, p_rule_key text, p_notes text DEFAULT NULL::text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
    v matches%ROWTYPE;
    r scoring_rules%ROWTYPE;
    v_value INT;
    v_id UUID;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ thư ký / trọng tài được nhập điểm.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE') THEN RAISE EXCEPTION 'Phe không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') THEN
        RAISE EXCEPTION 'Trận chưa bắt đầu hoặc đã kết thúc. Sửa điểm sau trận bằng biên bản chỉnh điểm.';
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

CREATE OR REPLACE FUNCTION public.ref_undo_last(p_match uuid, p_color text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
    v matches%ROWTYPE;
    v_id UUID;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ thư ký / trọng tài được hoàn tác.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') THEN
        RAISE EXCEPTION 'Trận đã kết thúc. Sửa điểm sau trận bằng biên bản chỉnh điểm.';
    END IF;
    SELECT id INTO v_id FROM match_events
    WHERE match_id = p_match AND team_color = p_color AND event_type NOT IN ('FLIP', 'ADJUST')
    ORDER BY created_at DESC LIMIT 1;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Không còn sự kiện nào để hoàn tác.'; END IF;
    DELETE FROM match_events WHERE id = v_id;
    PERFORM public._recompute_score(p_match);
END;
$$;

-- Nút "−" trên từng ô: xóa lần ghi gần nhất của đúng mục đó
CREATE OR REPLACE FUNCTION public.ref_remove_event(p_match uuid, p_color text, p_rule_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
    v matches%ROWTYPE;
    v_id UUID;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ thư ký / trọng tài được sửa điểm.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') THEN
        RAISE EXCEPTION 'Trận đã kết thúc. Sửa điểm sau trận bằng biên bản chỉnh điểm.';
    END IF;
    SELECT id INTO v_id FROM match_events
    WHERE match_id = p_match AND team_color = p_color AND event_type = p_rule_key
    ORDER BY created_at DESC LIMIT 1;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Mục này chưa được ghi lần nào.'; END IF;
    DELETE FROM match_events WHERE id = v_id;
    PERFORM public._recompute_score(p_match);
END;
$$;

CREATE OR REPLACE FUNCTION public.head_adjust_score(p_match uuid, p_color text, p_delta integer, p_notes text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
    v matches%ROWTYPE;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được điều chỉnh điểm.'; END IF;
    IF coalesce(trim(p_notes), '') = '' THEN RAISE EXCEPTION 'Cần ghi lý do điều chỉnh.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE') OR p_delta = 0 THEN RAISE EXCEPTION 'Điều chỉnh không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') THEN
        RAISE EXCEPTION 'Trận đã kết thúc. Sửa điểm sau trận bằng biên bản chỉnh điểm.';
    END IF;
    INSERT INTO match_events (match_id, team_color, event_type, point_value, match_timestamp_seconds, referee_id, notes)
    VALUES (p_match, p_color, 'ADJUST', p_delta, v.duration_seconds - public._live_remaining(v), auth.uid(), trim(p_notes));
    PERFORM public._recompute_score(p_match);
END;
$$;

-- ============================================================================
-- 2. Biên bản chỉnh điểm (nhập sai, khiếu nại, phúc khảo) có chữ ký các bên
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.match_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    seq INT NOT NULL,
    reason_type TEXT NOT NULL CHECK (reason_type IN ('INPUT_ERROR', 'APPEAL', 'REVIEW', 'OTHER')),
    reason TEXT NOT NULL,
    changes JSONB NOT NULL,          -- {removed: [sự kiện bị xóa], added: [sự kiện thêm]}
    red_before INT NOT NULL, blue_before INT NOT NULL,
    red_after INT NOT NULL, blue_after INT NOT NULL,
    winner_before UUID, winner_after UUID,
    signatures JSONB NOT NULL,       -- [{role, name, image (PNG data URL), signed_at}]
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (match_id, seq)
);
ALTER TABLE public.match_minutes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Minutes staff read" ON public.match_minutes;
CREATE POLICY "Minutes staff read" ON public.match_minutes FOR SELECT TO authenticated USING (public.is_staff());

-- Áp toàn bộ thay đổi + lưu biên bản trong một giao dịch.
-- p_add: [{color, rule_key, second?, notes?}] hoặc [{color, delta, notes}] (điều chỉnh tay)
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
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính hoặc BTC được lập biên bản chỉnh điểm.'; END IF;
    IF p_reason_type NOT IN ('INPUT_ERROR', 'APPEAL', 'REVIEW', 'OTHER') THEN RAISE EXCEPTION 'Loại biên bản không hợp lệ.'; END IF;
    IF coalesce(trim(p_reason), '') = '' THEN RAISE EXCEPTION 'Cần ghi nội dung / lý do chỉnh điểm.'; END IF;
    p_add := coalesce(p_add, '[]'::jsonb);
    IF jsonb_typeof(p_add) <> 'array' THEN RAISE EXCEPTION 'Danh sách điểm thêm không hợp lệ.'; END IF;
    IF v_n = 0 AND jsonb_array_length(p_add) = 0 THEN RAISE EXCEPTION 'Biên bản chưa có thay đổi điểm nào.'; END IF;

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

-- ============================================================================
-- 3. Nội dung & giao diện trang do BTC tự sửa (mỗi khóa là một mục, trống = dùng mặc định trong code)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY CHECK (key ~ '^[a-z_]{2,40}$'),
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by TEXT
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site content public read" ON public.site_content;
CREATE POLICY "Site content public read" ON public.site_content FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.admin_set_content(p_key text, p_value jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được sửa nội dung trang.'; END IF;
    IF p_value IS NULL THEN
        DELETE FROM site_content WHERE key = p_key;
        RETURN;
    END IF;
    IF jsonb_typeof(p_value) <> 'object' THEN RAISE EXCEPTION 'Nội dung không hợp lệ.'; END IF;
    IF octet_length(p_value::text) > 200000 THEN RAISE EXCEPTION 'Nội dung quá dài.'; END IF;
    IF p_key = 'site' THEN
        BEGIN
            PERFORM (p_value->>'registrationStart')::timestamptz, (p_value->>'registrationDeadline')::timestamptz;
        EXCEPTION WHEN others THEN
            RAISE EXCEPTION 'Thời gian đăng ký không hợp lệ.';
        END;
    END IF;
    INSERT INTO site_content (key, value, updated_at, updated_by) VALUES (p_key, p_value, now(), lower(auth.jwt() ->> 'email'))
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;
END;
$$;

-- Hạn đăng ký lấy theo nội dung BTC đã chỉnh (nếu có)
CREATE OR REPLACE FUNCTION public.registration_open()
RETURNS boolean LANGUAGE sql STABLE SET search_path TO 'public' AS $$
    SELECT now() <= coalesce((SELECT (value->>'registrationDeadline')::timestamptz FROM site_content WHERE key = 'site'),
                             TIMESTAMPTZ '2026-11-11 23:59:59+07');
$$;

-- Kho ấn phẩm công khai (ảnh, poster, video, PDF) — chỉ BTC tải lên / xóa
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-assets', 'site-assets', true, 52428800,
        ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit,
                               allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Site assets admin list" ON storage.objects;
DROP POLICY IF EXISTS "Site assets admin upload" ON storage.objects;
DROP POLICY IF EXISTS "Site assets admin update" ON storage.objects;
DROP POLICY IF EXISTS "Site assets admin delete" ON storage.objects;
CREATE POLICY "Site assets admin list" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'site-assets' AND public.is_admin());
CREATE POLICY "Site assets admin upload" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());
CREATE POLICY "Site assets admin update" ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'site-assets' AND public.is_admin());
CREATE POLICY "Site assets admin delete" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'site-assets' AND public.is_admin());

-- ============================================================================
-- 4. Bốc thăm vị trí bảng đấu (A1, B1, …) bằng vòng quay
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
    groups TEXT[] NOT NULL,
    slots_per_group INT NOT NULL CHECK (slots_per_group BETWEEN 1 AND 32),
    current_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.draw_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    slot_code TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    drawn_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    drawn_by TEXT,
    UNIQUE (draw_id, slot_code),
    UNIQUE (draw_id, team_id)
);
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Draws public read" ON public.draws;
DROP POLICY IF EXISTS "Draw results public read" ON public.draw_results;
CREATE POLICY "Draws public read" ON public.draws FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Draw results public read" ON public.draw_results FOR SELECT TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.draws, public.draw_results;

-- Danh sách vị trí theo thứ tự bảng: A1, A2, …, B1, B2, …
CREATE OR REPLACE FUNCTION public._draw_slots(p_draw uuid)
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
    SELECT array_agg(g || n ORDER BY gi, n)
    FROM draws d, unnest(d.groups) WITH ORDINALITY AS u(g, gi), generate_series(1, d.slots_per_group) AS n
    WHERE d.id = p_draw;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_draw(p_id uuid, p_name text, p_groups text[], p_slots int)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
    v_id UUID;
    v_groups TEXT[];
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được tạo lượt bốc thăm.'; END IF;
    IF coalesce(trim(p_name), '') = '' THEN RAISE EXCEPTION 'Cần đặt tên lượt bốc thăm.'; END IF;
    SELECT array_agg(upper(trim(g)) ORDER BY o) INTO v_groups FROM unnest(p_groups) WITH ORDINALITY AS t(g, o) WHERE trim(g) <> '';
    IF v_groups IS NULL OR array_length(v_groups, 1) > 26 THEN RAISE EXCEPTION 'Cần từ 1 đến 26 bảng.'; END IF;
    IF EXISTS (SELECT 1 FROM unnest(v_groups) g WHERE g !~ '^[A-Z]{1,2}$') THEN RAISE EXCEPTION 'Tên bảng chỉ gồm 1–2 chữ cái (A, B, …).'; END IF;
    IF (SELECT count(DISTINCT g) FROM unnest(v_groups) g) <> array_length(v_groups, 1) THEN RAISE EXCEPTION 'Tên bảng bị trùng.'; END IF;
    IF p_slots IS NULL OR p_slots < 1 OR p_slots > 32 THEN RAISE EXCEPTION 'Số vị trí mỗi bảng từ 1 đến 32.'; END IF;
    IF p_id IS NULL THEN
        INSERT INTO draws (name, groups, slots_per_group) VALUES (trim(p_name), v_groups, p_slots) RETURNING id INTO v_id;
    ELSE
        IF EXISTS (SELECT 1 FROM draw_results WHERE draw_id = p_id)
           AND EXISTS (SELECT 1 FROM draws WHERE id = p_id AND (groups <> v_groups OR slots_per_group <> p_slots)) THEN
            RAISE EXCEPTION 'Đã có đội bốc thăm: không đổi được số bảng / số vị trí (chỉ đổi tên).';
        END IF;
        UPDATE draws SET name = trim(p_name), groups = v_groups, slots_per_group = p_slots, updated_at = now()
        WHERE id = p_id RETURNING id INTO v_id;
        IF v_id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy lượt bốc thăm.'; END IF;
    END IF;
    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_draw(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xóa lượt bốc thăm.'; END IF;
    DELETE FROM draws WHERE id = p_id;
END;
$$;

-- BTC mời đội lên bốc thăm (NULL = bỏ chọn)
CREATE OR REPLACE FUNCTION public.admin_draw_pick_team(p_draw uuid, p_team uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được điều khiển bốc thăm.'; END IF;
    IF p_team IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM teams WHERE id = p_team AND status = 'APPROVED') THEN
            RAISE EXCEPTION 'Đội chưa được duyệt.';
        END IF;
        IF EXISTS (SELECT 1 FROM draw_results WHERE draw_id = p_draw AND team_id = p_team) THEN
            RAISE EXCEPTION 'Đội này đã bốc thăm rồi.';
        END IF;
    END IF;
    UPDATE draws SET current_team_id = p_team, updated_at = now() WHERE id = p_draw;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy lượt bốc thăm.'; END IF;
END;
$$;

-- Vòng quay: vị trí được chọn ngẫu nhiên phía máy chủ trong các ô còn trống, giao diện chỉ diễn hoạt kết quả
CREATE OR REPLACE FUNCTION public.draw_spin(p_draw uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
    d draws%ROWTYPE;
    v_slot TEXT;
    v_id UUID;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ máy của BTC được quay bốc thăm.'; END IF;
    SELECT * INTO d FROM draws WHERE id = p_draw FOR UPDATE;
    IF d.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy lượt bốc thăm.'; END IF;
    IF d.current_team_id IS NULL THEN RAISE EXCEPTION 'BTC chưa chọn đội lên bốc thăm.'; END IF;
    SELECT s INTO v_slot FROM unnest(public._draw_slots(p_draw)) AS s
    WHERE s NOT IN (SELECT slot_code FROM draw_results WHERE draw_id = p_draw)
    ORDER BY gen_random_uuid() LIMIT 1;
    IF v_slot IS NULL THEN RAISE EXCEPTION 'Đã hết vị trí trống trong bảng đấu.'; END IF;
    INSERT INTO draw_results (draw_id, slot_code, team_id, drawn_by)
    VALUES (p_draw, v_slot, d.current_team_id, lower(auth.jwt() ->> 'email'))
    RETURNING id INTO v_id;
    UPDATE draws SET current_team_id = NULL, updated_at = now() WHERE id = p_draw;
    RETURN json_build_object('id', v_id, 'slot_code', v_slot, 'team_id', d.current_team_id,
                             'team_name', (SELECT team_name FROM teams WHERE id = d.current_team_id));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_draw_undo(p_result uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được hủy kết quả bốc thăm.'; END IF;
    DELETE FROM draw_results WHERE id = p_result;
END;
$$;

-- Kết quả bốc thăm công khai (tên đội vốn đã công khai qua get_public_teams)
CREATE OR REPLACE FUNCTION public.get_draw(p_draw uuid)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
    SELECT json_build_object(
        'id', d.id, 'name', d.name, 'groups', d.groups, 'slots_per_group', d.slots_per_group,
        'current', (SELECT json_build_object('id', t.id, 'team_name', t.team_name) FROM teams t WHERE t.id = d.current_team_id),
        'results', coalesce((SELECT json_agg(json_build_object('id', r.id, 'slot_code', r.slot_code, 'team_id', r.team_id,
                                                               'team_name', t.team_name, 'drawn_at', r.drawn_at) ORDER BY r.drawn_at)
                             FROM draw_results r JOIN teams t ON t.id = r.team_id WHERE r.draw_id = d.id), '[]'::json))
    FROM draws d WHERE d.id = p_draw;
$$;

CREATE OR REPLACE FUNCTION public.get_draws()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
    SELECT coalesce(json_agg(json_build_object(
        'id', d.id, 'name', d.name, 'created_at', d.created_at,
        'total', array_length(d.groups, 1) * d.slots_per_group,
        'filled', (SELECT count(*) FROM draw_results r WHERE r.draw_id = d.id)) ORDER BY d.created_at DESC), '[]'::json)
    FROM draws d;
$$;

REVOKE EXECUTE ON FUNCTION public._draw_slots(uuid) FROM anon, authenticated, public;
