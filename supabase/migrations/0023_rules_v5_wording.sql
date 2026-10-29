-- 0023: chữ thể lệ v5 (29/10/2026): bóng vàng là "cố ý thu thập", không phải "chạm"
UPDATE scoring_rules SET rule_name = 'Cố ý thu thập bóng Cơ hội vàng khi chưa đủ 2 Kiến thức'
    WHERE rule_key = 'FOUL_TOUCH_GOLDEN';
