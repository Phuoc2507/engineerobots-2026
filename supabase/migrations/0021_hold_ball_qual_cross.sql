-- 0021: BTC trả lời 12 câu (29/10)
--  • Được chặn đường đối phương nhưng cầm / giữ bóng Kiến thức của đối phương: −10 / lần, đặt bóng về vị trí ban đầu.
--  • Vòng loại: robot sang nửa sân đối phương hoặc cản phá ở Chặng 2: −15 / lần và buộc Retry.
INSERT INTO scoring_rules (rule_key, rule_name, score_value, max_per_match, is_active, description) VALUES
    ('FOUL_HOLD_OPP_BLOCK', 'Cầm, giữ bóng Kiến thức của đối phương', -10, NULL, true,
     'Chặng 2: robot cầm, giữ hoặc mang bóng Kiến thức của đối phương (được phép chặn đường); Trọng tài đặt bóng về vị trí ban đầu'),
    ('FOUL_QUAL_CROSS', 'Vòng loại: sang nửa sân đối phương', -15, NULL, true,
     'Vòng loại, Chặng 2: robot sang nửa sân đối phương hoặc cản phá đối phương; buộc Retry về Ô Retry Chặng 2')
ON CONFLICT (rule_key) DO UPDATE SET
    rule_name = EXCLUDED.rule_name, score_value = EXCLUDED.score_value, max_per_match = EXCLUDED.max_per_match,
    is_active = EXCLUDED.is_active, description = EXCLUDED.description;
