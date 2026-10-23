"use client";

import { useEffect, useState } from "react";

type Owner = "NEUTRAL" | "RED" | "BLUE";

// Thứ tự: 1 góc trên-trái, 2 góc trên-phải, 3 góc dưới-trái, 4 góc dưới-phải, 5 Master
const INITIAL: Owner[] = ["RED", "BLUE", "NEUTRAL", "BLUE", "NEUTRAL"];

const COLOR: Record<Owner, string> = {
  NEUTRAL: "bg-white/10 border-white/20",
  RED: "bg-team-red border-red-300/60 shadow-[0_0_24px_rgba(229,57,53,0.55)]",
  BLUE: "bg-team-blue border-sky-300/60 shadow-[0_0_24px_rgba(30,136,229,0.55)]",
};

const POS = ["left-0 top-0", "right-0 top-0", "left-0 bottom-0", "right-0 bottom-0"];

// Chặng 3: 4 cứ điểm góc + Master Tower – tự lật ngẫu nhiên để minh họa thế trận
export default function DominationGrid() {
  const [cells, setCells] = useState<Owner[]>(INITIAL);

  useEffect(() => {
    const id = setInterval(() => {
      setCells((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * 5);
        next[i] = next[i] === "RED" ? "BLUE" : "RED";
        return next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const score = (team: Owner) => cells.reduce((s, c, i) => s + (c === team ? (i === 4 ? 50 : 20) : 0), 0);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="mb-4 flex items-end justify-between font-display text-white">
        <div>
          <div className="text-xs tracking-widest text-red-300">ĐỘI ĐỎ</div>
          <div className="text-4xl tabular-nums">{score("RED")}</div>
        </div>
        <div className="pb-1 text-xs tracking-[0.3em] text-white/70">CHẶNG 3 · BẢN LĨNH</div>
        <div className="text-right">
          <div className="text-xs tracking-widest text-sky-300">ĐỘI XANH</div>
          <div className="text-4xl tabular-nums">{score("BLUE")}</div>
        </div>
      </div>
      <div className="relative aspect-square rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur">
        <div className="relative h-full w-full">
          {POS.map((pos, i) => (
            <div key={i} className={`absolute grid h-[26%] w-[26%] place-items-center rounded-lg border-2 transition-all duration-500 ${pos} ${COLOR[cells[i]]}`}>
              <span className="font-display text-xl text-white/90">{i + 1}</span>
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 grid h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border-2 border-mech-gold/70 bg-navy-900">
            <div className={`grid h-[60%] w-[60%] place-items-center rounded-md border-2 transition-all duration-500 ${COLOR[cells[4]]}`}>
              <span className="font-display text-sm text-white">MASTER</span>
            </div>
            <span className="absolute -top-2 rounded bg-mech-gold px-1.5 text-[9px] font-bold uppercase tracking-wider text-navy">Master Tower</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-white/70">Mô phỏng minh họa · Cứ điểm góc 20đ · Master Point 50đ</p>
    </div>
  );
}
