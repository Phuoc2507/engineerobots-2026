import Image from "next/image";

// Logo đơn vị: ảnh gốc trong public/brand, không đổi màu / kéo giãn
export const ORGANIZERS = [
  { src: "/brand/fme.png", alt: "Khoa Cơ khí – HCMUTE", short: "FME" },
  { src: "/brand/fmes.png", alt: "CLB Nghiên cứu Khoa học Cơ khí FMES", short: "FMES" },
] as const;

// Dấu nhận diện dùng ở thanh điều hướng: logo Khoa + tên giải
export function BrandMark({ subtitle = "Khoa Cơ khí" }: { subtitle?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/brand/fme.png" alt="Logo Khoa Cơ khí" width={40} height={40} priority
        className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white/80" />
      <span className="leading-tight">
        <span className="block font-display text-lg tracking-wider">ENGINEERING PATH</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-mech-gold">{subtitle}</span>
      </span>
    </span>
  );
}

export function OrganizerLogos({ size = 56, labels = false, className = "" }: { size?: number; labels?: boolean; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-4 ${className}`}>
      {ORGANIZERS.map((o) => (
        <li key={o.short} className="flex flex-col items-center gap-1.5">
          <Image src={o.src} alt={o.alt} title={o.alt} width={size} height={size}
            style={{ width: size, height: size }} className="object-contain" />
          {labels && <span className="text-[11px] font-bold tracking-[0.2em] text-white/70">{o.short}</span>}
        </li>
      ))}
    </ul>
  );
}
