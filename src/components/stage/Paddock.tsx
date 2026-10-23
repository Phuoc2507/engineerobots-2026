"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MATCH_STATUS, SITE } from "@/lib/site";

type Row = {
  id: string; match_code: string; stage: string; status: string; start_time: string | null;
  red_team: string | null; red_robot: string | null; blue_team: string | null; blue_robot: string | null;
};

const time = (s: string | null) => s ? new Date(s).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }) : "—";

// Màn hình khu chờ: trận đang đấu + các trận kế tiếp để đội chuẩn bị
export default function Paddock() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const load = async () => {
      const { data } = await createClient().rpc("get_schedule");
      setRows(((data ?? []) as Row[]).filter((r) => r.status !== "FINISHED"));
    };
    load();
    const a = setInterval(load, 10000);
    const b = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  const live = rows?.filter((r) => r.status === "RUNNING" || r.status === "PAUSED" || r.status === "READY") ?? [];
  const next = rows?.filter((r) => r.status === "SCHEDULED").slice(0, 6) ?? [];

  return (
    <div className="min-h-screen bg-navy bg-tech-grid px-10 py-8 text-white">
      <header className="flex items-end justify-between">
        <div>
          <p className="section-kicker text-mech-gold">Khu chờ thi đấu</p>
          <h1 className="font-display text-5xl uppercase">{SITE.name}</h1>
        </div>
        <p className="font-display text-6xl tabular-nums">{now.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
      </header>

      {rows === null ? null : rows.length === 0 ? (
        <p className="mt-24 text-center text-3xl text-white/70">Chưa có trận nào sắp diễn ra.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {live.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold uppercase tracking-widest text-mech-gold">Trên sân</h2>
              <div className="space-y-3">{live.map((r) => <Line key={r.id} r={r} hot />)}</div>
            </section>
          )}
          <section>
            <h2 className="mb-3 text-xl font-bold uppercase tracking-widest text-white/60">Trận tiếp theo · chuẩn bị robot</h2>
            <div className="space-y-3">
              {next.length === 0 && <p className="text-xl text-white/50">Không còn trận nào trong lịch.</p>}
              {next.map((r, i) => <Line key={r.id} r={r} hot={false} first={i === 0} />)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Line({ r, hot, first }: { r: Row; hot: boolean; first?: boolean }) {
  return (
    <div className={`grid grid-cols-[140px_1fr_auto_1fr_160px] items-center gap-6 rounded-2xl px-6 py-4 ${hot ? "bg-white text-navy" : first ? "bg-white/15 ring-2 ring-mech-gold" : "bg-white/5"}`}>
      <div>
        <p className="font-display text-3xl">{r.match_code}</p>
        <p className="text-sm opacity-70">{r.stage}</p>
      </div>
      <div className="text-right">
        <p className="truncate font-display text-3xl uppercase text-team-red">{r.red_team ?? "Chờ xác định"}</p>
        {r.red_robot && <p className="text-sm opacity-70">{r.red_robot}</p>}
      </div>
      <span className="font-display text-2xl opacity-60">VS</span>
      <div>
        <p className="truncate font-display text-3xl uppercase text-team-blue">{r.blue_team ?? "Chờ xác định"}</p>
        {r.blue_robot && <p className="text-sm opacity-70">{r.blue_robot}</p>}
      </div>
      <div className="text-right">
        <p className="font-display text-3xl tabular-nums">{time(r.start_time)}</p>
        <p className="text-sm font-bold uppercase opacity-70">{MATCH_STATUS[r.status] ?? r.status}</p>
      </div>
    </div>
  );
}
