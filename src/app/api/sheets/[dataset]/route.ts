import { DATASETS, anonClient, toRows } from "@/lib/sheetExport";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// CSV cho Google Sheet: =IMPORTDATA("https://…/api/sheets/teams?key=…"). Khóa do BTC tạo ở /admin, kiểm tra trong DB.
export async function GET(request: Request, { params }: { params: { dataset: string } }) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!DATASETS.some((d) => d.id === params.dataset)) return new Response("Bảng không hỗ trợ", { status: 404 });

  const { data, error } = await anonClient().rpc("sheet_export", { p_key: key, p_dataset: params.dataset });
  if (error) return new Response(error.message, { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  const csv = toRows(data).map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
