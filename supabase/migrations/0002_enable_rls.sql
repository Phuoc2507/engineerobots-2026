-- Bật RLS cho mọi bảng. Mặc định chặn hết; chỉ mở quyền ĐỌC công khai cho dữ liệu trận đấu
-- (bảng điểm live). Ghi dữ liệu và đọc thông tin đội/thành viên sẽ mở qua policy theo vai trò (Giai đoạn 2).

ALTER TABLE teams                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_control_points    ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_arena_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_appeals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_votes               ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read matches"         ON matches              FOR SELECT USING (true);
CREATE POLICY "Public read control points"  ON arena_control_points FOR SELECT USING (true);
CREATE POLICY "Public read match events"    ON match_events         FOR SELECT USING (true);
CREATE POLICY "Public read active rules"    ON scoring_rules        FOR SELECT USING (is_active);
