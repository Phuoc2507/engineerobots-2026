"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { beep, evLabel, fmtClock, foulList, groupTotals, useMatchLive } from "@/lib/match";
import { MATCH_STATUS, SITE } from "@/lib/site";

// Bảng tỉ số trực tiếp: "stage" = màn hình LED/máy chiếu, "obs" = lớp phủ nền trong suốt cho livestream
export type IdleText = { idleTitle: string; idleText: string };
export type NextMatch = { time: string; code: string; red: string; blue: string };

// idleView: màn chờ thay thế (ấn phẩm + lịch); autoIdleSeconds: chế độ tự động – trận chưa bắt đầu hoặc đã xong quá số giây này thì về màn chờ
export default function StageBoard({ matchId, variant = "stage", idle, siteName, logo, idleView, autoIdleSeconds, next, nextLabel = "Trận tiếp theo" }: {
  matchId: string | null; variant?: "stage" | "obs"; idle?: IdleText; siteName?: string; logo?: string;
  idleView?: ReactNode; autoIdleSeconds?: number; next?: NextMatch | null; nextLabel?: string;
}) {
  const { data, missing, remaining } = useMatchLive(matchId);
  const [sound, setSound] = useState(false);
  const lastBeep = useRef(-1);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (autoIdleSeconds === undefined) return;
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, [autoIdleSeconds]);

  // Bíp mỗi giây trong 10 giây cuối, bíp dài khi hết giờ
  useEffect(() => {
    if (!sound || data?.match.status !== "RUNNING") return;
    const s = Math.ceil(remaining);
    if (s === lastBeep.current) return;
    lastBeep.current = s;
    if (s <= 10 && s > 0) beep(880, 120);
    if (s === 0) beep(440, 900);
  }, [remaining, sound, data?.match.status]);

  if (!matchId || missing) return variant === "stage" && idleView ? <>{idleView}</> : <Idle obs={variant === "obs"} idle={idle} />;
  if (!data) return variant === "stage" && idleView ? <>{idleView}</> : null;

  const m = data.match;
  if (variant === "stage" && idleView && autoIdleSeconds !== undefined
    && (m.status === "SCHEDULED" || (m.status === "FINISHED" && m.finished_at && now - new Date(m.finished_at).getTime() > autoIdleSeconds * 1000))) {
    return <>{idleView}</>;
  }
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
    <div className="relative flex min-h-screen flex-col bg-part-stage bg-tech-grid text-white">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 py-4">
        <div className="flex min-w-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo && <img src={logo} alt="Logo đơn vị tổ chức" className="h-16 w-auto object-contain" />}
        </div>
        <div className="text-center">
          <p className="font-display text-5xl uppercase leading-none tracking-wide">{siteName ?? SITE.name}</p>
          <p className="mt-2 text-3xl font-bold uppercase leading-none tracking-wider text-mech-gold">{m.stage}</p>
        </div>
        <div className="flex justify-end">
          {m.match_code && (
            <p className="text-right leading-none">
              <span className="block text-base font-bold uppercase tracking-[0.25em] text-white/70">Mã trận</span>
              <span className="mt-1 block font-display text-5xl uppercase tracking-wide">{m.match_code}</span>
            </p>
          )}
        </div>
      </header>

      <main className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-8 px-8">
        <Side name={data.red?.team_name} score={m.red_score} tone="bg-team-red" win={m.status === "FINISHED" && m.winner === "RED"} totals={groupTotals(data.events, "RED")} fouls={foulList(data.events, "RED")} />
        <div className={`rounded-2xl px-10 py-5 text-center ${urgent ? "animate-pulse bg-mech-red" : "bg-black/30"}`}>
          <p className="font-display text-[clamp(7rem,22vh,12rem)] leading-none tabular-nums">{fmtClock(remaining)}</p>
          <p className="mt-2 text-2xl font-bold uppercase tracking-widest text-white/80">{MATCH_STATUS[m.status] ?? m.status}</p>
        </div>
        <Side name={data.blue?.team_name} score={m.blue_score} tone="bg-team-blue" win={m.status === "FINISHED" && m.winner === "BLUE"} totals={groupTotals(data.events, "BLUE")} fouls={foulList(data.events, "BLUE")} />
      </main>

      <button onClick={() => { setSound(!sound); if (!sound) beep(660, 80); }} className="fixed bottom-4 left-4 z-40 rounded-full bg-white/10 p-2 opacity-40 hover:opacity-100" aria-label={sound ? "Tắt âm thanh" : "Bật âm thanh"}>
        {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>

      <footer className="px-8 pb-5 pt-3">
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
        {next && m.status !== "FINISHED" && (
          <p className="mt-3 flex items-center justify-center gap-3 text-lg text-white/80">
            <span className="rounded-md bg-mech-gold px-2.5 py-0.5 text-sm font-bold uppercase tracking-wider text-navy">{nextLabel}</span>
            <span className="font-bold tabular-nums text-white">{next.time}</span>
            {next.code && <span>· {next.code} ·</span>}
            <span className="font-semibold text-red-300">{next.red}</span> <span className="text-white/50">vs</span> <span className="font-semibold text-sky-300">{next.blue}</span>
          </p>
        )}
      </footer>
    </div>
  );
}

