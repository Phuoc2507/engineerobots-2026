-- Ràng buộc bảng chỉ còn bắt MSSV 8 số; điều kiện K26 (tiền tố 26) do _validate_team kiểm tra,
-- để tài khoản thử nghiệm của BTC (is_test_account) lưu được đội có MSSV khóa khác.
ALTER TABLE public.team_members DROP CONSTRAINT team_members_student_id_k26;
ALTER TABLE public.team_members ADD CONSTRAINT team_members_student_id_8digits CHECK (student_id ~ '^[0-9]{8}$');
