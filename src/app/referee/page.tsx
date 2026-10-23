import type { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, MonitorPlay } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStaff, isHead } from "@/lib/staff";
import { MATCH_STATUS } from "@/lib/site";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Trọng tài · Danh sách trận" };
export const dynamic = "force-dynamic";

const TZ = "Asia/Ho_Chi_Minh";
const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "—");
const TONE: Record<string, string> = {
  RUNNING: "bg-mech-red text-white", PAUSED: "bg-mech-gold text-navy", READY: "bg-navy-600 text-white", SCHEDULED: "bg-ice text-navy-600", FINISHED: "bg-slate-100 text-slate-500",
};

type Row = { id: string; match_code: string; stage: string; status: string; start_time: string | null; red_team: string | null; blue_team: string | null; red_score: number; blue_score: number };

export default async function RefereeHome() {
  const staff = await requireStaff();
  const { data } = await createClient().rpc("get_schedule");
  const rows = (data ?? []) as Row[];
  const order = (s: string) => ({ RUNNING: 0, PAUSED: 0, READY: 1, SCHEDULED: 2, FINISHED: 3 } as Record<string, number>)[s] ?? 2;
  const sorted = [...rows].sort((a, b) => order(a.status) - order(b.status));

  return (
    <AdminShell staff={staff} active="/referee" title="Trọng tài">
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
        <p className="text-sm text-slate-600">
          Mỗi trận có 2 trọng tài biên (Đỏ / Xanh) chấm trên điện thoại và 1 trọng tài chính giữ đồng hồ. Mở đúng phe được phân công.
        </p>
        {sorted.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">Chưa có trận nào. BTC tạo trận ở tab “Trận đấu”.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {sorted.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE[m.status] ?? ""}`}>{MATCH_STATUS[m.status] ?? m.status}</span>
                <b className="w-16 text-navy">{m.match_code}</b>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold text-team-red">{m.red_team ?? "?"}</span> <b className="text-navy">{m.red_score}–{m.blue_score}</b>{" "}
                  <span className="font-semibold text-team-blue">{m.blue_team ?? "?"}</span>
                  <span className="block text-xs text-slate-500">{m.stage} · {fmt(m.start_time)}</span>
                </span>
                <span className="flex flex-wrap gap-2">
                  <Link href={`/referee/scoring/${m.id}?side=RED`} className="rounded-md bg-team-red px-3 py-1.5 text-xs font-bold text-white">Chấm Đỏ</Link>
                  <Link href={`/referee/scoring/${m.id}?side=BLUE`} className="rounded-md bg-team-blue px-3 py-1.5 text-xs font-bold text-white">Chấm Xanh</Link>
                  {isHead(staff) && (
                    <Link href={`/referee/controller/${m.id}`} className="inline-flex items-center gap-1 rounded-md bg-navy px-3 py-1.5 text-xs font-bold text-white"><Gamepad2 className="h-3.5 w-3.5" /> Điều khiển</Link>
                  )}
                  <Link href={`/stage/${m.id}`} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold text-navy"><MonitorPlay className="h-3.5 w-3.5" /> Màn hình</Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
