-- Tài khoản BTC đầu tiên (chủ dự án). Thêm BTC khác qua trang /admin → Nhân sự.
INSERT INTO staff (email, full_name, role) VALUES ('phuocphuoc2507@gmail.com', 'Chủ nhiệm BTC', 'BTC') ON CONFLICT (email) DO NOTHING;

-- BTC cần thấy cả luật đang tắt để bật lại
CREATE POLICY "Staff read all rules" ON scoring_rules FOR SELECT TO authenticated USING (public.is_staff());
