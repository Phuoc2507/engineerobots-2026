import type { Metadata } from "next";
import Link from "next/link";
import { Box, Download, FileText } from "lucide-react";
import { getContent } from "@/lib/content-server";
import PortalShell from "@/components/register/PortalShell";
import Doc from "@/components/content/Doc";

export const metadata: Metadata = {
  title: "Thể lệ · FME JOURNEY 2026",
  description: "Thể lệ chính thức cuộc thi FME JOURNEY 2026 – Hành trình Kỹ sư Cơ khí: chủ đề, quy chuẩn robot, sa bàn, vòng đấu, luật 3 chặng, retry, lỗi vi phạm, khiếu nại và tập huấn.",
};

const card = "rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7";
const h2 = "font-display text-2xl uppercase tracking-wide text-navy";

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-slate-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-ice text-xs uppercase text-navy-600">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

// Nội dung từng mục do BTC soạn ở /admin/content → Nội dung thể lệ chi tiết
export default async function RulesPage() {
  const c = await getContent();
  const { robotSpecs: ROBOT_SPECS, pdf: RULES_PDF } = c.rules;
  const { items: PRIZES, workshops: WORKSHOPS } = c.prizes;
  const P = c.pages;
  const sections = c.rules_doc.sections
    .filter((x) => x.title.trim() || x.body.trim())
    .map((x, i) => ({ ...x, anchor: x.id.trim().replace(/[^a-z0-9-]/gi, "") || `muc-${i + 1}` }));

  // Khối có sẵn, chèn vào nội dung bằng một dòng [[ma-khoi]]
  const embeds = {
    "thong-so-robot": (
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ROBOT_SPECS.map((s, i) => (
          <div key={`${i}${s.label}`} className="rounded-lg bg-ice p-3"><dt className="text-xs text-slate-500">{s.label}</dt><dd className="font-bold text-navy">{s.value}</dd></div>
        ))}
      </dl>
    ),
    "so-do-sa-ban": (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.rules.arenaImage} alt="Sơ đồ sa bàn FME JOURNEY 2026 theo thể lệ, đánh số 1.1–3.10" width={1319} height={1866} loading="lazy" className="mt-4 h-auto w-full rounded-lg ring-1 ring-slate-200" />
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/arena-3d" className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white"><Box className="h-4 w-4" /> Xem sa bàn 3D</Link>
          <a href={c.rules.drawingPdf} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md bg-ice px-4 font-bold text-navy"><Download className="h-4 w-4" /> Bản vẽ kỹ thuật (PDF)</a>
        </div>
      </>
    ),
    "bang-giai-thuong": <Table head={["Giải", "Giải thưởng", "Kèm theo"]} rows={PRIZES.map((p) => [<b key="r" className="text-navy">{p.rank}</b>, p.reward, p.extra || "—"])} />,
    "tap-huan": (
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {WORKSHOPS.map((w, i) => <li key={`${i}${w.title}`}><b>{w.title}:</b> {w.desc}</li>)}
      </ul>
    ),
  };

  return (
    <PortalShell title={P.rulesTitle} subtitle={P.rulesSubtitle}>
      <div className="space-y-6">
        <section aria-label={P.rulesPdfTitle} className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-8 w-8 shrink-0 text-mech-red" aria-hidden />
            <div>
              <p className="font-bold text-navy">{P.rulesPdfTitle}</p>
              <p className="text-sm text-slate-600">{P.rulesPdfText}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <a href={RULES_PDF} download="The-le-FME-JOURNEY-2026.pdf" className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white hover:bg-navy-600"><Download className="h-4 w-4" /> {P.rulesPdfButton}</a>
            <a href={RULES_PDF} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md bg-ice px-4 font-bold text-navy">{P.rulesPdfView}</a>
          </div>
        </section>

        {sections.length > 0 && (
          <nav aria-label={P.rulesTocTitle} className={`${card} text-sm`}>
            <p className="font-bold text-navy">{P.rulesTocTitle}</p>
            <ol className="mt-2 grid gap-1 text-navy-600 sm:grid-cols-2">
              {sections.map((x, i) => (
                <li key={`${i}${x.anchor}`}><a href={`#${x.anchor}`} className="hover:text-mech-red">{x.title}</a></li>
              ))}
            </ol>
          </nav>
        )}

        {sections.map((x, i) => (
          <section key={`${i}${x.anchor}`} id={x.anchor} className={card}>
            {x.title && <h2 className={h2}>{x.title}</h2>}
            <div className="mt-3"><Doc text={x.body} embeds={embeds} /></div>
          </section>
        ))}
      </div>
    </PortalShell>
  );
}
