import type { Metadata } from "next";
import Link from "next/link";
import PortalShell from "@/components/register/PortalShell";
import ArenaViewer from "@/components/landing/ArenaViewer";
import ArenaVideo from "@/components/landing/ArenaVideo";
import { getContent } from "@/lib/content-server";
import Doc from "@/components/content/Doc";

export const metadata: Metadata = {
  title: "Sa bàn 3D · FME JOURNEY 2026",
  description: "Mô hình 3D sa bàn 4800 × 4800 mm của FME JOURNEY 2026: xoay, phóng to để xem 3 chặng thi.",
};

export default async function Arena3DPage() {
  const c = await getContent();
  const P = c.pages;
  return (
    <PortalShell title={P.arenaTitle} subtitle={P.arenaSubtitle}>
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:p-4">
        <ArenaViewer preview={P.arenaPreview} model={P.arenaModel} />
        {P.arenaNotes.trim() && <div className="mt-4 px-1"><Doc text={P.arenaNotes} /></div>}
        <p className="mt-3 px-1 text-sm">
          <Link href="/rules#sa-ban" className="font-semibold text-navy-600 underline">Xem thông số chi tiết trong thể lệ</Link>
          <span className="mx-2 text-slate-300">·</span>
          <a href={c.rules.drawingPdf} target="_blank" rel="noopener" className="font-semibold text-navy-600 underline">Tải bản vẽ kỹ thuật (PDF)</a>
        </p>
      </div>
      <div className="mt-6 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:p-4">
        <h2 className="px-1 font-display text-xl uppercase tracking-wide text-navy">{P.arenaVideoTitle}</h2>
        <p className="mt-1 px-1 text-sm text-slate-600">{P.arenaVideoText}</p>
        <div className="mt-3 overflow-hidden rounded-lg">
          <ArenaVideo src={c.arena.video} poster={c.arena.poster} />
        </div>
      </div>
    </PortalShell>
  );
}
