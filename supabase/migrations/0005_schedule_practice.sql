-- Lịch thi công khai + đặt slot thử sa bàn
--  • staff: email BTC/trọng tài (thêm tay qua SQL) → is_staff() dùng cho các quyền quản trị.
--  • practice_slots: BTC mở slot (mặc định 15 phút, 1 đội/slot). Đội ĐÃ DUYỆT đặt tối đa 2 slot/tuần,
--    hủy trước giờ bắt đầu ít nhất 1 tiếng. Mọi thao tác ghi đi qua hàm SECURITY DEFINER.
--  • get_schedule(): lịch trận đấu kèm tên đội, đọc công khai (không lộ thông tin cá nhân).

CREATE TABLE staff (
    email      VARCHAR(150) PRIMARY KEY CHECK (email = lower(email)),
    full_name  VARCHAR(100),
    role       VARCHAR(20) NOT NULL DEFAULT 'BTC', -- BTC, REFEREE
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM staff WHERE email = lower(auth.jwt() ->> 'email')); $$;

CREATE TABLE practice_slots (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    starts_at  TIMESTAMPTZ NOT NULL,
    ends_at    TIMESTAMPTZ NOT NULL,
    capacity   INT NOT NULL DEFAULT 1 CHECK (capacity BETWEEN 1 AND 10),
    location   VARCHAR(100) DEFAULT 'Sa bàn thử – Xưởng Khoa Cơ khí',
    note       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ends_at > starts_at),
    UNIQUE (starts_at, location)
);
ALTER TABLE practice_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read practice slots" ON practice_slots FOR SELECT USING (true);

-- Gắn booking với slot; giữ cột slot_date/start_time cũ để tương thích báo cáo
ALTER TABLE practice_arena_bookings
    ADD COLUMN slot_id   UUID REFERENCES practice_slots(id) ON DELETE CASCADE,
    ADD COLUMN booked_by VARCHAR(150);
CREATE UNIQUE INDEX practice_bookings_one_per_slot
    ON practice_arena_bookings (slot_id, team_id) WHERE status <> 'CANCELLED';

CREATE POLICY "Team read own bookings" ON practice_arena_bookings
    FOR SELECT TO authenticated USING (team_id IN (SELECT public.my_team_ids()));

-- Danh sách slot trong khoảng thời gian, kèm số chỗ còn và booking của đội mình
CREATE OR REPLACE FUNCTION public.list_practice_slots(p_from TIMESTAMPTZ DEFAULT now(), p_to TIMESTAMPTZ DEFAULT now() + INTERVAL '21 days')
RETURNS TABLE (id UUID, starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, location VARCHAR, note TEXT, capacity INT, booked INT, my_booking_id UUID)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT s.id, s.starts_at, s.ends_at, s.location, s.note, s.capacity,
           (SELECT count(*)::INT FROM practice_arena_bookings b WHERE b.slot_id = s.id AND b.status <> 'CANCELLED'),
           (SELECT b.id FROM practice_arena_bookings b
             WHERE b.slot_id = s.id AND b.status <> 'CANCELLED' AND b.team_id IN (SELECT public.my_team_ids()) LIMIT 1)
    FROM practice_slots s
    WHERE s.starts_at >= p_from AND s.starts_at < p_to
    ORDER BY s.starts_at;
$$;

