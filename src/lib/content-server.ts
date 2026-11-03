import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { mergeContent, type Content } from "@/lib/content";

export const CONTENT_TAG = "site-content";

type Row = { key: string; value: unknown };

// Đọc nội dung BTC đã sửa bằng khóa công khai (không dùng cookie) để trang công khai vẫn được cache;
// lưu ở /admin/content sẽ làm mới cache qua revalidateTag.
// Chỉ cache các dòng thô: ghép với mặc định làm ở ngoài để thêm mục mới trong code không bị bản cache cũ thiếu trường
const getRows = unstable_cache(
  async (): Promise<Row[]> => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error) console.error("site_content:", error.message);
    return data ?? [];
  },
  ["site-content-rows"],
  { tags: [CONTENT_TAG], revalidate: 600 },
);

export const getContent: () => Promise<Content> = cache(async () => {
  const rows = await getRows();
  return mergeContent(Array.isArray(rows) ? rows : []);
});
