-- 0019: BTC chốt 29/10: cố ý tác động cấu kiện trong Trạm thành tựu đối phương = −20 / lần (theo VIII.1).
UPDATE scoring_rules SET score_value = -20 WHERE rule_key = 'FOUL_INVADE_ZONE';
