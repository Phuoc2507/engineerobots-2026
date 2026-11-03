/* eslint-disable @next/next/no-img-element -- logo có thể là ảnh BTC tải lên kho ấn phẩm (khác tên miền) */
import { DEFAULT_CONTENT, type Content } from "@/lib/content";

type Brand = Content["brand"];
const DEF = DEFAULT_CONTENT.brand;

// Logo đơn vị: ảnh gốc (mặc định trong public/brand hoặc BTC thay ở /admin/content), không đổi màu / kéo giãn
export const organizers = (b: Brand = DEF) =>
  [
    { src: b.logoMain, alt: b.logoMainAlt, short: b.logoMainShort },
    { src: b.logoSecond, alt: b.logoSecondAlt, short: b.logoSecondShort },
  ].filter((o) => o.src);

// Dấu nhận diện dùng ở thanh điều hướng: bộ logo (hoặc logo chính) + tên giải
export function BrandMark({ b = DEF, subtitle }: { b?: Brand; subtitle?: string }) {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      {b.markLogo ? (
        <img src={b.markLogo} alt="Logo Đoàn Thanh niên – Hội Sinh viên – Khoa Cơ khí – CLB FMES" height={40}
          className="h-7 w-auto shrink-0 object-contain sm:h-12" />
      ) : b.logoMain && (
        <img src={b.logoMain} alt={`Logo ${b.logoMainAlt}`} width={40} height={40}
          className="h-10 w-10 shrink-0 rounded-full object-contain ring-2 ring-white/80" />
      )}
      <span className="whitespace-nowrap leading-tight">
        <span className="block font-display text-base tracking-wider sm:text-lg">{b.markTitle}</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-mech-gold sm:tracking-[0.25em]">{subtitle ?? b.markSubtitle}</span>
      </span>
    </span>
  );
}

export function OrganizerLogos({ b = DEF, size = 56, labels = false, className = "" }: { b?: Brand; size?: number; labels?: boolean; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-4 ${className}`}>
      {organizers(b).map((o) => (
        <li key={o.src} className="flex flex-col items-center gap-1.5">
          <img src={o.src} alt={o.alt} title={o.alt} width={size} height={size}
            style={{ width: size, height: size }} className="object-contain" />
          {labels && <span className="text-[11px] font-bold tracking-[0.2em] text-white/70">{o.short}</span>}
        </li>
      ))}
    </ul>
  );
}
