"use client";

import { createElement, useState } from "react";
import Script from "next/script";

// Trình xem GLB dùng web component <model-viewer> (tải từ CDN, ghim phiên bản)
export default function ArenaViewer() {
  const [ready, setReady] = useState(false);
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-ice">
      <Script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js" onReady={() => setReady(true)} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!ready && <img src="/images/sa-ban-3d.png" alt="Ảnh render sa bàn 3D" className="absolute inset-0 h-full w-full object-cover" />}
      {createElement("model-viewer", {
        src: "/models/sa-ban-2026.glb",
        poster: "/images/sa-ban-3d.png",
        alt: "Mô hình 3D sa bàn ENGINEEROBOTS 2026",
        "camera-controls": true,
        "auto-rotate": true,
        "shadow-intensity": "1",
        "camera-orbit": "0deg 55deg auto",
        style: { width: "100%", height: "100%", background: "transparent" },
      })}
    </div>
  );
}
