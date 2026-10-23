-- Vận hành giải: BTC, trọng tài, check-in, đồng hồ trận, chấm điểm, xếp hạng, khiếu nại, bình chọn
--  • staff.role: BTC (toàn quyền) · HEAD_REFEREE (điều khiển trận, xử lý khiếu nại) · REFEREE (chấm điểm một phe)
--  • Mọi thao tác ghi đi qua hàm SECURITY DEFINER; BTC đọc dữ liệu đội qua policy is_staff().
--  • Điểm trận = tổng sự kiện (rule_key, giá trị chốt lúc ghi) + điểm chiếm ô hiện tại (thường/lõi vàng)
--    + thưởng thống trị cho mỗi hàng/cột 3 ô cùng màu. Tính lại toàn bộ sau mỗi thao tác.
--  • Đồng hồ: remaining_seconds là số giây còn lại tại thời điểm clock_started_at; khi RUNNING,
--    thời gian thực = remaining_seconds - (now - clock_started_at).

-- ───────────────────────── Vai trò ─────────────────────────
ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role IN ('BTC', 'HEAD_REFEREE', 'REFEREE'));

CREATE OR REPLACE FUNCTION public.staff_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM staff WHERE email = lower(auth.jwt() ->> 'email'); $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT coalesce(public.staff_role() = 'BTC', false); $$;

CREATE OR REPLACE FUNCTION public.is_head_referee()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT coalesce(public.staff_role() IN ('BTC', 'HEAD_REFEREE'), false); $$;

CREATE OR REPLACE FUNCTION public.get_my_staff()
RETURNS TABLE (email VARCHAR, full_name VARCHAR, role VARCHAR)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT s.email, s.full_name, s.role FROM staff s WHERE s.email = lower(auth.jwt() ->> 'email'); $$;

ALTER FUNCTION public.registration_open() SET search_path = public;

