"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Pause, Play, RotateCcw } from "lucide-react";

// Trình xem GLB dùng web component <model-viewer> (tải từ CDN, ghim phiên bản).
// GLB xuất từ Blender có sẵn 1 animation: 2 robot chạy line, gom bóng pickleball, đặt Đồ án lên đế, leo Bục Vinh Quang bật đèn.
// Toạ độ hotspot theo glTF (Y hướng lên): Blender (x, y, z) -> (x, z, -y), đơn vị m.

type ModelViewerEl = HTMLElement & {
  play: () => void;
  pause: () => void;
  paused: boolean;
  currentTime: number;
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  autoRotate: boolean;
  jumpCameraToGoal: () => void;
};

const VIEWS = [
  { key: "all", label: "Toàn cảnh", orbit: "0deg 52deg 6.4m", target: "2.4m 0m -2.4m" },
  { key: "c1", label: "Chặng 1", orbit: "0deg 22deg 6.6m", target: "2.4m 0m -2.5m" },
  { key: "c2", label: "Chặng 2", orbit: "0deg 48deg 3.4m", target: "2.4m 0m -1.4m" },
  { key: "c3", label: "Chặng 3", orbit: "180deg 50deg 3.6m", target: "2.4m 0m -3.6m" },
] as const;

const HOTSPOTS = [
  { id: "start", pos: "0.45m 0.03m -4.65m", label: "Trạm khởi hành", tone: "bg-team-red" },
  { id: "checkpoint", pos: "0.45m 0.03m -2.7m", label: "Checkpoint", tone: "bg-slate-900" },
  { id: "gate", pos: "2.4m 0.03m -0.55m", label: "Cổng vào Chặng 2", tone: "bg-cyan-500" },
  { id: "drop", pos: "1.47m 0.03m -1.37m", label: "Trạm kiến thức", tone: "bg-team-red" },
  { id: "gold", pos: "2.4m 0.15m -1.4m", label: "Cơ hội vàng", tone: "bg-mech-gold" },
  { id: "bridge", pos: "2.4m 0.12m -2.43m", label: "Cầu Bản lĩnh", tone: "bg-amber-700" },
  { id: "terrain", pos: "1.45m 0.03m -3.02m", label: "Địa hình", tone: "bg-slate-600" },
  { id: "lab", pos: "1.45m 0.08m -3.58m", label: "Trạm thực nghiệm", tone: "bg-orange-500" },
  { id: "kientri", pos: "1.275m 0.07m -3.98m", label: "Dốc Kiên trì", tone: "bg-team-blue" },
  { id: "guard", pos: "1.04m 0.13m -4.66m", label: "Ô bảo vệ Đồ án", tone: "bg-cyan-500" },
  { id: "thanghoa", pos: "1.775m 0.17m -4.525m", label: "Dốc Thăng hoa", tone: "bg-team-blue" },
  { id: "lamp", pos: "2.4m 0.25m -4.52m", label: "Đèn Vinh quang", tone: "bg-navy-600" },
] as const;

export default function ArenaViewer() {
  const ref = useRef<ModelViewerEl | null>(null);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [view, setView] = useState<string>("all");
  const [labels, setLabels] = useState(true);

  useEffect(() => {
    const mv = ref.current;
    if (!mv) return;
    const onProgress = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onLoad = () => {
      setLoaded(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        mv.pause();
        mv.autoRotate = false;
        setPlaying(false);
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
    mv.autoRotate = key === "all" && playing;
    mv.cameraTarget = v.target;
    mv.cameraOrbit = v.orbit;
    setView(key);
  }

  function togglePlay() {
    const mv = ref.current;
    if (!mv) return;
    if (mv.paused) mv.play();
    else mv.pause();
    mv.autoRotate = mv.paused ? false : view === "all";
    setPlaying(!mv.paused);
  }

  function restart() {
    const mv = ref.current;
    if (!mv) return;
    mv.currentTime = 0;
    mv.play();
    setPlaying(true);
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
        <img src="/images/sa-ban-3d.png" alt="Ảnh render sa bàn 3D"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "pointer-events-none opacity-0" : "opacity-100"}`} />
        {createElement(
          "model-viewer",
          {
            ref,
            src: "/models/sa-ban-2026.glb",
            alt: "Mô hình 3D sa bàn ENGINEERING PATH 2026 với hai robot mô phỏng",
            autoplay: true,
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
            "min-camera-orbit": "auto 10deg 1.2m",
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
            Mô phỏng trận đấu · 24 giây
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
          <button type="button" onClick={restart} disabled={!loaded} aria-label="Phát lại từ đầu"
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={togglePlay} disabled={!loaded} aria-label={playing ? "Tạm dừng" : "Phát"}
            className="grid h-9 w-9 place-items-center rounded-md bg-mech-red text-white hover:brightness-110 disabled:opacity-50">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
