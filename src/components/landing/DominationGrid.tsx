"use client";

import { useEffect, useState } from "react";

type Team = "RED" | "BLUE";

// Lộ trình Chặng 3 theo thể lệ ENGINEEROBOTS 2026, mỗi đội trên nửa sân riêng
const STEPS = [
  { name: "Cầu Bản lĩnh", pts: 10 },
  { name: "Địa hình", pts: 20 },
  { name: "Bảo vệ Đồ án", pts: 25 },
  { name: "Đèn Vinh Quang", pts: 40 },
];

const TONE: Record<Team, { on: string; text: string; label: string }> = {
  RED: { on: "bg-team-red border-red-300/60 shadow-[0_0_20px_rgba(229,57,53,0.55)]", text: "text-red-300", label: "ĐỘI ĐỎ" },
  BLUE: { on: "bg-team-blue border-sky-300/60 shadow-[0_0_20px_rgba(30,136,229,0.55)]", text: "text-sky-300", label: "ĐỘI XANH" },
};

// Mô phỏng hai đội tiến dần qua các nhiệm vụ; ai nhấn đèn trước thắng tuyệt đối rồi chạy lại
export default function DominationGrid() {
  const [done, setDone] = useState<Record<Team, number>>({ RED: 0, BLUE: 0 });
  const winner: Team | null = done.RED === STEPS.length ? "RED" : done.BLUE === STEPS.length ? "BLUE" : null;

  useEffect(() => {
    const id = setInterval(() => {
      setDone((prev) => {
        if (prev.RED === STEPS.length || prev.BLUE === STEPS.length) return { RED: 0, BLUE: 0 };
        const t: Team = Math.random() < 0.5 ? "RED" : "BLUE";
        return { ...prev, [t]: prev[t] + 1 };
      });
    }, 1300);
    return () => clearInterval(id);
  }, []);

  const score = (t: Team) => STEPS.slice(0, done[t]).reduce((s, x) => s + x.pts, 0);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="mb-4 flex items-end justify-between font-display text-white">
        {(["RED", "BLUE"] as Team[]).map((t) => (
          <div key={t} className={t === "BLUE" ? "order-3 text-right" : ""}>
            <div className={`text-xs tracking-widest ${TONE[t].text}`}>{TONE[t].label}</div>
            <div className="text-4xl tabular-nums">{score(t)}</div>
          </div>
        ))}
        <div className="order-2 pb-1 text-xs tracking-[0.3em] text-white/70">CHẶNG 3 · BẢN LĨNH</div>
      </div>
      <div className="relative grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur">
        <div className="pointer-events-none absolute inset-y-4 left-1/2 w-px bg-white/20" aria-hidden />
        {(["RED", "BLUE"] as Team[]).map((t) => (
          <ol key={t} className="flex flex-col-reverse gap-2">
            {STEPS.map((s, i) => {
              const on = i < done[t];
              const lamp = i === STEPS.length - 1;
              return (
                <li key={s.name}
                  className={`flex items-center justify-between rounded-lg border-2 px-2.5 py-2 text-[11px] font-bold uppercase leading-tight text-white/90 transition-all duration-500 sm:text-xs ${on ? (lamp ? "border-mech-gold bg-mech-gold text-navy shadow-[0_0_24px_rgba(255,193,7,0.7)]" : TONE[t].on) : "border-white/20 bg-white/10"}`}>
                  <span>{s.name}</span>
                  <span className="tabular-nums opacity-80">+{s.pts}</span>
                </li>
              );
            })}
          </ol>
        ))}
        {winner && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-lg bg-mech-gold px-3 py-2 text-center font-display text-sm uppercase tracking-wider text-navy shadow-lg">
            {TONE[winner].label} · Chiến thắng tuyệt đối
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-white/70">Mô phỏng minh họa · Cầu 10đ · Địa hình 20đ · Đồ án 25đ · Đèn 40đ</p>
    </div>
  );
}
