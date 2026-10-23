"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export default function Countdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  // null cho lần render server để tránh lệch hydration
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "Ngày", value: left?.days },
    { label: "Giờ", value: left?.hours },
    { label: "Phút", value: left?.minutes },
    { label: "Giây", value: left?.seconds },
  ];

  return (
    <div className="flex gap-2 sm:gap-3" aria-live="off">
      {units.map((u) => (
        <div
          key={u.label}
          className="w-16 rounded-md border border-white/15 bg-white/5 py-2 text-center backdrop-blur sm:w-20"
        >
          <div className="font-display text-3xl tabular-nums text-white sm:text-4xl">
            {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-mech-gold">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}
