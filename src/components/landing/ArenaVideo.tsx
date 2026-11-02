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
    <video ref={ref} muted loop playsInline controls preload="metadata" poster="/images/mo-phong-tran-dau.jpg"
      aria-label="Video mô phỏng trận Chung kết Đội Đỏ đối đầu Đội Xanh trên sa bàn FME JOURNEY 2026"
      className={`h-auto w-full bg-navy-900 ${className}`}>
      <source src="/videos/mo-phong-tran-dau.mp4" type="video/mp4" />
    </video>
  );
}
