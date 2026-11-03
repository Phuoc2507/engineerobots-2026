-- 0035: thêm tài khoản thử nghiệm 23144173@student.hcmute.edu.vn (được đăng ký đội dù không phải K26)
-- Danh sách khớp TEST_ACCOUNTS trong src/lib/site.ts. Xóa đội thử nghiệm ở /admin trước ngày thi.
CREATE OR REPLACE FUNCTION public.is_test_account(p_email text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
    SELECT lower(coalesce(p_email, '')) IN ('25134107@student.hcmute.edu.vn', '23144173@student.hcmute.edu.vn');
$$;
