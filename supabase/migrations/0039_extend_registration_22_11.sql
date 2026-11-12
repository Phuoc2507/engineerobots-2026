-- Gia hạn đăng ký đến hết ngày 22/11/2026 (khớp SITE.registrationDeadline ở web).
-- Nội dung BTC chỉnh ở /admin (site_content 'site'.registrationDeadline) vẫn được ưu tiên nếu có.
CREATE OR REPLACE FUNCTION public.registration_open()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
    SELECT now() <= coalesce((SELECT (value->>'registrationDeadline')::timestamptz FROM site_content WHERE key = 'site'),
                             TIMESTAMPTZ '2026-11-22 23:59:59+07');
$$;
