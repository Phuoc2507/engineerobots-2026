import type { Metadata } from "next";
import type { ComponentProps } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import { card } from "@/components/admin/ui";
import SheetLink from "@/components/admin/SheetLink";
import { serviceAccount } from "@/lib/googleSheets";

export const metadata: Metadata = { title: "Quản trị · Tổng quan" };
export const dynamic = "force-dynamic";

type Team = { id: string; team_name: string; major: string; status: string; inspection_passed: boolean; created_at: string; team_members: { id: string }[] };
type Match = { id: string; match_code: string | null; stage: string; status: string; start_time: string | null; red_team_id: string | null; blue_team_id: string | null; red_score: number; blue_score: number };
type Standing = { stage: string; team_id: string; team_name: string; played: number; won: number; points: number; score_for: number };
type Vote = { team_name: string; votes: number };

const TZ = "Asia/Ho_Chi_Minh";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const fmt = (s: string) => new Date(s).toLocaleString("vi-VN", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Stat({ label, value, sub, href }: { label: string; value: number | string; sub?: string; href?: string }) {
  const body = (
    <>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-display text-4xl text-navy">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </>
  );
  const cls = "block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200";
  return href ? <Link href={href} className={`${cls} transition hover:ring-navy-600`}>{body}</Link> : <div className={cls}>{body}</div>;
}

// Thanh ngang một màu, giá trị in bằng chữ thường (không dựa vào màu)
function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_1fr_2.5rem] items-center gap-3 text-sm" title={`${r.label}: ${r.value}`}>
          <span className="truncate text-slate-600">{r.label}</span>
          <span className="h-3 rounded-r bg-slate-100">
            <span className="block h-3 rounded-r bg-navy-600" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="text-right font-semibold tabular-nums text-navy">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminOverview() {
  const staff = await requireStaff(["BTC"]);
  const supabase = createClient();
  const [{ data: teamsData }, { data: matchesData }, { data: appeals }, { data: bookings }, { data: votesData }, { data: standingsData }, { data: sheet }] =
    await Promise.all([
      supabase.from("teams").select("id, team_name, major, status, inspection_passed, created_at, team_members(id)"),
      supabase.from("matches").select("id, match_code, stage, status, start_time, red_team_id, blue_team_id, red_score, blue_score")
        .order("start_time", { ascending: true, nullsFirst: false }),
      supabase.from("match_appeals").select("id, status"),
      supabase.from("practice_arena_bookings").select("id, status, check_in_at"),
      supabase.rpc("vote_results"),
      supabase.rpc("get_standings"),
      supabase.rpc("admin_get_sheet_key"),
    ]);

  const teams = (teamsData ?? []) as Team[];
  const matches = (matchesData ?? []) as Match[];
  const votes = (votesData ?? []) as Vote[];
  const standings = (standingsData ?? []) as Standing[];
  const name = new Map(teams.map((t) => [t.id, t.team_name]));

  const byStatus = (s: string) => teams.filter((t) => t.status === s).length;
  const approved = byStatus("APPROVED");
  const inspected = teams.filter((t) => t.status === "APPROVED" && t.inspection_passed).length;
  const members = teams.reduce((n, t) => n + t.team_members.length, 0);
  const live = matches.filter((m) => m.status === "RUNNING" || m.status === "PAUSED");
  const finished = matches.filter((m) => m.status === "FINISHED").length;
  const upcoming = matches.filter((m) => m.status === "SCHEDULED" || m.status === "READY");
  const pendingAppeals = (appeals ?? []).filter((a) => a.status === "PENDING").length;
  const activeBookings = (bookings ?? []).filter((b) => b.status !== "CANCELLED");
  const totalVotes = votes.reduce((n, v) => n + v.votes, 0);

  // Đăng ký theo ngày, 14 ngày gần nhất
  const days = Array.from({ length: 14 }, (_, i) => dayKey(new Date(Date.now() - (13 - i) * 86400000)));
  const perDay = new Map(days.map((d) => [d, 0]));
  teams.forEach((t) => { const k = dayKey(new Date(t.created_at)); if (perDay.has(k)) perDay.set(k, perDay.get(k)! + 1); });
  const dayMax = Math.max(1, ...Array.from(perDay.values()));

  const majors = Object.entries(teams.reduce<Record<string, number>>((m, t) => ({ ...m, [t.major]: (m[t.major] ?? 0) + 1 }), {}))
    .map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  const topStage = standings[0]?.stage;
  const top = standings.filter((s) => s.stage === topStage).slice(0, 5);

  return (
    <AdminShell staff={staff} active="/admin" title="Tổng quan">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Đội đăng ký" value={teams.length} sub={`${members} thành viên`} href="/admin/teams" />
        <Stat label="Chờ duyệt" value={byStatus("PENDING")} sub={`${byStatus("REJECTED")} cần bổ sung`} href="/admin/teams" />
        <Stat label="Đã duyệt" value={approved} sub={`${inspected}/${approved} đạt kiểm tra KT`} href="/admin/checkin" />
        <Stat label="Khiếu nại chờ" value={pendingAppeals} sub={`${(appeals ?? []).length} tổng`} href="/admin/appeals" />
        <Stat label="Trận đã đấu" value={`${finished}/${matches.length}`} sub={live.length ? `${live.length} đang diễn ra` : "Không có trận đang diễn ra"} href="/admin/matches" />
        <Stat label="Trận sắp tới" value={upcoming.length} href="/admin/matches" />
        <Stat label="Lượt thử sa bàn" value={activeBookings.length} sub={`${activeBookings.filter((b) => b.check_in_at).length} đã check-in`} href="/admin/practice" />
        <Stat label="Lượt bình chọn" value={totalVotes} href="/admin/settings" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="font-display text-xl uppercase text-navy">Đăng ký 14 ngày qua</h2>
          <div className="mt-5 flex h-40 items-end gap-1" role="img" aria-label="Số đội đăng ký theo ngày trong 14 ngày gần nhất">
            {Array.from(perDay).map(([d, n]) => (
              <div key={d} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.slice(8)}/${d.slice(5, 7)}: ${n} đội`}>
                {n > 0 && <span className="mb-1 text-center text-[10px] font-semibold text-slate-600">{n}</span>}
                <div className="rounded-t bg-navy-600 group-hover:bg-navy" style={{ height: `${(n / dayMax) * 85}%`, minHeight: n ? 4 : 1 }} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 text-[10px] text-slate-500">
            <span>{days[0].slice(8)}/{days[0].slice(5, 7)}</span>
            <span>Hôm nay</span>
          </div>
        </section>

        <section className={card}>
          <h2 className="font-display text-xl uppercase text-navy">Đội theo ngành</h2>
          <div className="mt-5"><Bars rows={majors} /></div>
        </section>

        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl uppercase text-navy">Trận sắp tới</h2>
            <Link href="/admin/matches" className="text-sm font-semibold text-navy-600 hover:underline">Tất cả →</Link>
          </div>
          {[...live, ...upcoming].length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Chưa có trận nào được xếp lịch.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {[...live, ...upcoming].slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <b className="text-navy">{m.match_code ?? m.stage}</b>{" "}
                    <span className="text-slate-600">{name.get(m.red_team_id ?? "") ?? "?"} vs {name.get(m.blue_team_id ?? "") ?? "?"}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {m.status === "RUNNING" || m.status === "PAUSED" ? <b className="text-mech-red">● {m.red_score} – {m.blue_score}</b> : m.start_time ? fmt(m.start_time) : "Chưa có giờ"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-display text-xl uppercase text-navy">Bảng xếp hạng {topStage ? `· ${topStage}` : ""}</h2>
          {top.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Chưa có trận nào kết thúc.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr><th className="py-1">#</th><th>Đội</th><th className="text-right">Trận</th><th className="text-right">Thắng</th><th className="text-right">Điểm</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top.map((s, i) => (
                  <tr key={s.team_id}>
                    <td className="py-1.5 font-semibold text-slate-500">{i + 1}</td>
                    <td className="font-semibold text-navy">{s.team_name}</td>
                    <td className="text-right tabular-nums">{s.played}</td>
                    <td className="text-right tabular-nums">{s.won}</td>
                    <td className="text-right font-bold tabular-nums text-navy">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <SheetLink initial={(sheet as ComponentProps<typeof SheetLink>["initial"]) ?? null} serviceEmail={serviceAccount()?.client_email ?? null} />
    </AdminShell>
  );
}
