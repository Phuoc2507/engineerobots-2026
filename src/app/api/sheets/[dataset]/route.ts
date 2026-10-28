import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const DATASETS = ["teams", "members", "matches", "standings", "votes", "practice"];

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// CSV cho Google Sheet: =IMPORTDATA("https://…/api/sheets/teams?key=…"). Khóa do BTC tạo ở /admin, kiểm tra trong DB.
export async function GET(request: Request, { params }: { params: { dataset: string } }) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!DATASETS.includes(params.dataset)) return new Response("Bảng không hỗ trợ", { status: 404 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) }, // Next không được cache dữ liệu
  });
  const { data, error } = await supabase.rpc("sheet_export", { p_key: key, p_dataset: params.dataset });
  if (error) return new Response(error.message, { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  const rows = (data ?? []) as Record<string, unknown>[];
  const head = rows.length ? Object.keys(rows[0]) : ["Chưa có dữ liệu"];
  const csv = [head.map(cell).join(","), ...rows.map((r) => head.map((h) => cell(r[h])).join(","))].join("\r\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
