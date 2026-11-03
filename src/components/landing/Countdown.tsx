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

// Trước giờ mở: đếm tới lúc mở cổng; đang mở: đếm tới hạn đóng; quá hạn: báo đã đóng
type Labels = { before: string; during: string; after: string };
const LABELS: Labels = { before: "Cổng đăng ký mở sau", during: "Cổng đăng ký đóng sau", after: "Cổng đăng ký đã đóng" };

function phase(start: number, end: number, l: Labels) {
  const now = Date.now();
  if (now < start) return { label: l.before, target: start };
  if (now <= end) return { label: l.during, target: end };
  return { label: l.after, target: end };
}

export default function Countdown({ start, deadline, note, labels = LABELS }: { start: string; deadline: string; note?: string; labels?: Labels }) {
  const s = new Date(start).getTime();
  const e = new Date(deadline).getTime();
  // null cho lần render server để tránh lệch hydration
  const [state, setState] = useState<{ label: string; left: ReturnType<typeof diff> } | null>(null);

  useEffect(() => {
    const tick = () => { const p = phase(s, e, labels); setState({ label: p.label, left: diff(p.target) }); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [s, e, labels]);

  const left = state?.left;
  const units = [
    { label: "Ngày", value: left?.days },
    { label: "Giờ", value: left?.hours },
    { label: "Phút", value: left?.minutes },
    { label: "Giây", value: left?.seconds },
  ];

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
        {state?.label ?? "Cổng đăng ký"}
      </p>
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
      {note && <p className="mt-3 text-sm text-white/75">{note}</p>}
    </div>
  );
}