-- ───────────────────────── Cấu hình chung ─────────────────────────
CREATE TABLE app_settings (
    key        VARCHAR(50) PRIMARY KEY,
    value      JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON app_settings FOR SELECT USING (true);
INSERT INTO app_settings (key, value) VALUES ('voting_open', 'false'), ('appeal_window_minutes', '5');

-- ───────────────────────── Cột bổ sung ─────────────────────────
ALTER TABLE teams
    ADD COLUMN inspection_data JSONB,
    ADD COLUMN inspection_at   TIMESTAMPTZ,
    ADD COLUMN inspection_by   VARCHAR(150);

ALTER TABLE matches
    ADD COLUMN clock_started_at  TIMESTAMPTZ,
    ADD COLUMN timeout_until     TIMESTAMPTZ,
    ADD COLUMN timeout_team      VARCHAR(10),
    ADD COLUMN red_timeout_used  BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN blue_timeout_used BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN started_at        TIMESTAMPTZ,
    ADD COLUMN finished_at       TIMESTAMPTZ,
    ADD COLUMN updated_at        TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX arena_points_unique ON arena_control_points (match_id, point_index);
CREATE INDEX match_events_match_idx ON match_events (match_id, created_at);
CREATE UNIQUE INDEX match_appeals_one_per_team ON match_appeals (match_id, team_id);

ALTER PUBLICATION supabase_realtime ADD TABLE match_events;

-- ───────────────────────── Quyền đọc cho BTC / đội ─────────────────────────
CREATE POLICY "Staff read teams"    ON teams                   FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff read members"  ON team_members            FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff read bookings" ON practice_arena_bookings FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff read appeals"  ON match_appeals           FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff read staff"    ON staff                   FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Team read own appeals" ON match_appeals FOR SELECT TO authenticated USING (team_id IN (SELECT public.my_team_ids()));

-- ───────────────────────── BTC: hồ sơ đội ─────────────────────────
CREATE OR REPLACE FUNCTION public.admin_review_team(p_team_id UUID, p_status TEXT, p_note TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_team teams%ROWTYPE;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được duyệt hồ sơ.'; END IF;
    IF p_status NOT IN ('PENDING', 'APPROVED', 'REJECTED') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
    IF p_status = 'REJECTED' AND coalesce(trim(p_note), '') = '' THEN
        RAISE EXCEPTION 'Cần ghi lý do khi từ chối để đội biết cần sửa gì.';
    END IF;
    UPDATE teams SET status = p_status, review_note = nullif(trim(p_note), ''), updated_at = now()
    WHERE id = p_team_id RETURNING * INTO v_team;
    IF v_team.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đội.'; END IF;
    RETURN jsonb_build_object('team_name', v_team.team_name, 'leader_email', v_team.leader_email,
                              'status', v_team.status, 'note', v_team.review_note);
END;
$$;

-- Kiểm tra kỹ thuật: p_data = {"size":true,"weight":true,"voltage":true,"arm":true,"notes":"..."}
CREATE OR REPLACE FUNCTION public.staff_set_inspection(p_team_id UUID, p_passed BOOLEAN, p_data JSONB DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ BTC/trọng tài được kiểm tra kỹ thuật.'; END IF;
    UPDATE teams SET inspection_passed = p_passed, inspection_data = p_data, inspection_at = now(),
                     inspection_by = lower(auth.jwt() ->> 'email'), updated_at = now()
    WHERE id = p_team_id AND status = 'APPROVED';
    IF NOT FOUND THEN RAISE EXCEPTION 'Chỉ kiểm tra kỹ thuật đội đã được duyệt.'; END IF;
END;
$$;

-- ───────────────────────── BTC: nhân sự, luật, cấu hình ─────────────────────────
CREATE OR REPLACE FUNCTION public.admin_upsert_staff(p_email TEXT, p_full_name TEXT, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được quản lý nhân sự.'; END IF;
    IF lower(trim(p_email)) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'Email không hợp lệ.'; END IF;
    IF lower(trim(p_email)) = lower(auth.jwt() ->> 'email') AND p_role <> 'BTC' THEN
        RAISE EXCEPTION 'Không thể tự hạ quyền của chính mình.';
    END IF;
    INSERT INTO staff (email, full_name, role) VALUES (lower(trim(p_email)), nullif(trim(p_full_name), ''), p_role)
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_staff(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được quản lý nhân sự.'; END IF;
    IF lower(p_email) = lower(auth.jwt() ->> 'email') THEN RAISE EXCEPTION 'Không thể tự xóa chính mình.'; END IF;
    DELETE FROM staff WHERE email = lower(p_email);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_rule(p_rule_key TEXT, p_value INT, p_active BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được sửa luật điểm.'; END IF;
    IF p_value NOT BETWEEN -500 AND 500 THEN RAISE EXCEPTION 'Giá trị điểm phải trong khoảng -500..500.'; END IF;
    UPDATE scoring_rules SET score_value = p_value, is_active = p_active WHERE rule_key = p_rule_key;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không có luật %.', p_rule_key; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_setting(p_key TEXT, p_value JSONB)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được đổi cấu hình.'; END IF;
    INSERT INTO app_settings (key, value, updated_at) VALUES (p_key, p_value, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;

-- ───────────────────────── BTC: trận đấu ─────────────────────────
CREATE OR REPLACE FUNCTION public.admin_upsert_match(p_id UUID, p_code TEXT, p_stage TEXT, p_red UUID, p_blue UUID,
                                                     p_start TIMESTAMPTZ, p_duration INT DEFAULT 180)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xếp trận.'; END IF;
    IF p_red IS NOT NULL AND p_red = p_blue THEN RAISE EXCEPTION 'Hai phe phải là hai đội khác nhau.'; END IF;
    IF EXISTS (SELECT 1 FROM teams WHERE id IN (p_red, p_blue) AND status <> 'APPROVED') THEN
        RAISE EXCEPTION 'Chỉ xếp trận cho đội đã được duyệt.';
    END IF;
    IF p_duration NOT BETWEEN 30 AND 1200 THEN RAISE EXCEPTION 'Thời lượng trận phải từ 30 đến 1200 giây.'; END IF;
    IF p_id IS NULL THEN
        INSERT INTO matches (match_code, stage, red_team_id, blue_team_id, start_time, duration_seconds, remaining_seconds)
        VALUES (nullif(trim(p_code), ''), trim(p_stage), p_red, p_blue, p_start, p_duration, p_duration)
        RETURNING id INTO v_id;
    ELSE
        UPDATE matches SET match_code = nullif(trim(p_code), ''), stage = trim(p_stage), red_team_id = p_red,
               blue_team_id = p_blue, start_time = p_start, duration_seconds = p_duration,
               remaining_seconds = CASE WHEN status IN ('SCHEDULED', 'READY') THEN p_duration ELSE remaining_seconds END,
               updated_at = now()
        WHERE id = p_id AND status IN ('SCHEDULED', 'READY')
        RETURNING id INTO v_id;
        IF v_id IS NULL THEN RAISE EXCEPTION 'Chỉ sửa được trận chưa bắt đầu.'; END IF;
    END IF;
    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_match(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xóa trận.'; END IF;
    DELETE FROM matches WHERE id = p_id AND status IN ('SCHEDULED', 'READY');
    IF NOT FOUND THEN RAISE EXCEPTION 'Chỉ xóa được trận chưa bắt đầu.'; END IF;
END;
$$;

-- Đổi giờ thi đấu giữa hai trận (đội xin dời lịch)
CREATE OR REPLACE FUNCTION public.admin_swap_match_times(p_a UUID, p_b UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_a TIMESTAMPTZ;
    v_b TIMESTAMPTZ;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được dời lịch.'; END IF;
    IF p_a = p_b OR (SELECT count(*) FROM matches WHERE id IN (p_a, p_b) AND status IN ('SCHEDULED', 'READY')) <> 2 THEN
        RAISE EXCEPTION 'Chỉ đổi giờ được giữa hai trận chưa bắt đầu.';
    END IF;
    SELECT start_time INTO v_a FROM matches WHERE id = p_a FOR UPDATE;
    SELECT start_time INTO v_b FROM matches WHERE id = p_b FOR UPDATE;
    UPDATE matches SET start_time = v_b, updated_at = now() WHERE id = p_a;
    UPDATE matches SET start_time = v_a, updated_at = now() WHERE id = p_b;
END;
$$;

-- ───────────────────────── BTC: sa bàn thử ─────────────────────────
CREATE OR REPLACE FUNCTION public.admin_delete_slot(p_slot_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xóa slot.'; END IF;
    DELETE FROM practice_slots WHERE id = p_slot_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_booking_status(p_booking_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ BTC được đổi trạng thái lịch thử.'; END IF;
    IF p_status NOT IN ('CONFIRMED', 'CANCELLED', 'NO_SHOW') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
    UPDATE practice_arena_bookings SET status = p_status,
           check_in_at = CASE WHEN p_status = 'CONFIRMED' THEN check_in_at END
    WHERE id = p_booking_id;
END;
$$;

-- ───────────────────────── Check-in bằng QR ─────────────────────────
CREATE OR REPLACE FUNCTION public.staff_lookup_team_by_qr(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_team teams%ROWTYPE;
    v_today DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ BTC/trọng tài được quét mã.'; END IF;
    SELECT * INTO v_team FROM teams WHERE qr_code_token = lower(trim(p_token));
    IF v_team.id IS NULL THEN RAISE EXCEPTION 'Mã QR không thuộc đội nào.'; END IF;
    RETURN jsonb_build_object(
        'team', jsonb_build_object('id', v_team.id, 'team_name', v_team.team_name, 'robot_name', v_team.robot_name,
                                   'major', v_team.major, 'status', v_team.status,
                                   'inspection_passed', v_team.inspection_passed,
                                   'inspection_data', v_team.inspection_data, 'inspection_at', v_team.inspection_at),
        'members', coalesce((SELECT jsonb_agg(jsonb_build_object('full_name', m.full_name, 'student_id', m.student_id, 'role', m.role)
                                              ORDER BY m.role, m.full_name)
                             FROM team_members m WHERE m.team_id = v_team.id), '[]'),
        'bookings', coalesce((SELECT jsonb_agg(jsonb_build_object('id', b.id, 'starts_at', s.starts_at, 'ends_at', s.ends_at,
                                                                  'location', s.location, 'status', b.status, 'check_in_at', b.check_in_at)
                                               ORDER BY s.starts_at)
                              FROM practice_arena_bookings b JOIN practice_slots s ON s.id = b.slot_id
                              WHERE b.team_id = v_team.id AND b.status <> 'CANCELLED'
                                AND (s.starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE = v_today), '[]'),
        'next_match', (SELECT jsonb_build_object('id', m.id, 'match_code', m.match_code, 'stage', m.stage,
                                                 'start_time', m.start_time,
                                                 'color', CASE WHEN m.red_team_id = v_team.id THEN 'RED' ELSE 'BLUE' END)
                       FROM matches m WHERE v_team.id IN (m.red_team_id, m.blue_team_id) AND m.status <> 'FINISHED'
                       ORDER BY m.start_time NULLS LAST LIMIT 1)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_checkin_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ BTC/trọng tài được check-in.'; END IF;
    UPDATE practice_arena_bookings SET check_in_at = coalesce(check_in_at, now()), status = 'CONFIRMED'
    WHERE id = p_booking_id AND status <> 'CANCELLED';
    IF NOT FOUND THEN RAISE EXCEPTION 'Lịch thử không tồn tại hoặc đã bị hủy.'; END IF;
END;
$$;

-- ───────────────────────── Điểm & đồng hồ ─────────────────────────
CREATE OR REPLACE FUNCTION public._rule_value(p_key TEXT)
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT coalesce((SELECT score_value FROM scoring_rules WHERE rule_key = p_key AND is_active), 0); $$;

CREATE OR REPLACE FUNCTION public._live_remaining(m matches)
RETURNS INT
LANGUAGE sql STABLE
AS $$
    SELECT CASE WHEN m.status = 'RUNNING' AND m.clock_started_at IS NOT NULL
                THEN greatest(0, m.remaining_seconds - floor(extract(epoch FROM now() - m.clock_started_at))::INT)
                ELSE m.remaining_seconds END;
$$;

-- Điểm chiếm ô + thống trị (hàng/cột 3 ô cùng màu) cho một màu
CREATE OR REPLACE FUNCTION public._arena_score(p_match UUID, p_color TEXT)
RETURNS INT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_owned INT[];
    v_score INT := 0;
    v_lines INT[][] := ARRAY[[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9]];
    i INT;
BEGIN
    SELECT coalesce(array_agg(point_index), '{}') INTO v_owned
    FROM arena_control_points WHERE match_id = p_match AND current_owner = p_color;
    SELECT coalesce(sum(CASE WHEN is_golden_core THEN public._rule_value('STAGE2_GOLDEN_CORE')
                             ELSE public._rule_value('STAGE2_NORMAL_FLIP') END), 0)::INT INTO v_score
    FROM arena_control_points WHERE match_id = p_match AND current_owner = p_color;
    FOR i IN 1..6 LOOP
        IF v_owned @> v_lines[i:i][1:3] THEN
            v_score := v_score + public._rule_value('STAGE2_DOMINATION_BONUS');
        END IF;
    END LOOP;
    RETURN v_score;
END;
$$;

CREATE OR REPLACE FUNCTION public._recompute_score(p_match UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE matches SET
        red_score  = coalesce((SELECT sum(point_value) FROM match_events WHERE match_id = p_match AND team_color = 'RED'  AND event_type <> 'FLIP'), 0)
                     + public._arena_score(p_match, 'RED'),
        blue_score = coalesce((SELECT sum(point_value) FROM match_events WHERE match_id = p_match AND team_color = 'BLUE' AND event_type <> 'FLIP'), 0)
                     + public._arena_score(p_match, 'BLUE'),
        updated_at = now()
    WHERE id = p_match;
END;
$$;

CREATE OR REPLACE FUNCTION public._lock_match(p_match UUID)
RETURNS matches
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
BEGIN
    SELECT * INTO v FROM matches WHERE id = p_match FOR UPDATE;
    IF v.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy trận.'; END IF;
    RETURN v;
END;
$$;

-- Trọng tài ghi một sự kiện theo luật (cộng/trừ điểm). Trọng tài chính/BTC còn sửa được sau khi kết thúc.
CREATE OR REPLACE FUNCTION public.ref_add_event(p_match UUID, p_color TEXT, p_rule_key TEXT, p_notes TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
    v_value INT;
    v_id UUID;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ trọng tài được chấm điểm.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE') THEN RAISE EXCEPTION 'Phe không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') AND NOT (v.status = 'FINISHED' AND public.is_head_referee()) THEN
        RAISE EXCEPTION 'Trận chưa bắt đầu hoặc đã kết thúc.';
    END IF;
    SELECT score_value INTO v_value FROM scoring_rules WHERE rule_key = p_rule_key AND is_active;
    IF v_value IS NULL THEN RAISE EXCEPTION 'Luật % không tồn tại hoặc đã tắt.', p_rule_key; END IF;
    INSERT INTO match_events (match_id, team_color, event_type, point_value, match_timestamp_seconds, referee_id, notes)
    VALUES (p_match, p_color, p_rule_key, v_value, v.duration_seconds - public._live_remaining(v), auth.uid(), p_notes)
    RETURNING id INTO v_id;
    PERFORM public._recompute_score(p_match);
    RETURN v_id;
END;
$$;

-- Hoàn tác sự kiện gần nhất của một phe (chỉ sự kiện cộng/trừ điểm, không phải lật ô)
CREATE OR REPLACE FUNCTION public.ref_undo_last(p_match UUID, p_color TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
    v_id UUID;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ trọng tài được hoàn tác.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') AND NOT (v.status = 'FINISHED' AND public.is_head_referee()) THEN
        RAISE EXCEPTION 'Trận không ở trạng thái cho phép sửa điểm.';
    END IF;
    SELECT id INTO v_id FROM match_events
    WHERE match_id = p_match AND team_color = p_color AND event_type <> 'FLIP'
    ORDER BY created_at DESC LIMIT 1;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Không còn sự kiện nào để hoàn tác.'; END IF;
    DELETE FROM match_events WHERE id = v_id;
    PERFORM public._recompute_score(p_match);
END;
$$;

-- Lật ô điều khiển về một màu (RED/BLUE) hoặc trả về NEUTRAL khi bấm nhầm
CREATE OR REPLACE FUNCTION public.ref_flip_point(p_match UUID, p_index INT, p_color TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
BEGIN
    IF NOT public.is_staff() THEN RAISE EXCEPTION 'Chỉ trọng tài được lật ô.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE', 'NEUTRAL') THEN RAISE EXCEPTION 'Màu không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') AND NOT (v.status = 'FINISHED' AND public.is_head_referee()) THEN
        RAISE EXCEPTION 'Trận chưa bắt đầu hoặc đã kết thúc.';
    END IF;
    UPDATE arena_control_points SET current_owner = p_color, last_flipped_at = now(), flipped_by_referee = auth.uid()
    WHERE match_id = p_match AND point_index = p_index AND current_owner <> p_color;
    IF NOT FOUND THEN RETURN; END IF;
    INSERT INTO match_events (match_id, team_color, event_type, point_value, target_point_index, match_timestamp_seconds, referee_id)
    VALUES (p_match, p_color, 'FLIP', 0, p_index, v.duration_seconds - public._live_remaining(v), auth.uid());
    PERFORM public._recompute_score(p_match);
END;
$$;

-- Trọng tài chính: điều chỉnh điểm tay (sau khiếu nại), ghi lý do bắt buộc
CREATE OR REPLACE FUNCTION public.head_adjust_score(p_match UUID, p_color TEXT, p_delta INT, p_notes TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được điều chỉnh điểm.'; END IF;
    IF coalesce(trim(p_notes), '') = '' THEN RAISE EXCEPTION 'Cần ghi lý do điều chỉnh.'; END IF;
    IF p_color NOT IN ('RED', 'BLUE') OR p_delta = 0 THEN RAISE EXCEPTION 'Điều chỉnh không hợp lệ.'; END IF;
    v := public._lock_match(p_match);
    INSERT INTO match_events (match_id, team_color, event_type, point_value, match_timestamp_seconds, referee_id, notes)
    VALUES (p_match, p_color, 'ADJUST', p_delta, v.duration_seconds - public._live_remaining(v), auth.uid(), trim(p_notes));
    PERFORM public._recompute_score(p_match);
    IF v.status = 'FINISHED' THEN
        UPDATE matches SET winner_team_id = CASE WHEN red_score > blue_score THEN red_team_id
                                                 WHEN blue_score > red_score THEN blue_team_id END
        WHERE id = p_match;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.head_set_ready(p_match UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được điều khiển trận.'; END IF;
    UPDATE matches SET status = 'READY', updated_at = now() WHERE id = p_match AND status = 'SCHEDULED';
    IF NOT FOUND THEN RAISE EXCEPTION 'Trận không ở trạng thái Sắp đấu.'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.head_start(p_match UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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
    SELECT p_match, i, CASE WHEN i = 5 THEN 'Lõi vàng' ELSE 'Ô ' || i END, i = 5 FROM generate_series(1, 9) i;
    DELETE FROM match_events WHERE match_id = p_match;
    UPDATE matches SET status = 'RUNNING', clock_started_at = now(), started_at = now(),
           remaining_seconds = duration_seconds, red_score = 0, blue_score = 0, winner_team_id = NULL,
           head_referee_id = auth.uid(), updated_at = now()
    WHERE id = p_match;
END;
$$;

CREATE OR REPLACE FUNCTION public.head_pause(p_match UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được dừng trận.'; END IF;
    v := public._lock_match(p_match);
    IF v.status <> 'RUNNING' THEN RAISE EXCEPTION 'Trận không đang chạy.'; END IF;
    UPDATE matches SET status = 'PAUSED', remaining_seconds = public._live_remaining(v), clock_started_at = NULL, updated_at = now()
    WHERE id = p_match;
END;
$$;

CREATE OR REPLACE FUNCTION public.head_resume(p_match UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được tiếp tục trận.'; END IF;
    UPDATE matches SET status = 'RUNNING', clock_started_at = now(), timeout_until = NULL, timeout_team = NULL, updated_at = now()
    WHERE id = p_match AND status = 'PAUSED';
    IF NOT FOUND THEN RAISE EXCEPTION 'Trận không ở trạng thái tạm dừng.'; END IF;
END;
$$;

-- Mỗi đội được xin 1 lần timeout kỹ thuật 5 phút / trận
CREATE OR REPLACE FUNCTION public.head_timeout(p_match UUID, p_color TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được cho timeout.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') THEN RAISE EXCEPTION 'Trận không đang diễn ra.'; END IF;
    IF (p_color = 'RED' AND v.red_timeout_used) OR (p_color = 'BLUE' AND v.blue_timeout_used) THEN
        RAISE EXCEPTION 'Đội này đã dùng timeout kỹ thuật.';
    END IF;
    UPDATE matches SET status = 'PAUSED', remaining_seconds = public._live_remaining(v), clock_started_at = NULL,
           timeout_until = now() + INTERVAL '5 minutes', timeout_team = p_color,
           red_timeout_used = red_timeout_used OR p_color = 'RED',
           blue_timeout_used = blue_timeout_used OR p_color = 'BLUE', updated_at = now()
    WHERE id = p_match;
END;
$$;

CREATE OR REPLACE FUNCTION public.head_finish(p_match UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính được kết thúc trận.'; END IF;
    v := public._lock_match(p_match);
    IF v.status NOT IN ('RUNNING', 'PAUSED') THEN RAISE EXCEPTION 'Trận không đang diễn ra.'; END IF;
    PERFORM public._recompute_score(p_match);
    UPDATE matches SET status = 'FINISHED', remaining_seconds = public._live_remaining(v), clock_started_at = NULL,
           timeout_until = NULL, timeout_team = NULL, finished_at = now(),
           winner_team_id = CASE WHEN red_score > blue_score THEN red_team_id WHEN blue_score > red_score THEN blue_team_id END,
           updated_at = now()
    WHERE id = p_match;
END;
$$;

-- BTC: đưa trận về trạng thái chuẩn bị (chạy thử / bắt đầu lại), xóa toàn bộ sự kiện
CREATE OR REPLACE FUNCTION public.admin_reset_match(p_match UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được đặt lại trận.'; END IF;
    PERFORM public._lock_match(p_match);
    DELETE FROM match_events WHERE match_id = p_match;
    DELETE FROM arena_control_points WHERE match_id = p_match;
    DELETE FROM match_appeals WHERE match_id = p_match;
    UPDATE matches SET status = 'READY', remaining_seconds = duration_seconds, clock_started_at = NULL, timeout_until = NULL,
           timeout_team = NULL, red_timeout_used = false, blue_timeout_used = false, started_at = NULL, finished_at = NULL,
           red_score = 0, blue_score = 0, winner_team_id = NULL, updated_at = now()
    WHERE id = p_match;
END;
$$;

-- ───────────────────────── Dữ liệu công khai cho màn hình ─────────────────────────
CREATE OR REPLACE FUNCTION public.get_match_live(p_match UUID)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT jsonb_build_object(
        'server_now', now(),
        'match', jsonb_build_object(
            'id', m.id, 'match_code', m.match_code, 'stage', m.stage, 'status', m.status, 'start_time', m.start_time,
            'duration_seconds', m.duration_seconds, 'remaining_seconds', m.remaining_seconds,
            'clock_started_at', m.clock_started_at, 'live_remaining', public._live_remaining(m),
            'timeout_until', m.timeout_until, 'timeout_team', m.timeout_team,
            'red_timeout_used', m.red_timeout_used, 'blue_timeout_used', m.blue_timeout_used,
            'red_score', m.red_score, 'blue_score', m.blue_score, 'finished_at', m.finished_at,
            'winner', CASE WHEN m.winner_team_id = m.red_team_id THEN 'RED' WHEN m.winner_team_id = m.blue_team_id THEN 'BLUE' END),
        'red',  (SELECT jsonb_build_object('id', t.id, 'team_name', t.team_name, 'robot_name', t.robot_name, 'logo_url', t.logo_url,
                                           'inspection_passed', t.inspection_passed) FROM teams t WHERE t.id = m.red_team_id),
        'blue', (SELECT jsonb_build_object('id', t.id, 'team_name', t.team_name, 'robot_name', t.robot_name, 'logo_url', t.logo_url,
                                           'inspection_passed', t.inspection_passed) FROM teams t WHERE t.id = m.blue_team_id),
        'points', coalesce((SELECT jsonb_agg(jsonb_build_object('index', p.point_index, 'owner', p.current_owner,
                                                                'golden', p.is_golden_core) ORDER BY p.point_index)
                            FROM arena_control_points p WHERE p.match_id = m.id), '[]'),
        'events', coalesce((SELECT jsonb_agg(e ORDER BY e.created_at DESC) FROM (
                               SELECT ev.id, ev.team_color, ev.event_type, ev.point_value, ev.target_point_index,
                                      ev.match_timestamp_seconds, ev.notes, ev.created_at, r.rule_name
                               FROM match_events ev LEFT JOIN scoring_rules r ON r.rule_key = ev.event_type
                               WHERE ev.match_id = m.id ORDER BY ev.created_at DESC LIMIT 30) e), '[]'),
        'fouls', jsonb_build_object(
            'RED',  (SELECT count(*) FROM match_events WHERE match_id = m.id AND team_color = 'RED'  AND event_type LIKE 'FOUL%'),
            'BLUE', (SELECT count(*) FROM match_events WHERE match_id = m.id AND team_color = 'BLUE' AND event_type LIKE 'FOUL%'))
    )
    FROM matches m WHERE m.id = p_match;
$$;

-- Trận đang/sắp diễn ra (cho /stage, /obs, /paddock khi không chỉ định trận)
CREATE OR REPLACE FUNCTION public.get_current_match_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT id FROM matches
    ORDER BY CASE status WHEN 'RUNNING' THEN 0 WHEN 'PAUSED' THEN 1 WHEN 'READY' THEN 2
                         WHEN 'FINISHED' THEN 4 ELSE 3 END,
             CASE WHEN status = 'FINISHED' THEN -extract(epoch FROM finished_at) ELSE extract(epoch FROM start_time) END NULLS LAST
    LIMIT 1;
$$;

-- Bảng xếp hạng theo vòng: thắng 3 · hòa 1 · thua 0; xếp tiếp theo lõi vàng, ít lỗi, tổng điểm
CREATE OR REPLACE FUNCTION public.get_standings()
RETURNS TABLE (stage VARCHAR, team_id UUID, team_name VARCHAR, robot_name VARCHAR, played INT, won INT, drawn INT, lost INT,
               points INT, golden_cores INT, fouls INT, score_for INT, score_against INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    WITH sides AS (
        SELECT m.stage, m.id AS match_id, m.red_team_id AS team_id, 'RED'::TEXT AS color, m.red_score AS sf, m.blue_score AS sa, m.winner_team_id
        FROM matches m WHERE m.status = 'FINISHED' AND m.red_team_id IS NOT NULL AND m.blue_team_id IS NOT NULL
        UNION ALL
        SELECT m.stage, m.id, m.blue_team_id, 'BLUE', m.blue_score, m.red_score, m.winner_team_id
        FROM matches m WHERE m.status = 'FINISHED' AND m.red_team_id IS NOT NULL AND m.blue_team_id IS NOT NULL
    ), agg AS (
        SELECT s.stage, s.team_id,
               count(*)::INT AS played,
               count(*) FILTER (WHERE s.winner_team_id = s.team_id)::INT AS won,
               count(*) FILTER (WHERE s.winner_team_id IS NULL)::INT AS drawn,
               count(*) FILTER (WHERE s.winner_team_id IS NOT NULL AND s.winner_team_id <> s.team_id)::INT AS lost,
               sum((SELECT count(*) FROM match_events e WHERE e.match_id = s.match_id AND e.team_color = s.color
                                                          AND e.event_type = 'FLIP' AND e.target_point_index = 5))::INT AS golden,
               sum((SELECT count(*) FROM match_events e WHERE e.match_id = s.match_id AND e.team_color = s.color
                                                          AND e.event_type LIKE 'FOUL%'))::INT AS fouls,
               sum(s.sf)::INT AS sf, sum(s.sa)::INT AS sa
        FROM sides s GROUP BY s.stage, s.team_id
    )
    SELECT a.stage, a.team_id, t.team_name, t.robot_name, a.played, a.won, a.drawn, a.lost,
           a.won * 3 + a.drawn, a.golden, a.fouls, a.sf, a.sa
    FROM agg a JOIN teams t ON t.id = a.team_id
    ORDER BY a.stage, a.won * 3 + a.drawn DESC, a.golden DESC, a.fouls ASC, a.sf - a.sa DESC, a.sf DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_public_teams()
RETURNS TABLE (id UUID, team_name VARCHAR, robot_name VARCHAR, slogan TEXT, logo_url TEXT, major VARCHAR)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT t.id, t.team_name, t.robot_name, t.slogan::TEXT, t.logo_url::TEXT, t.major
    FROM teams t WHERE t.status = 'APPROVED' ORDER BY t.team_name;
$$;

-- ───────────────────────── Khiếu nại (trong 5 phút sau khi trận kết thúc) ─────────────────────────
CREATE OR REPLACE FUNCTION public.submit_appeal(p_match UUID, p_reason TEXT, p_timestamp_seconds INT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v matches%ROWTYPE;
    v_team UUID;
    v_window INT := coalesce((SELECT (value #>> '{}')::INT FROM app_settings WHERE key = 'appeal_window_minutes'), 5);
    v_id UUID;
BEGIN
    SELECT * INTO v FROM matches WHERE id = p_match;
    IF v.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy trận.'; END IF;
    SELECT id INTO v_team FROM teams WHERE id IN (SELECT public.my_team_ids()) AND id IN (v.red_team_id, v.blue_team_id) LIMIT 1;
    IF v_team IS NULL THEN RAISE EXCEPTION 'Chỉ đội thi đấu trong trận này được khiếu nại.'; END IF;
    IF v.status <> 'FINISHED' OR v.finished_at IS NULL THEN RAISE EXCEPTION 'Chỉ khiếu nại sau khi trận kết thúc.'; END IF;
    IF now() > v.finished_at + make_interval(mins => v_window) THEN
        RAISE EXCEPTION 'Đã quá % phút kể từ khi trận kết thúc, không thể khiếu nại.', v_window;
    END IF;
    IF length(trim(coalesce(p_reason, ''))) < 10 THEN RAISE EXCEPTION 'Vui lòng mô tả rõ nội dung khiếu nại (ít nhất 10 ký tự).'; END IF;
    INSERT INTO match_appeals (match_id, team_id, appeal_timestamp_seconds, reason)
    VALUES (p_match, v_team, p_timestamp_seconds, trim(p_reason))
    RETURNING id INTO v_id;
    RETURN v_id;
EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Đội đã gửi khiếu nại cho trận này.';
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_appeal(p_appeal UUID, p_status TEXT, p_notes TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_head_referee() THEN RAISE EXCEPTION 'Chỉ trọng tài chính/BTC được xử lý khiếu nại.'; END IF;
    IF p_status NOT IN ('ACCEPTED', 'REJECTED') THEN RAISE EXCEPTION 'Kết quả không hợp lệ.'; END IF;
    IF coalesce(trim(p_notes), '') = '' THEN RAISE EXCEPTION 'Cần ghi kết luận xử lý.'; END IF;
    UPDATE match_appeals SET status = p_status, resolution_notes = trim(p_notes), resolved_by_referee = auth.uid()
    WHERE id = p_appeal AND status = 'PENDING';
    IF NOT FOUND THEN RAISE EXCEPTION 'Khiếu nại không tồn tại hoặc đã được xử lý.'; END IF;
END;
$$;

-- ───────────────────────── Bình chọn của khán giả ─────────────────────────
CREATE OR REPLACE FUNCTION public.cast_vote(p_fingerprint TEXT, p_team UUID, p_category TEXT DEFAULT 'MOST_CREATIVE_ROBOT')
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT coalesce((SELECT (value #>> '{}')::BOOLEAN FROM app_settings WHERE key = 'voting_open'), false) THEN
        RAISE EXCEPTION 'Cổng bình chọn chưa mở.';
    END IF;
    IF p_fingerprint IS NULL OR length(p_fingerprint) NOT BETWEEN 16 AND 100 THEN RAISE EXCEPTION 'Phiếu không hợp lệ.'; END IF;
    IF p_category NOT IN ('MOST_CREATIVE_ROBOT', 'BEST_DESIGN', 'FAN_FAVORITE') THEN RAISE EXCEPTION 'Hạng mục không hợp lệ.'; END IF;
    IF NOT EXISTS (SELECT 1 FROM teams WHERE id = p_team AND status = 'APPROVED') THEN RAISE EXCEPTION 'Đội không hợp lệ.'; END IF;
    INSERT INTO fan_votes (voter_fingerprint, voted_team_id, vote_category) VALUES (p_fingerprint, p_team, p_category)
    ON CONFLICT (voter_fingerprint, vote_category) DO UPDATE SET voted_team_id = EXCLUDED.voted_team_id, created_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.vote_results()
RETURNS TABLE (vote_category VARCHAR, team_id UUID, team_name VARCHAR, votes INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT v.vote_category, t.id, t.team_name, count(*)::INT
    FROM fan_votes v JOIN teams t ON t.id = v.voted_team_id
    GROUP BY v.vote_category, t.id, t.team_name
    ORDER BY v.vote_category, count(*) DESC;
$$;

-- ───────────────────────── Phân quyền thực thi ─────────────────────────
DO $$
DECLARE
    f TEXT;
    staff_fns TEXT[] := ARRAY[
        'staff_role()', 'is_admin()', 'is_head_referee()', 'get_my_staff()',
        'admin_review_team(uuid,text,text)', 'staff_set_inspection(uuid,boolean,jsonb)',
        'admin_upsert_staff(text,text,text)', 'admin_remove_staff(text)', 'admin_update_rule(text,integer,boolean)',
        'admin_set_setting(text,jsonb)', 'admin_upsert_match(uuid,text,text,uuid,uuid,timestamptz,integer)',
        'admin_delete_match(uuid)', 'admin_swap_match_times(uuid,uuid)', 'admin_delete_slot(uuid)',
        'admin_set_booking_status(uuid,text)', 'staff_lookup_team_by_qr(text)', 'staff_checkin_booking(uuid)',
        'ref_add_event(uuid,text,text,text)', 'ref_undo_last(uuid,text)', 'ref_flip_point(uuid,integer,text)',
        'head_adjust_score(uuid,text,integer,text)', 'head_set_ready(uuid)', 'head_start(uuid)', 'head_pause(uuid)',
        'head_resume(uuid)', 'head_timeout(uuid,text)', 'head_finish(uuid)', 'admin_reset_match(uuid)',
        'submit_appeal(uuid,text,integer)', 'resolve_appeal(uuid,text,text)'];
    public_fns TEXT[] := ARRAY['get_match_live(uuid)', 'get_current_match_id()', 'get_standings()', 'get_public_teams()',
                               'cast_vote(text,uuid,text)', 'vote_results()'];
    internal_fns TEXT[] := ARRAY['_rule_value(text)', '_live_remaining(matches)', '_arena_score(uuid,text)',
                                 '_recompute_score(uuid)', '_lock_match(uuid)'];
BEGIN
    FOREACH f IN ARRAY staff_fns || public_fns || internal_fns LOOP
        EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
    END LOOP;
    FOREACH f IN ARRAY staff_fns LOOP
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
    END LOOP;
    FOREACH f IN ARRAY public_fns LOOP
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO anon, authenticated', f);
    END LOOP;
END;
$$;

ALTER FUNCTION public._live_remaining(matches) SET search_path = public;
