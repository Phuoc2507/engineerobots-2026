import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import { MATCH_STATUS } from "@/lib/site";
import { minutesCode, REASON_TYPES } from "@/lib/minutes";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Biên bản chỉnh điểm" };
export const dynamic = "force-dynamic";

const TZ = "Asia/Ho_Chi_Minh";
const fmt = (s: string) => new Date(s).toLocaleString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });

export default async function MinutesList() {
  const staff = await requireStaff(["BTC", "HEAD_REFEREE"]);
  const supabase = createClient();
  const [{ data: minutes }, { data: matches }] = await Promise.all([
    supabase.from("match_minutes").select("id, match_id, seq, reason_type, reason, red_before, blue_before, red_after, blue_after, created_by, created_at").order("created_at", { ascending: false }),
    supabase.from("matches").select("id, match_code, stage, status, red_score, blue_score").in("status", ["RUNNING", "PAUSED", "FINISHED"]).order("start_time", { ascending: true, nullsFirst: false }),
  ]);
  const code = (id: string) => matches?.find((m) => m.id === id)?.match_code ?? null;

  return (
    <AdminShell staff={staff} active="/referee/minutes" title="Biên bản chỉnh điểm">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
          <h2 className="font-display text-xl uppercase text-navy">Đã lập ({minutes?.length ?? 0})</h2>
          {!minutes?.length ? (
            <p className="mt-4 text-sm text-slate-500">Chưa có biên bản nào. Chọn trận ở cột bên để lập biên bản khi cần chỉnh điểm.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {minutes.map((x) => (
                <li key={x.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <Link href={`/referee/minutes/${x.id}`} className="font-bold text-navy-600 underline">{minutesCode(code(x.match_id), x.seq)}</Link>
                  <span className="rounded-full bg-ice px-2.5 py-0.5 text-xs font-bold text-navy">{REASON_TYPES[x.reason_type] ?? x.reason_type}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-600">{x.reason}</span>
                  <span className="whitespace-nowrap text-slate-600">Đỏ {x.red_before}→<b>{x.red_after}</b> · Xanh {x.blue_before}→<b>{x.blue_after}</b></span>
                  <span className="whitespace-nowrap text-xs text-slate-400">{fmt(x.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-display text-xl uppercase text-navy">Lập biên bản mới</h2>
          <p className="mt-1 text-xs text-slate-500">Chọn trận đã / đang đấu cần chỉnh điểm.</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {!matches?.length && <li className="text-slate-500">Chưa có trận nào bắt đầu.</li>}
            {matches?.map((m) => (
              <li key={m.id}>
                <Link href={`/referee/revise/${m.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-ice">
                  <FilePlus2 className="h-4 w-4 text-navy-600" />
                  <b className="text-navy">{m.match_code}</b>
                  <span className="flex-1 text-slate-500">{m.stage} · {MATCH_STATUS[m.status]}</span>
                  <span className="tabular-nums text-slate-600">{m.red_score}–{m.blue_score}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AdminShell>
  );
}
