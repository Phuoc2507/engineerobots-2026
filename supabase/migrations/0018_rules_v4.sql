-- 0018: Thể lệ (4) 29/10/2026
--  • Tự làm văng bóng Kiến thức của đội mình: −5 / lần, Trọng tài đặt lại (v3: bóng bị vô hiệu).
--  • Chiếm giữ Cầu Bản lĩnh: quá 10 giây (v3: 15 giây), vẫn −15.
--  • Cố ý tác động cấu kiện trong Trạm thành tựu đối phương: −10 / lần theo bảng phạt VI.2.3
--    (mục VIII.1 vẫn ghi −20, chờ BTC chốt).
--  • Bóng Kiến thức chỉ cần vượt gờ, nằm trọn trong Trạm (bỏ điều kiện "không tự lăn ra").
-- Giữ nguyên rule_key cũ để dữ liệu trận đã chấm không bị ảnh hưởng.

UPDATE scoring_rules SET
    description = 'Bóng Kiến thức màu đội vượt gờ chặn, nằm trọn trong Trạm thành tựu 300 × 300 mm'
    WHERE rule_key = 'STAGE2_BLOCK';

UPDATE scoring_rules SET
    description = 'Cố ý húc văng bóng Kiến thức của đối phương ra ngoài biên Chặng 2; Trọng tài đặt lại'
    WHERE rule_key = 'FOUL_KNOCK_OUT_BLOCK';

INSERT INTO scoring_rules (rule_key, rule_name, score_value, max_per_match, is_active, description) VALUES
    ('FOUL_KNOCK_OWN_BLOCK', 'Tự làm văng bóng Kiến thức của đội mình', -5, NULL, true,
     'Bóng Kiến thức của đội mình ra ngoài biên Chặng 2; Trọng tài đặt lại vị trí ban đầu')
ON CONFLICT (rule_key) DO UPDATE SET
    rule_name = EXCLUDED.rule_name, score_value = EXCLUDED.score_value, max_per_match = EXCLUDED.max_per_match,
    is_active = EXCLUDED.is_active, description = EXCLUDED.description;

UPDATE scoring_rules SET
    rule_name = 'Chiếm giữ Cầu Bản lĩnh quá 10 giây', score_value = -15, is_active = true,
    description = 'Cố tình đỗ trên Cầu Bản lĩnh quá 10 giây; bắt buộc lùi về'
    WHERE rule_key = 'FOUL_BRIDGE_PARK';

UPDATE scoring_rules SET
    rule_name = 'Tác động cấu kiện trong Trạm thành tựu đối phương', score_value = -10, is_active = true,
    description = 'Cố ý tác động vào cấu kiện trong Trạm thành tựu của đối phương; phục hồi nguyên trạng'
    WHERE rule_key = 'FOUL_INVADE_ZONE';