const SHOW_FOULS = 4;

export function Side({ name, score, tone, win, totals, fouls }: { name?: string; score: number; tone: string; win: boolean; totals: ReturnType<typeof groupTotals>; fouls: ReturnType<typeof foulList> }) {
  const total = fouls.reduce((n, f) => n + f.count, 0);
  const shown = fouls.slice(0, SHOW_FOULS);
  return (
    <div className={`flex flex-col items-center rounded-3xl ${tone} px-6 py-6 text-center shadow-2xl ${win ? "ring-8 ring-mech-gold" : ""}`}>
      <p className="line-clamp-2 font-display text-5xl uppercase leading-tight">{name ?? "—"}</p>
      <p className="mt-2 font-display text-[clamp(6rem,19vh,11rem)] leading-none tabular-nums">{score}</p>
      <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
        {([["C1", totals.C1], ["C2", totals.C2], ["C3", totals.C3], ["Phạt", totals.PHAT]] as const).map(([k, v]) => (
          <div key={k} className="rounded-lg bg-black/20 px-3 py-1.5">
            <dt className="text-xs font-bold uppercase text-white/70">{k}</dt>
            <dd className="font-display text-2xl tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 min-h-[8.5rem] w-full rounded-xl bg-black/20 px-4 py-2.5 text-left">
        <p className="text-sm font-bold uppercase tracking-widest text-white/75">Lỗi · {total}</p>
        {total === 0 ? <p className="mt-1 text-lg text-white/60">Chưa có lỗi</p> : (
          <ul className="mt-1 space-y-1">
            {shown.map((f) => (
              <li key={f.key} className="flex items-start justify-between gap-3 text-lg font-semibold leading-snug">
                <span className="line-clamp-1">{f.name}{f.count > 1 && <span className="font-bold text-mech-gold"> ×{f.count}</span>}</span>
                {f.points !== 0 && <span className="shrink-0 font-display text-xl tabular-nums">{f.points}</span>}
              </li>
            ))}
            {fouls.length > SHOW_FOULS && <li className="text-sm font-semibold text-white/70">+ {fouls.length - SHOW_FOULS} loại lỗi khác</li>}
          </ul>
        )}
      </div>
    </div>
  );
}

function Idle({ obs, idle }: { obs: boolean; idle?: IdleText }) {
  if (obs) return null;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-part-stage bg-tech-grid text-center text-white">
      <p className="font-display text-7xl uppercase">{idle?.idleTitle ?? SITE.name}</p>
      <p className="mt-4 text-2xl text-white/70">{idle?.idleText ?? "Trận đấu sẽ bắt đầu trong ít phút"}</p>
    </div>
  );
}

// Tự theo trận hiện tại (đang đấu → sẵn sàng → sắp tới)
export function AutoStage({ variant = "stage", idle }: { variant?: "stage" | "obs"; idle?: IdleText }) {
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
  return <StageBoard matchId={id} variant={variant} idle={idle} />;
}
