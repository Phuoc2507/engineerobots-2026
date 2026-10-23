"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { beep, evLabel, fmtClock, POINT_CELL, useMatchLive } from "@/lib/match";
import { MATCH_STATUS, SITE } from "@/lib/site";

// Bảng tỉ số trực tiếp: "stage" = màn hình LED/máy chiếu, "obs" = lớp phủ nền trong suốt cho livestream
export default function StageBoard({ matchId, variant = "stage" }: { matchId: string | null; variant?: "stage" | "obs" }) {
  const { data, missing, remaining } = useMatchLive(matchId);
  const [sound, setSound] = useState(false);
  const lastBeep = useRef(-1);

  // Bíp mỗi giây trong 10 giây cuối, bíp dài khi hết giờ
  useEffect(() => {
    if (!sound || data?.match.status !== "RUNNING") return;
    const s = Math.ceil(remaining);
    if (s === lastBeep.current) return;
    lastBeep.current = s;
    if (s <= 10 && s > 0) beep(880, 120);
    if (s === 0) beep(440, 900);
  }, [remaining, sound, data?.match.status]);

  if (!matchId || missing) return <Idle obs={variant === "obs"} />;
  if (!data) return null;

  const m = data.match;
  const urgent = m.status === "RUNNING" && remaining <= 30;
  const latest = data.events.find((e) => e.event_type !== "FLIP");

  if (variant === "obs") {
    return (
      <div className="flex items-start justify-center p-6 font-sans text-white">
        <div className="flex items-stretch overflow-hidden rounded-xl shadow-2xl">
          <div className="flex min-w-[260px] items-center justify-end gap-4 bg-team-red px-5 py-3">
            <span className="truncate font-display text-2xl uppercase">{data.red?.team_name ?? "Đỏ"}</span>
            <span className="font-display text-5xl tabular-nums">{m.red_score}</span>
          </div>
          <div className="flex min-w-[150px] flex-col items-center justify-center bg-navy px-5 py-2">
            <span className={`font-display text-4xl tabular-nums ${urgent ? "text-mech-red" : ""}`}>{fmtClock(remaining)}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">{m.match_code} · {MATCH_STATUS[m.status]}</span>
          </div>
          <div className="flex min-w-[260px] items-center gap-4 bg-team-blue px-5 py-3">
            <span className="font-display text-5xl tabular-nums">{m.blue_score}</span>
            <span className="truncate font-display text-2xl uppercase">{data.blue?.team_name ?? "Xanh"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-navy bg-tech-grid text-white">
      <header className="flex items-center justify-between px-8 py-5">
        <p className="font-display text-2xl uppercase tracking-wide">{SITE.name}</p>
        <p className="text-lg font-bold uppercase text-white/70">{m.stage} · Trận {m.match_code}</p>
        <button onClick={() => { setSound(!sound); if (!sound) beep(660, 80); }} className="rounded-full bg-white/10 p-2 opacity-40 hover:opacity-100" aria-label={sound ? "Tắt âm thanh" : "Bật âm thanh"}>
          {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </header>

      <main className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-8 px-8">
        <Side name={data.red?.team_name} robot={data.red?.robot_name} score={m.red_score} fouls={data.fouls.RED} tone="bg-team-red" win={m.status === "FINISHED" && m.winner === "RED"} />
        <div className="flex flex-col items-center gap-6">
          <div className={`rounded-2xl px-10 py-4 text-center ${urgent ? "animate-pulse bg-mech-red" : "bg-black/30"}`}>
            <p className="font-display text-[9rem] leading-none tabular-nums">{fmtClock(remaining)}</p>
            <p className="mt-2 text-xl font-bold uppercase tracking-widest text-white/80">{MATCH_STATUS[m.status] ?? m.status}</p>
          </div>
          {data.points.length > 0 && (
            <div className="grid grid-cols-3 grid-rows-3 gap-2">
              {data.points.map((p) => (
                <span key={p.index} className={`${POINT_CELL[p.index] ?? ""} flex h-20 w-20 items-center justify-center rounded-xl text-2xl font-bold transition-colors duration-500 ${p.owner === "RED" ? "bg-team-red" : p.owner === "BLUE" ? "bg-team-blue" : "bg-white/10"} ${p.golden ? "ring-4 ring-mech-gold" : ""}`}>
                  {p.golden ? "★" : ""}
                </span>
              ))}
            </div>
          )}
        </div>
        <Side name={data.blue?.team_name} robot={data.blue?.robot_name} score={m.blue_score} fouls={data.fouls.BLUE} tone="bg-team-blue" win={m.status === "FINISHED" && m.winner === "BLUE"} />
      </main>

      <footer className="px-8 pb-6">
        {m.status === "FINISHED" ? (
          <p className="rounded-xl bg-white py-4 text-center font-display text-3xl uppercase text-navy">
            {m.winner ? `Chiến thắng: ${m.winner === "RED" ? data.red?.team_name : data.blue?.team_name}` : "Hòa"}
          </p>
        ) : latest ? (
          <p className="rounded-xl bg-black/30 py-3 text-center text-xl">
            <span className={latest.team_color === "RED" ? "text-red-300" : "text-sky-300"}>{latest.team_color === "RED" ? data.red?.team_name : data.blue?.team_name}</span>
            {" · "}{evLabel(latest)} <b>{latest.point_value > 0 ? "+" : ""}{latest.point_value}</b>
          </p>
        ) : <div className="h-14" />}
      </footer>
    </div>
  );
}

function Side({ name, robot, score, fouls, tone, win }: { name?: string; robot?: string | null; score: number; fouls: number; tone: string; win: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-3xl ${tone} px-6 py-10 text-center shadow-2xl ${win ? "ring-8 ring-mech-gold" : ""}`}>
      <p className="line-clamp-2 font-display text-5xl uppercase leading-tight">{name ?? "—"}</p>
      {robot && <p className="mt-1 text-xl text-white/80">{robot}</p>}
      <p className="mt-4 font-display text-[11rem] leading-none tabular-nums">{score}</p>
      <p className="mt-2 text-lg font-bold uppercase text-white/80">{fouls} lỗi</p>
    </div>
  );
}

function Idle({ obs }: { obs: boolean }) {
  if (obs) return null;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy bg-tech-grid text-white">
      <p className="font-display text-7xl uppercase">{SITE.name}</p>
      <p className="mt-4 text-2xl text-white/70">Trận đấu sẽ bắt đầu trong ít phút</p>
    </div>
  );
}

// Tự theo trận hiện tại (đang đấu → sẵn sàng → sắp tới)
export function AutoStage({ variant = "stage" }: { variant?: "stage" | "obs" }) {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      const { data } = await createClient().rpc("get_current_match_id");
      setId((data as string | null) ?? null);
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);
  return <StageBoard matchId={id} variant={variant} />;
}
