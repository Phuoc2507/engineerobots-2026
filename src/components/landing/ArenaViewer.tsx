"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Pause, RotateCw } from "lucide-react";

// Trình xem GLB dùng web component <model-viewer> (tải từ CDN, ghim phiên bản).
// GLB chuyển từ bản vẽ SolidWorks "Sân tổng thể" (08/11/2026), không có animation.
// Toạ độ glTF, đơn vị m, Y hướng lên: gốc ở tâm sân, y = 0 là đáy pallet, mặt sân y = 0,157;
// −X là đội Đỏ, +X là đội Xanh, −Z là phía Chặng 3 (camera theta 0° đứng phía +Z nhìn về Chặng 3).

type ModelViewerEl = HTMLElement & {
  cameraOrbit: string;
  cameraTarget: string;
  autoRotate: boolean;
  resetTurntableRotation?: (theta?: number) => void;
};

const VIEWS = [
  { key: "all", label: "Toàn cảnh", orbit: "0deg 52deg 6.6m", target: "0m 0.15m 0.25m" },
  { key: "c1", label: "Chặng 1", orbit: "0deg 26deg 6.4m", target: "0m 0.15m -0.3m" },
  { key: "c2", label: "Chặng 2", orbit: "0deg 48deg 3.4m", target: "0m 0.16m 0.85m" },
  { key: "c3", label: "Chặng 3", orbit: "0deg 46deg 3.6m", target: "0m 0.25m -1.25m" },
] as const;

const HOTSPOTS = [
  { id: "start", pos: "-1.95m 0.16m -2.185m", label: "Trạm khởi hành", tone: "bg-team-red" },
  { id: "checkpoint", pos: "-1.95m 0.16m -0.585m", label: "Checkpoint", tone: "bg-slate-900" },
  { id: "gate", pos: "0m 0.16m 1.6m", label: "Lối vào Chặng 2", tone: "bg-cyan-500" },
  { id: "knowledge", pos: "-1.1m 0.25m 0.944m", label: "Cấu kiện Kiến thức", tone: "bg-team-red" },
  { id: "drop", pos: "-0.903m 0.17m 0.25m", label: "Trạm thành tựu", tone: "bg-team-red" },
  { id: "gold", pos: "0m 0.3m 0.794m", label: "Cơ hội vàng", tone: "bg-mech-gold" },
  { id: "bridge", pos: "0m 0.26m 0m", label: "Cầu Bản lĩnh", tone: "bg-amber-700" },
  { id: "terrain", pos: "-1.25m 0.21m -0.7m", label: "Đường Thử thách", tone: "bg-slate-600" },
  { id: "lab", pos: "-1m 0.25m -1.225m", label: "Trạm Thực nghiệm", tone: "bg-orange-500" },
  { id: "kientri", pos: "1.275m 0.26m -1.62m", label: "Dốc Kiên trì", tone: "bg-team-blue" },
  { id: "guard", pos: "1.39m 0.29m -2.275m", label: "Ô Bảo vệ Đồ án", tone: "bg-cyan-500" },
  { id: "thanghoa", pos: "0.5m 0.36m -1.57m", label: "Dốc Thăng hoa", tone: "bg-team-blue" },
  { id: "lamp", pos: "0m 0.45m -1.57m", label: "Bục Vinh Quang", tone: "bg-navy-600" },
] as const;

