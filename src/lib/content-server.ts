import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { mergeContent, type Content } from "@/lib/content";

export const CONTENT_TAG = "site-content";

// Đọc nội dung BTC đã sửa bằng khóa công khai (không dùng cookie) để trang công khai vẫn được cache;
// lưu ở /admin/content sẽ làm mới cache qua revalidateTag
export const getContent: () => Promise<Content> = unstable_cache(
  async () => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error) console.error("site_content:", error.message);
    return mergeContent(data ?? []);
  },
  ["site-content"],
  { tags: [CONTENT_TAG], revalidate: 600 },
);
