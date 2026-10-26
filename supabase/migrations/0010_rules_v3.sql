-- 0010: Thể lệ bản 26/10/2026 (bản 2): robot chỉ có càng đẩy, Bục Vinh Quang 2 bậc 100 mm, phạt mới.
-- Giữ rule_key cũ để không vỡ dữ liệu trận đã ghi.

INSERT INTO scoring_rules (rule_key, rule_name, score_value, max_per_match, is_active, description) VALUES
    ('FOUL_KNOCK_OUT_BLOCK', 'Húc văng cấu kiện Kiến thức ra ngoài sân', -10, NULL, true,
     'Cố ý húc văng cấu kiện Kiến thức của đối phương ra ngoài biên Chặng 2, hoặc tự làm văng cấu kiện; Trọng tài đặt lại cấu kiện'),
    ('FOUL_TERRAIN_LINE', 'Chạm vạch giới hạn Địa hình Thử thách', -5, NULL, true,
     'Nhiệm vụ 1 Chặng 3: robot chạm cạnh giới hạn đoạn đường Địa hình (3.3 / 3.4)'),
    ('FOUL_DROP_PROJECT', 'Làm rơi Cấu kiện Đồ án', -5, NULL, true,
     'Nhiệm vụ 2 Chặng 3: cấu kiện rơi khỏi dốc hoặc Đài Bảo vệ; đưa về Trạm Thực nghiệm')
ON CONFLICT (rule_key) DO UPDATE SET rule_name = EXCLUDED.rule_name, score_value = EXCLUDED.score_value,
    max_per_match = EXCLUDED.max_per_match, is_active = EXCLUDED.is_active, description = EXCLUDED.description;

UPDATE scoring_rules SET rule_name = 'Ép khóa cứng robot đối phương vào vách > 5 giây',
    description = 'Mỗi lần dùng càng đẩy ép khóa cứng robot đối phương vào vách sân quá 5 giây' WHERE rule_key = 'FOUL_GATE_BLOCKING';
UPDATE scoring_rules SET rule_name = 'Bảo vệ Đồ án (cấu kiện vào Ô bảo vệ)',
    description = 'Đẩy Cấu kiện Đồ án từ Trạm Thực nghiệm lên Dốc Kiên trì 10°, nằm trọn trong Ô bảo vệ 100 × 100 mm trên Đài cao 100 mm'
    WHERE rule_key = 'STAGE3_PROJECT';
UPDATE scoring_rules SET description = 'Nhấn nút đèn trên Đỉnh Bục Vinh Quang (200 mm) bằng mũi xe hoặc càng đẩy; đội bật trước khi Cấu kiện Đồ án đã ở Ô bảo vệ thắng tuyệt đối'
    WHERE rule_key = 'STAGE3_LAMP';
