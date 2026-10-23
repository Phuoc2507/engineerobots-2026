import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Swords, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SITE, TIMELINE } from "@/lib/site";
import PortalShell from "@/components/register/PortalShell";

export const metadata: Metadata = { title: "Lịch thi · ENGINEEROBOTS 2026" };

type MatchRow = {
  id: string;
  match_code: string | null;
  stage: string;
  status: string;
  start_time: string | null;
  red_team: string | null;
  red_robot: string | null;
  blue_team: string | null;
  blue_robot: string | null;
  red_score: number;
  blue_score: number;
  winner: "RED" | "BLUE" | null;
};

const TZ = "Asia/Ho_Chi_Minh";
const MATCH_STATUS: Record<string, { label: string; tone: string }> = {
  SCHEDULED: { label: "Sắp đấu", tone: "bg-ice text-navy-600" },
  READY: { label: "Chuẩn bị", tone: "bg-mech-gold/20 text-amber-800" },
  RUNNING: { label: "Đang đấu", tone: "bg-mech-red text-white" },
  PAUSED: { label: "Tạm dừng", tone: "bg-amber-100 text-amber-800" },
  FINISHED: { label: "Kết thúc", tone: "bg-slate-100 text-slate-600" },
};

const fmt = (s: string | null) =>
  s ? new Date(s).toLocaleString("vi-VN", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Chưa xếp giờ";

function Side({ team, robot, score, color, won, show }: { team: string | null; robot: string | null; score: number; color: "red" | "blue"; won: boolean; show: boolean }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-3 ${color === "blue" ? "flex-row-reverse text-right" : ""}`}>
      <span className={`h-10 w-1.5 shrink-0 rounded-full ${color === "red" ? "bg-team-red" : "bg-team-blue"}`} />
      <span className="min-w-0 flex-1">
        <span className={`block truncate font-bold ${won ? "text-navy" : "text-slate-700"}`}>
          {team ?? "Chờ xác định"} {won && <Trophy className="inline h-4 w-4 text-mech-gold" aria-label="Thắng" />}
        </span>
        {robot && <span className="block truncate text-xs text-slate-500">Robot {robot}</span>}
      </span>
      {show && <span className={`font-display text-3xl ${won ? "text-navy" : "text-slate-400"}`}>{score}</span>}
    </div>
  );
}

export default async function SchedulePage() {
  const { data } = await createClient().rpc("get_schedule");
  const matches = (data ?? []) as MatchRow[];
  const stages = Array.from(new Set(matches.map((m) => m.stage)));

  return (
    <PortalShell title="Lịch thi" subtitle={`Các mốc của ${SITE.name} và lịch từng trận, cập nhật trực tiếp từ BTC.`}>
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
        <h2 className="font-display text-xl uppercase tracking-wide text-navy">Các mốc của giải</h2>
        <ol className="mt-5 space-y-4 border-l-2 border-slate-200 pl-6">
          {TIMELINE.map((t) => {
            const current = t.status === "current";
            return (
              <li key={t.title} className="relative">
                <span className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-white ${current ? "bg-mech-red" : "bg-slate-300"}`} />
                <p className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${current ? "text-mech-red" : "text-slate-400"}`}>
                  <CalendarClock className="h-3.5 w-3.5" /> {t.date}
                </p>
                <p className="font-bold text-navy">{t.title}</p>
                <p className="text-sm text-slate-600">{t.desc}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
        <h2 className="flex items-center gap-2 font-display text-xl uppercase tracking-wide text-navy">
          <Swords className="h-5 w-5 text-mech-red" /> Lịch trận đấu
        </h2>
        {matches.length === 0 ? (
          <div className="mt-4 rounded-lg bg-ice p-6 text-center text-sm text-slate-500">
            <p className="font-semibold text-navy">Lịch trận sẽ công bố sau buổi bốc thăm chia bảng.</p>
            <p className="mt-1">
              Đội đã được duyệt có thể <Link href="/team/dashboard" className="font-semibold text-navy-600 underline">đặt lịch thử sa bàn</Link> trong lúc chờ.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {stages.map((stage) => (
              <div key={stage}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mech-red">{stage}</h3>
                <ul className="mt-2 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
                  {matches.filter((m) => m.stage === stage).map((m) => {
                    const st = MATCH_STATUS[m.status] ?? { label: m.status, tone: "bg-slate-100 text-slate-600" };
                    const show = m.status !== "SCHEDULED" && m.status !== "READY";
                    return (
                      <li key={m.id} className="px-4 py-3">
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                          <span>{m.match_code && <b className="mr-2 text-navy">{m.match_code}</b>}{fmt(m.start_time)}</span>
                          <span className={`rounded-full px-2 py-0.5 font-bold ${st.tone}`}>{st.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Side team={m.red_team} robot={m.red_robot} score={m.red_score} color="red" won={m.winner === "RED"} show={show} />
                          <span className="shrink-0 text-xs font-bold text-slate-300">VS</span>
                          <Side team={m.blue_team} robot={m.blue_robot} score={m.blue_score} color="blue" won={m.winner === "BLUE"} show={show} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </PortalShell>
  );
}
