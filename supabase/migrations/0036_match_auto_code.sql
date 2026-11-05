-- 0036: trận để trống mã thì tự đặt theo vòng + số thứ tự (VL01, TK02, BK01…), hiện ở màn hình chiếu, lịch thi và biên bản.
-- BTC nhập mã riêng thì giữ nguyên mã đó.
CREATE OR REPLACE FUNCTION public._match_default_code()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
    v_stage  TEXT := lower(coalesce(NEW.stage, ''));
    v_prefix TEXT;
    v_next   INT;
BEGIN
    IF btrim(coalesce(NEW.match_code, '')) <> '' THEN RETURN NEW; END IF;
    v_prefix := CASE
        WHEN v_stage LIKE '%vòng loại%' THEN 'VL'
        WHEN v_stage LIKE '%1/8%' THEN 'V8'
        WHEN v_stage LIKE '%tứ kết%' THEN 'TK'
        WHEN v_stage LIKE '%bán kết%' THEN 'BK'
        WHEN v_stage LIKE '%hạng ba%' OR v_stage LIKE '%hạng 3%' THEN 'H3'
        WHEN v_stage LIKE '%chung kết%' THEN 'CK'
        WHEN v_stage LIKE '%giao hữu%' THEN 'GH'
        ELSE 'TD'
    END;
    SELECT coalesce(max(substring(match_code FROM '[0-9]+$')::int), 0) + 1 INTO v_next
    FROM matches WHERE match_code ~ ('^' || v_prefix || '[0-9]+$');
    NEW.match_code := v_prefix || lpad(v_next::text, 2, '0');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS matches_default_code ON public.matches;
CREATE TRIGGER matches_default_code BEFORE INSERT OR UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public._match_default_code();

-- Đặt mã cho các trận đã tạo mà chưa có mã
UPDATE public.matches SET match_code = NULL WHERE btrim(coalesce(match_code, '')) = '';
