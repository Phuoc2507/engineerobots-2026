"use client";

import { useEffect, useState } from "react";

type Owner = "NEUTRAL" | "RED" | "BLUE";

const INITIAL: Owner[] = ["RED", "NEUTRAL", "BLUE", "NEUTRAL", "NEUTRAL", "NEUTRAL", "RED", "NEUTRAL", "BLUE"];

const COLOR: Record<Owner, string> = {
  NEUTRAL: "bg-white/10 border-white/20",
  RED: "bg-team-red border-red-300/60 shadow-[0_0_24px_rgba(229,57,53,0.55)]",
  BLUE: "bg-team-blue border-sky-300/60 shadow-[0_0_24px_rgba(30,136,229,0.55)]",
};

// Ma trận 3×3 cứ điểm Chặng 2 – tự lật ngẫu nhiên để minh họa thế trận
export default function DominationGrid() {
  const [cells, setCells] = useState<Owner[]>(INITIAL);

  useEffect(() => {
    const id = setInterval(() => {
      setCells((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * 9);
        next[i] = next[i] === "RED" ? "BLUE" : "RED";
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const score = (team: Owner) =>
    cells.reduce((s, c, i) => s + (c === team ? (i === 4 ? 30 : 10) : 0), 0);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="mb-4 flex items-end justify-between font-display text-white">
        <div>
          <div className="text-xs tracking-widest text-red-300">ĐỘI ĐỎ</div>
          <div className="text-4xl tabular-nums">{score("RED")}</div>
        </div>
        <div className="pb-1 text-xs tracking-[0.3em] text-white/70">CHẶNG 2 · DOMINATION</div>
        <div className="text-right">
          <div className="text-xs tracking-widest text-sky-300">ĐỘI XANH</div>
          <div className="text-4xl tabular-nums">{score("BLUE")}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur">
        {cells.map((owner, i) => {
          const golden = i === 4;
          return (
            <div
              key={i}
              className={`relative grid aspect-square place-items-center rounded-lg border-2 transition-all duration-500 ${COLOR[owner]} ${
                golden ? "ring-4 ring-mech-gold ring-offset-2 ring-offset-navy-900" : ""
              }`}
            >
              <span className="font-display text-xl text-white/90">{golden ? "×3" : i + 1}</span>
              {golden && (
                <span className="absolute -top-2 rounded bg-mech-gold px-1.5 text-[9px] font-bold uppercase tracking-wider text-navy">
                  Lõi Vàng
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-white/70">
        Mô phỏng minh họa · Cứ điểm thường 10đ · Lõi Vàng 30đ
      </p>
    </div>
  );
}
