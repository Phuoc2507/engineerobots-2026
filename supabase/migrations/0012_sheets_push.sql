-- 0012: Đẩy dữ liệu vào Google Sheet mỗi phút (thay Apps Script khi Google chặn quyền).
--  • sheet_export_keys thêm sheet_id + trạng thái lần đồng bộ gần nhất.
--  • pg_cron mỗi phút gọi POST /api/sheets/sync?key=… (pg_net); web ký service account rồi ghi Sheet.
--    Khóa service account chỉ nằm trong env Vercel GOOGLE_SERVICE_ACCOUNT_JSON.

ALTER TABLE sheet_export_keys
    ADD COLUMN sheet_id        TEXT,
    ADD COLUMN last_sync_at    TIMESTAMPTZ,
    ADD COLUMN last_sync_error TEXT;

CREATE OR REPLACE FUNCTION public.admin_get_sheet_key()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được xem khóa Google Sheet.'; END IF;
    RETURN (SELECT jsonb_build_object('key', k.key, 'created_at', k.created_at, 'created_by', k.created_by,
                                      'sheet_id', k.sheet_id, 'last_sync_at', k.last_sync_at, 'last_sync_error', k.last_sync_error)
            FROM sheet_export_keys k);
END;
$$;

-- p_sheet_id NULL = bỏ liên kết
CREATE OR REPLACE FUNCTION public.admin_set_sheet_target(p_sheet_id TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ BTC được liên kết Google Sheet.'; END IF;
    IF p_sheet_id IS NOT NULL AND p_sheet_id !~ '^[A-Za-z0-9_-]{20,100}$' THEN RAISE EXCEPTION 'ID Google Sheet không hợp lệ.'; END IF;
    UPDATE sheet_export_keys SET sheet_id = p_sheet_id, last_sync_at = NULL, last_sync_error = NULL WHERE id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Tạo khóa liên kết trước.'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sheet_sync_target(p_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v TEXT;
BEGIN
    SELECT sheet_id INTO v FROM sheet_export_keys WHERE key = p_key AND length(p_key) >= 32;
    IF NOT FOUND THEN RAISE EXCEPTION 'Khóa Google Sheet không hợp lệ.'; END IF;
    RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION public.sheet_sync_report(p_key TEXT, p_error TEXT)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    UPDATE sheet_export_keys SET last_sync_at = now(), last_sync_error = left(p_error, 500)
    WHERE key = p_key AND length(p_key) >= 32;
$$;

REVOKE ALL ON FUNCTION public.admin_set_sheet_target(TEXT), public.sheet_sync_target(TEXT), public.sheet_sync_report(TEXT, TEXT)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_sheet_target(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sheet_sync_target(TEXT), public.sheet_sync_report(TEXT, TEXT) TO anon, authenticated;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule('sheets-sync', '* * * * *', $job$
    SELECT net.http_post(url := 'https://engineerobots-2026.vercel.app/api/sheets/sync?key=' || key, timeout_milliseconds := 30000)
    FROM public.sheet_export_keys WHERE sheet_id IS NOT NULL
$job$);