CREATE OR REPLACE FUNCTION public.book_practice_slot(p_slot_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_email TEXT := lower(auth.jwt() ->> 'email');
    v_team  teams%ROWTYPE;
    v_slot  practice_slots%ROWTYPE;
    v_local TIMESTAMP;
    v_id    UUID;
BEGIN
    SELECT t.* INTO v_team FROM teams t WHERE t.id IN (SELECT public.my_team_ids()) LIMIT 1;
    IF v_team.id IS NULL THEN
        RAISE EXCEPTION 'Bạn chưa thuộc đội nào.';
    END IF;
    IF v_team.status <> 'APPROVED' THEN
        RAISE EXCEPTION 'Chỉ đội đã được BTC duyệt mới đặt được lịch thử sa bàn.';
    END IF;

    -- Khóa slot để hai đội không giành cùng một chỗ
    SELECT * INTO v_slot FROM practice_slots WHERE id = p_slot_id FOR UPDATE;
    IF v_slot.id IS NULL THEN
        RAISE EXCEPTION 'Slot không tồn tại.';
    END IF;
    IF v_slot.starts_at <= now() THEN
        RAISE EXCEPTION 'Slot này đã bắt đầu, vui lòng chọn slot khác.';
    END IF;
    IF EXISTS (SELECT 1 FROM practice_arena_bookings WHERE slot_id = p_slot_id AND team_id = v_team.id AND status <> 'CANCELLED') THEN
        RAISE EXCEPTION 'Đội đã đặt slot này rồi.';
    END IF;
    IF (SELECT count(*) FROM practice_arena_bookings WHERE slot_id = p_slot_id AND status <> 'CANCELLED') >= v_slot.capacity THEN
        RAISE EXCEPTION 'Slot đã kín, vui lòng chọn slot khác.';
    END IF;

    -- Tối đa 2 slot mỗi tuần (thứ Hai–Chủ nhật, giờ Việt Nam)
    v_local := v_slot.starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh';
    IF (SELECT count(*) FROM practice_arena_bookings b JOIN practice_slots s ON s.id = b.slot_id
         WHERE b.team_id = v_team.id AND b.status <> 'CANCELLED'
           AND date_trunc('week', s.starts_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = date_trunc('week', v_local)) >= 2 THEN
        RAISE EXCEPTION 'Mỗi đội chỉ được đặt tối đa 2 slot mỗi tuần.';
    END IF;

    INSERT INTO practice_arena_bookings (team_id, slot_id, slot_date, start_time, end_time, booked_by)
    VALUES (v_team.id, v_slot.id, v_local::DATE, v_local::TIME, (v_slot.ends_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::TIME, v_email)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_practice_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_start TIMESTAMPTZ;
BEGIN
    SELECT s.starts_at INTO v_start
    FROM practice_arena_bookings b JOIN practice_slots s ON s.id = b.slot_id
    WHERE b.id = p_booking_id AND b.status = 'CONFIRMED' AND b.team_id IN (SELECT public.my_team_ids());
    IF v_start IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy lịch đặt của đội.';
    END IF;
    IF v_start - now() < INTERVAL '1 hour' THEN
        RAISE EXCEPTION 'Chỉ hủy được trước giờ thử ít nhất 1 tiếng.';
    END IF;
    UPDATE practice_arena_bookings SET status = 'CANCELLED' WHERE id = p_booking_id;
END;
$$;

-- BTC mở hàng loạt slot trong một buổi, vd: create_practice_slots('2026-11-20', '13:30', '17:00', 15)
CREATE OR REPLACE FUNCTION public.create_practice_slots(p_date DATE, p_from TIME, p_to TIME, p_minutes INT DEFAULT 15, p_capacity INT DEFAULT 1, p_location TEXT DEFAULT NULL)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_start TIMESTAMPTZ := (p_date + p_from) AT TIME ZONE 'Asia/Ho_Chi_Minh';
    v_end   TIMESTAMPTZ := (p_date + p_to) AT TIME ZONE 'Asia/Ho_Chi_Minh';
    v_count INT := 0;
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Chỉ BTC được mở slot.';
    END IF;
    IF p_minutes NOT BETWEEN 5 AND 120 THEN
        RAISE EXCEPTION 'Độ dài slot phải từ 5 đến 120 phút.';
    END IF;
    WHILE v_start + make_interval(mins => p_minutes) <= v_end LOOP
        INSERT INTO practice_slots (starts_at, ends_at, capacity, location)
        VALUES (v_start, v_start + make_interval(mins => p_minutes), p_capacity,
                coalesce(p_location, 'Sa bàn thử – Xưởng Khoa Cơ khí'))
        ON CONFLICT (starts_at, location) DO NOTHING;
        IF FOUND THEN v_count := v_count + 1; END IF;
        v_start := v_start + make_interval(mins => p_minutes);
    END LOOP;
    RETURN v_count;
END;
$$;

-- Lịch thi đấu công khai: chỉ tên đội/robot, không có thông tin thành viên
CREATE OR REPLACE FUNCTION public.get_schedule()
RETURNS TABLE (id UUID, match_code VARCHAR, stage VARCHAR, status VARCHAR, start_time TIMESTAMPTZ,
               red_team VARCHAR, red_robot VARCHAR, blue_team VARCHAR, blue_robot VARCHAR,
               red_score INT, blue_score INT, winner VARCHAR)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT m.id, m.match_code, m.stage, m.status, m.start_time,
           r.team_name, r.robot_name, b.team_name, b.robot_name,
           m.red_score, m.blue_score,
           CASE WHEN m.winner_team_id = m.red_team_id THEN 'RED'::VARCHAR
                WHEN m.winner_team_id = m.blue_team_id THEN 'BLUE'::VARCHAR END
    FROM matches m
    LEFT JOIN teams r ON r.id = m.red_team_id
    LEFT JOIN teams b ON b.id = m.blue_team_id
    ORDER BY m.start_time NULLS LAST, m.match_code;
$$;

REVOKE ALL ON FUNCTION public.is_staff()                                   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_practice_slots(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.book_practice_slot(UUID)                     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_practice_booking(UUID)                FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_practice_slots(DATE, TIME, TIME, INT, INT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff()                                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_practice_slots(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.book_practice_slot(UUID)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_practice_booking(UUID)                TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_practice_slots(DATE, TIME, TIME, INT, INT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_schedule()                               TO anon, authenticated;
