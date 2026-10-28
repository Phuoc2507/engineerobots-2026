import { NextResponse } from "next/server";
import { writeSheets } from "@/lib/googleSheets";
import { DATASETS, anonClient, toRows } from "@/lib/sheetExport";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Đẩy 6 bảng vào Google Sheet đã liên kết. Supabase pg_cron gọi mỗi phút; BTC bấm "Đồng bộ ngay" cũng gọi vào đây.
export async function POST(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  const supabase = anonClient();
  const { data: sheetId, error } = await supabase.rpc("sheet_sync_target", { p_key: key });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  if (!sheetId) return NextResponse.json({ error: "Chưa liên kết Google Sheet." }, { status: 400 });

  try {
    const tabs = await Promise.all(DATASETS.map(async (d) => {
      const { data, error } = await supabase.rpc("sheet_export", { p_key: key, p_dataset: d.id });
      if (error) throw new Error(error.message);
      return { title: d.label, rows: toRows(data) };
    }));
    await writeSheets(sheetId as string, tabs);
    await supabase.rpc("sheet_sync_report", { p_key: key, p_error: null });
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.rpc("sheet_sync_report", { p_key: key, p_error: msg });
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
