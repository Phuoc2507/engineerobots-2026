-- 0020: BTC chốt 29/10: Chung kết, chạm bóng Cơ hội vàng khi chưa đủ 2 Kiến thức trong trạm = −10 / lần, Trọng tài đặt lại về Bục Cơ hội.
INSERT INTO scoring_rules (rule_key, rule_name, score_value, max_per_match, is_active, description) VALUES
    ('FOUL_TOUCH_GOLDEN', 'Chạm bóng Cơ hội vàng khi chưa đủ 2 Kiến thức', -10, NULL, true,
     'Vòng Chung kết: robot chạm bóng Cơ hội vàng khi đội chưa có đủ 2 bóng Kiến thức trong Trạm thành tựu; Trọng tài đặt lại về Bục Cơ hội')
ON CONFLICT (rule_key) DO UPDATE SET
    rule_name = EXCLUDED.rule_name, score_value = EXCLUDED.score_value, max_per_match = EXCLUDED.max_per_match,
    is_active = EXCLUDED.is_active, description = EXCLUDED.description;
