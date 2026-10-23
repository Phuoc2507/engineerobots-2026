-- ENGINEEROBOTS 2026 – Schema khởi tạo
-- Nguồn: 01_TAI_LIEU_DAC_TA_VA_THE_LE/KIEN_TRUC_HE_THONG_ENGINEEROBOTS_2026.md (Mục 4 & 5)
-- RLS policies sẽ bổ sung ở migration riêng (Giai đoạn 2) sau khi chốt bảng vai trò người dùng.

-- 1. ĐỘI THI
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(100) NOT NULL UNIQUE,
    robot_name VARCHAR(100),
    slogan TEXT,
    logo_url TEXT,
    leader_email VARCHAR(150) NOT NULL,
    leader_phone VARCHAR(20) NOT NULL,
    major VARCHAR(100) NOT NULL,
    cohort VARCHAR(10) DEFAULT 'K26',
    qr_code_token VARCHAR(64) UNIQUE,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    inspection_passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. THÀNH VIÊN ĐỘI (3–5 NGƯỜI)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    student_id VARCHAR(20) NOT NULL, -- MSSV bắt đầu bằng 26
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'MEMBER', -- LEADER, MEMBER, PILOT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRẬN ĐẤU
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_code VARCHAR(20) UNIQUE,
    stage VARCHAR(50) NOT NULL,
    red_team_id UUID REFERENCES teams(id),
    blue_team_id UUID REFERENCES teams(id),
    red_score INT DEFAULT 0,
    blue_score INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, READY, RUNNING, PAUSED, FINISHED
    start_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INT DEFAULT 180,
    remaining_seconds INT DEFAULT 180,
    winner_team_id UUID REFERENCES teams(id),
    head_referee_id UUID,
    red_referee_id UUID,
    blue_referee_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRẠNG THÁI 9 CỨ ĐIỂM (CHẶNG 2)
CREATE TABLE arena_control_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    point_index INT NOT NULL, -- 1..9, số 5 là Lõi Vàng
    point_name VARCHAR(20),
    is_golden_core BOOLEAN DEFAULT FALSE,
    current_owner VARCHAR(10) DEFAULT 'NEUTRAL', -- NEUTRAL, RED, BLUE
    last_flipped_at TIMESTAMP WITH TIME ZONE,
    flipped_by_referee UUID
);

-- 5. NHẬT KÝ SỰ KIỆN TRẬN ĐẤU
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_color VARCHAR(10) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    point_value INT NOT NULL,
    target_point_index INT,
    match_timestamp_seconds INT,
    referee_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BAREM ĐIỂM ĐỘNG
CREATE TABLE scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_key VARCHAR(50) UNIQUE NOT NULL,
    rule_name VARCHAR(150) NOT NULL,
    score_value INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. ĐẶT LỊCH THỬ SA BÀN
CREATE TABLE practice_arena_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_number INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'CONFIRMED', -- CONFIRMED, COMPLETED, CANCELLED
    check_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. KHIẾU NẠI (HẠN 5 PHÚT)
CREATE TABLE match_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    appeal_timestamp_seconds INT,
    event_id UUID REFERENCES match_events(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    resolution_notes TEXT,
    resolved_by_referee UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. BÌNH CHỌN KHÁN GIẢ
CREATE TABLE fan_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_fingerprint VARCHAR(100) NOT NULL,
    voted_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    vote_category VARCHAR(50) DEFAULT 'MOST_CREATIVE_ROBOT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_voter_category UNIQUE (voter_fingerprint, vote_category)
);

-- BAREM MẶC ĐỊNH (Mục 5) – Chặng 1 còn mâu thuẫn với tài liệu sa bàn, cần BTC chốt
INSERT INTO scoring_rules (rule_key, rule_name, score_value, description) VALUES
    ('STAGE1_LINE1_FINISH',     'Hoàn thành Line 1 cơ bản',               20, 'Một lần duy nhất khi qua mốc 180°'),
    ('STAGE1_LINE2_FINISH',     'Hoàn thành Line 2 nâng cao',             30, 'Một lần duy nhất khi xe qua vạch đích Chặng 1'),
    ('STAGE1_TIME_BONUS',       'Thưởng tốc độ Chặng 1 (mỗi giây)',        1, 'Tính trên số giây về đích trước đối thủ'),
    ('STAGE1_OFF_TRACK',        'Lỗi lệch bánh/rời khỏi vạch line',       -5, 'Trọng tài bấm đếm số lần vi phạm'),
    ('STAGE2_NORMAL_FLIP',      'Lật thành công Cứ điểm Thường',          10, '8 cứ điểm biên, bù trừ đối kháng'),
    ('STAGE2_GOLDEN_CORE',      'Lật thành công Lõi Vàng Trung Tâm',      30, 'Cứ điểm số 5'),
    ('STAGE2_DOMINATION_BONUS', 'Thưởng chiếm trọn 1 hàng (3 ô)',         20, 'Tự tính nếu cùng màu 1 hàng ngang/dọc'),
    ('FOUL_ARENA_TOUCH',        'Xe va chạm làm biến dạng thành sân',    -10, 'Trọng tài cảnh cáo'),
    ('FOUL_HUMAN_INTERVENTION', 'Tay người can thiệp khi chưa có lệnh',  -20, 'Vi phạm an toàn thi đấu');

-- REALTIME cho điểm số và 9 cứ điểm
ALTER PUBLICATION supabase_realtime ADD TABLE matches, arena_control_points;
