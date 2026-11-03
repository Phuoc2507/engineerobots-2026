import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_TAG } from "@/lib/content-server";
import { DEFAULT_CONTENT } from "@/lib/content";

// Lưu một mục nội dung (value = null → về mặc định). Quyền BTC kiểm ở admin_set_content trong DB.
export async function POST(request: Request) {
  const { key, value } = (await request.json().catch(() => ({}))) as { key?: string; value?: unknown };
  if (!key || !(key in DEFAULT_CONTENT)) return NextResponse.json({ error: "Mục nội dung không hợp lệ." }, { status: 400 });
  const { error } = await createClient().rpc("admin_set_content", { p_key: key, p_value: value ?? null });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
