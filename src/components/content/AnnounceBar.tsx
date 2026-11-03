import Link from "next/link";
import { Megaphone } from "lucide-react";
import type { Content } from "@/lib/content";
import Rich from "@/components/content/Rich";

const TONE: Record<string, string> = {
  info: "bg-navy-600 text-white",
  warn: "bg-mech-gold text-navy",
  urgent: "bg-mech-red text-white",
};

// Dải thông báo BTC bật ở /admin/content (công khai hoặc nội bộ)
export default function AnnounceBar({ a, staff = false, className = "" }: { a: Content["announce"]; staff?: boolean; className?: string }) {
  const on = staff ? a.staffOn : a.publicOn;
  const text = (staff ? a.staffText : a.publicText).trim();
  if (!on || !text) return null;
  return (
    <div role="status" className={`${staff ? TONE.warn : TONE[a.publicTone] ?? TONE.info} ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm md:px-6">
        <Megaphone className="h-4 w-4 shrink-0" />
        <p className="min-w-0 flex-1"><Rich text={text} /></p>
        {!staff && a.publicLink && (
          <Link href={a.publicLink} className="whitespace-nowrap font-bold underline underline-offset-2">{a.publicLinkLabel || "Xem chi tiết"}</Link>
        )}
      </div>
    </div>
  );
}
