"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";

const SIZE = 900; // ảnh PNG đủ nét để in khổ ~6 cm

// Tên file không dấu: "Đội Sấm Sét" → "Doi-Sam-Set"
const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "doi";

// Mã QR của đội + nút tải ảnh PNG (kèm tên đội) để in dán lên robot
export default function TeamQrCard({ token, teamName }: { token: string; teamName: string }) {
  const boxRef = useRef<HTMLDivElement>(null);

  const download = async () => {
    const svg = boxRef.current?.querySelector("svg");
    if (!svg) return;
    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = src; });

    const pad = 60;
    const label = 140;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE + pad * 2;
    canvas.height = SIZE + pad * 2 + label;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, pad, pad, SIZE, SIZE);
    ctx.fillStyle = "#06305E";
    ctx.textAlign = "center";
    ctx.font = "bold 56px Arial, sans-serif";
    ctx.fillText(teamName, canvas.width / 2, SIZE + pad + 70, canvas.width - pad * 2);
    ctx.font = "32px Arial, sans-serif";
    ctx.fillText("FME JOURNEY 2026 · Check-in & Kỹ thuật", canvas.width / 2, SIZE + pad + 120, canvas.width - pad * 2);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `QR-${slug(teamName)}.png` });
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div className="mt-4 w-[200px]">
      <div ref={boxRef} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
        <QRCode value={token} size={176} fgColor="#06305E" />
      </div>
      <button type="button" onClick={download} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-bold text-white hover:bg-navy-600">
        <Download className="h-4 w-4" /> Tải ảnh mã QR
      </button>
      <p className="mt-2 text-xs text-slate-600">
        Đội thi <b className="text-navy">in mã QR và dán lên robot</b> của đội mình (phục vụ check-in &amp; kiểm tra kỹ thuật).
      </p>
    </div>
  );
}
