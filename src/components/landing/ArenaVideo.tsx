"use client";

import { useEffect, useRef } from "react";

// Video mô phỏng trận đấu (render từ Blender). Chỉ phát khi lọt vào màn hình
// để đỡ tốn băng thông; người bật "giảm chuyển động" thì giữ ảnh poster.
export default function ArenaVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video ref={ref} muted loop playsInline preload="metadata" poster="/images/sa-ban-3d.png"
      aria-label="Video mô phỏng hai robot thi đấu trên sa bàn ENGINEERING PATH 2026"
      className={`h-auto w-full bg-navy-900 ${className}`}>
      <source src="/videos/sa-ban-2026.mp4" type="video/mp4" />
    </video>
  );
}