export default function ArenaViewer({ preview = "/images/sa-ban-3d-v2.webp", model = "/models/sa-ban-2026-v2.glb" }: { preview?: string; model?: string }) {
  const ref = useRef<ModelViewerEl | null>(null);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rotating, setRotating] = useState(true);
  const [view, setView] = useState<string>("all");
  const [labels, setLabels] = useState(true);

  useEffect(() => {
    const mv = ref.current;
    if (!mv) return;
    const onProgress = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onLoad = () => {
      setLoaded(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        mv.autoRotate = false;
        setRotating(false);
      }
    };
    mv.addEventListener("progress", onProgress);
    mv.addEventListener("load", onLoad);
    return () => {
      mv.removeEventListener("progress", onProgress);
      mv.removeEventListener("load", onLoad);
    };
  }, [ready]);

  function goView(key: string) {
    const mv = ref.current;
    const v = VIEWS.find((x) => x.key === key);
    if (!mv || !v) return;
    mv.autoRotate = key === "all" && rotating;
    mv.resetTurntableRotation?.(0); // tự xoay quay cả mô hình, đưa về hướng gốc để góc nhìn đúng chặng
    mv.cameraTarget = v.target;
    mv.cameraOrbit = v.orbit;
    setView(key);
  }

  function toggleRotate() {
    const mv = ref.current;
    if (!mv) return;
    const next = !rotating;
    mv.autoRotate = next;
    setRotating(next);
  }

  const hotspots = HOTSPOTS.map((h) =>
    createElement(
      "button",
      {
        key: h.id,
        slot: `hotspot-${h.id}`,
        "data-position": h.pos,
        "data-normal": "0m 1m 0m",
        "data-visibility-attribute": "visible",
        className: `arena-hotspot ${labels ? "" : "is-hidden"}`,
        type: "button",
        "aria-label": h.label,
      },
      createElement("span", { className: `arena-hotspot-dot ${h.tone}` }),
      createElement("span", { className: "arena-hotspot-label" }, h.label),
    ),
  );

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gradient-to-b from-navy-900 to-navy md:aspect-[16/10]">
        <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js" onReady={() => setReady(true)} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Ảnh render sa bàn 3D"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "pointer-events-none opacity-0" : "opacity-100"}`} />
        {createElement(
          "model-viewer",
          {
            ref,
            src: model,
            alt: "Mô hình 3D sa bàn FME JOURNEY 2026 dựng theo bản vẽ SolidWorks",
            "camera-controls": true,
            "auto-rotate": true,
            "auto-rotate-delay": "4000",
            "rotation-per-second": "6deg",
            "interaction-prompt": "none",
            "interpolation-decay": "120",
            "shadow-intensity": "1",
            "shadow-softness": "0.8",
            exposure: "1.05",
            "environment-image": "neutral",
            "camera-orbit": VIEWS[0].orbit,
            "camera-target": VIEWS[0].target,
            "min-camera-orbit": "auto 10deg 0.8m",
            "max-camera-orbit": "auto 85deg 9m",
            style: { width: "100%", height: "100%", background: "transparent", opacity: loaded ? 1 : 0, transition: "opacity .7s" },
          },
          ...hotspots,
        )}
        {!loaded && (
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-mech-gold transition-[width] duration-300" style={{ width: `${Math.max(6, progress * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-white/80">Đang tải mô hình 3D… {Math.round(progress * 100)}%</p>
          </div>
        )}
        {loaded && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-navy-900/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur">
            Tỉ lệ 1:1 · 4,8 × 4,8 m
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Góc nhìn">
          {VIEWS.map((v) => (
            <button key={v.key} type="button" onClick={() => goView(v.key)} disabled={!loaded}
              className={`h-9 rounded-md px-3 text-sm font-semibold transition ${view === v.key ? "bg-navy text-white shadow" : "text-slate-600 hover:bg-white disabled:opacity-50"}`}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          <button type="button" onClick={() => setLabels((x) => !x)} disabled={!loaded}
            className="h-9 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {labels ? "Ẩn nhãn" : "Hiện nhãn"}
          </button>
          <button type="button" onClick={toggleRotate} disabled={!loaded} aria-label={rotating ? "Dừng tự xoay" : "Tự xoay"} title={rotating ? "Dừng tự xoay" : "Tự xoay"}
            className="grid h-9 w-9 place-items-center rounded-md bg-mech-red text-white hover:brightness-110 disabled:opacity-50">
            {rotating ? <Pause className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
