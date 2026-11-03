"use client";

const COLORS = ["#06305E", "#D7262F", "#0070B8", "#FFC20E", "#031D3A", "#20A8E0"];
const INK: Record<string, string> = { "#FFC20E": "#06305E", "#20A8E0": "#031D3A" };

// Vòng quay các vị trí còn trống. rotation (độ) do cha điều khiển; kim chỉ cố định ở đỉnh
export default function DrawWheel({ slots, rotation, spinning, highlight }: { slots: string[]; rotation: number; spinning: boolean; highlight?: string | null }) {
  const n = Math.max(slots.length, 1);
  const seg = 360 / n;
  const R = 200;
  const pt = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [R + r * Math.cos(a), R + r * Math.sin(a)];
  };
  const font = n <= 12 ? 26 : n <= 24 ? 18 : n <= 40 ? 13 : 9;

  return (
    <div className="relative aspect-square w-full">
      {/* Kim chỉ */}
      <svg viewBox="0 0 40 48" className="absolute left-1/2 top-0 z-10 w-[9%] -translate-x-1/2 -translate-y-[35%] drop-shadow-lg" aria-hidden>
        <path d="M20 46 L4 10 A16 16 0 1 1 36 10 Z" fill="#FFC20E" stroke="#031D3A" strokeWidth="3" />
      </svg>
      <svg
        viewBox="0 0 400 400" role="img" aria-label={`Vòng quay ${slots.length} vị trí còn trống`}
        className="h-full w-full drop-shadow-2xl"
        style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 6s cubic-bezier(0.12, 0.6, 0.08, 1)" : "none" }}
      >
        <circle cx={R} cy={R} r={R} fill="#031D3A" />
        {slots.length === 0 && <text x={R} y={R} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="22" fontWeight="700">Hết vị trí</text>}
        {slots.map((s, i) => {
          const a0 = i * seg;
          const a1 = (i + 1) * seg;
          const [x0, y0] = pt(a0, R - 6);
          const [x1, y1] = pt(a1, R - 6);
          const fill = COLORS[i % COLORS.length];
          const [tx, ty] = pt(a0 + seg / 2, R * 0.72);
          const d = n === 1
            ? `M ${R} ${6} A ${R - 6} ${R - 6} 0 1 1 ${R - 0.01} ${6} Z`
            : `M ${R} ${R} L ${x0} ${y0} A ${R - 6} ${R - 6} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
          return (
            <g key={s}>
              <path d={d} fill={fill} stroke="#fff" strokeWidth={n > 40 ? 0.5 : 1.5} opacity={highlight && highlight !== s ? 0.55 : 1} />
              <text x={tx} y={ty} fill={INK[fill] ?? "#fff"} fontSize={font} fontWeight="800" textAnchor="middle" dominantBaseline="middle"
                transform={`rotate(${a0 + seg / 2} ${tx} ${ty})`} style={{ fontFamily: "var(--font-display), Impact, sans-serif" }}>
                {s}
              </text>
            </g>
          );
        })}
        <circle cx={R} cy={R} r={34} fill="#FFC20E" stroke="#031D3A" strokeWidth="4" />
        <circle cx={R} cy={R} r={10} fill="#031D3A" />
      </svg>
    </div>
  );
}

// Góc quay mới để tâm ô `index` dừng đúng dưới kim (đỉnh), quay thêm ít nhất `turns` vòng, lệch ngẫu nhiên trong ô cho tự nhiên
export function targetRotation(current: number, index: number, count: number, turns = 6) {
  const seg = 360 / count;
  const jitter = (Math.random() - 0.5) * seg * 0.6;
  const want = -(index * seg + seg / 2 + jitter);
  const delta = (((want - current) % 360) + 360) % 360;
  return current + turns * 360 + delta;
}
