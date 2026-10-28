-- 0013: Supabase chặn UPDATE không có WHERE (safeupdate) → admin_set_sheet_target thêm WHERE id.
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
