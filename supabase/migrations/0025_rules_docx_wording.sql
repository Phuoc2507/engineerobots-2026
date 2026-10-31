-- Thể lệ (bản docx 31/10): lỗi ép khóa ghi rõ "vào vách sân". Giữ nguyên rule_key.
update public.scoring_rules
set description = 'Cố ý lấy đà đâm húc gây hư hại, hoặc ép khóa cứng robot đối phương vào vách sân quá 5 giây khi không tranh chấp cấu kiện'
where rule_key = 'FOUL_GATE_BLOCKING';
