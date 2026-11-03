"use client";

import { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";

const W = 600;
const H = 200;

// Ô ký tay bằng ngón tay / bút cảm ứng / chuột, xuất ảnh PNG nền trong suốt (data URL) sau mỗi nét
export default function SignaturePad({ value, onChange, label }: { value: string | null; onChange: (png: string | null) => void; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Vẽ lại chữ ký đã có (khi quay lại form) / xóa khi value về null
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    if (!value) { ctx.clearRect(0, 0, W, H); return; }
    if (drawing.current) return;
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, W, H); ctx.drawImage(img, 0, 0); };
    img.src = value;
  }, [value]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = e.currentTarget.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = "#031D3A";
    ctx.lineWidth = e.pointerType === "pen" ? 2 + 2.5 * (e.pressure || 0.5) : 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onChange(ref.current!.toDataURL("image/png"));
  };

  return (
    <div className="relative">
      <canvas
        ref={ref} width={W} height={H} aria-label={`Ô ký: ${label}`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
        className={`aspect-[3/1] w-full touch-none rounded-lg border-2 border-dashed bg-white ${value ? "border-emerald-500" : "border-slate-300"}`}
      />
      {!value && <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-slate-400">Ký vào đây</span>}
      {value && (
        <button type="button" onClick={() => onChange(null)} className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:text-mech-red">
          <Eraser className="h-3.5 w-3.5" /> Ký lại
        </button>
      )}
    </div>
  );
}
