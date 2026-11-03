import { Fragment, type ReactNode } from "react";

// Văn bản dài BTC soạn ở /admin/content (cú pháp gọn, không nhận HTML):
//   ## Tiêu đề nhỏ        ## [đỏ] / ## [xanh] để tô màu phe
//   ### Dòng in đậm       - gạch đầu dòng       1. danh sách số
//   | cột | cột |  bảng (dòng đầu là tiêu đề)   > ghi chú nhỏ   !! lưu ý màu đỏ
//   [[ma-khoi]] chèn khối có sẵn (ảnh sa bàn, bảng giải…)
//   Trong dòng: **đậm**, *nghiêng*, [chữ](/duong-dan)
export const DOC_HINT =
  "Cú pháp: ## Tiêu đề nhỏ (## [đỏ] / ## [xanh] để tô màu) · ### Dòng in đậm · - gạch đầu dòng · 1. danh sách số · | cột | cột | bảng (dòng đầu là tiêu đề) · > ghi chú nhỏ · !! lưu ý màu đỏ · **đậm** · *nghiêng* · [chữ](/duong-dan). Bỏ trống một dòng để tách đoạn.";

const safeHref = (u: string) => (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(u.trim()) ? u.trim() : "#");

export function inline(text: string, strongClass = "text-navy"): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = out.length;
    if (m[1] !== undefined) out.push(<strong key={k} className={strongClass}>{inline(m[1], strongClass)}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k}>{m[2]}</em>);
    else {
      const href = safeHref(m[4]);
      const ext = /^https?:/i.test(href);
      out.push(<a key={k} href={href} {...(ext ? { target: "_blank", rel: "noopener" } : {})} className="font-semibold text-navy-600 underline hover:text-mech-red">{m[3]}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { t: "h"; level: 2 | 3; text: string; tone?: "red" | "blue" }
  | { t: "p"; text: string }
  | { t: "note"; text: string }
  | { t: "warn"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "table"; rows: string[][] }
  | { t: "embed"; key: string };

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r/g, "").split("\n");
  let para: string[] = [];
  const flush = () => { if (para.length) blocks.push({ t: "p", text: para.join(" ") }); para = []; };
  const lastOf = <T extends Block["t"]>(t: T) => { const b = blocks[blocks.length - 1]; return b?.t === t ? (b as Extract<Block, { t: T }>) : null; };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^\[\[([a-z0-9-]+)\]\]$/))) { flush(); blocks.push({ t: "embed", key: m[1] }); }
    else if ((m = line.match(/^(#{2,3})\s+(?:\[(đỏ|do|xanh)\]\s*)?(.*)$/i))) {
      flush();
      const tone = m[2] ? (/xanh/i.test(m[2]) ? "blue" : "red") : undefined;
      blocks.push({ t: "h", level: m[1].length as 2 | 3, text: m[3], tone });
    } else if ((m = line.match(/^[-•]\s+(.*)$/))) { flush(); const l = lastOf("ul"); if (l) l.items.push(m[1]); else blocks.push({ t: "ul", items: [m[1]] }); }
    else if ((m = line.match(/^\d+[.)]\s+(.*)$/))) { flush(); const l = lastOf("ol"); if (l) l.items.push(m[1]); else blocks.push({ t: "ol", items: [m[1]] }); }
    else if (line.startsWith("|")) {
      flush();
      if (/^\|[\s|:-]+\|?$/.test(line)) continue;
      const cells = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const l = lastOf("table"); if (l) l.rows.push(cells); else blocks.push({ t: "table", rows: [cells] });
    } else if ((m = line.match(/^>\s?(.*)$/))) { flush(); blocks.push({ t: "note", text: m[1] }); }
    else if ((m = line.match(/^!!\s?(.*)$/))) { flush(); blocks.push({ t: "warn", text: m[1] }); }
    else para.push(line);
  }
  flush();
  return blocks;
}

// dark: chữ trên nền tối (trang chủ phần navy)
export default function Doc({ text, embeds = {}, dark = false, headingClass }: { text: string; embeds?: Record<string, ReactNode>; dark?: boolean; headingClass?: string }) {
  const body = dark ? "text-white/80" : "text-slate-700";
  const strong = dark ? "text-white" : "text-navy";
  return (
    <>
      {parse(text).map((b, i) => {
        const first = i === 0 ? "" : "mt-3";
        switch (b.t) {
          case "h": {
            const color = b.tone === "red" ? "text-team-red" : b.tone === "blue" ? "text-team-blue" : strong;
            return b.level === 2
              ? <h3 key={i} className={`${i ? "mt-5" : ""} ${headingClass && !b.tone ? headingClass : `font-bold ${color}`}`}>{inline(b.text, color)}</h3>
              : <p key={i} className={`${i ? "mt-4" : ""} text-sm font-bold ${color}`}>{inline(b.text, color)}</p>;
          }
          case "p": return <p key={i} className={`${first} text-sm leading-relaxed ${body}`}>{inline(b.text, strong)}</p>;
          case "note": return <p key={i} className={`${i ? "mt-2" : ""} text-xs ${dark ? "text-white/60" : "text-slate-500"}`}>{inline(b.text, strong)}</p>;
          case "warn": return <p key={i} className={`${first} text-sm font-bold text-mech-red`}>{inline(b.text, "text-mech-red")}</p>;
          case "ul": return <ul key={i} className={`${i ? "mt-1" : ""} list-disc space-y-1 pl-5 text-sm ${body}`}>{b.items.map((x, j) => <li key={j}>{inline(x, strong)}</li>)}</ul>;
          case "ol": return <ol key={i} className={`${i ? "mt-1" : ""} list-decimal space-y-1 pl-5 text-sm ${body}`}>{b.items.map((x, j) => <li key={j}>{inline(x, strong)}</li>)}</ol>;
          case "table": {
            const [head, ...rows] = b.rows;
            return (
              <div key={i} className="mt-4 overflow-x-auto rounded-lg ring-1 ring-slate-200">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-ice text-xs uppercase text-navy-600"><tr>{head.map((h, j) => <th key={j} className="px-3 py-2">{inline(h)}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r, j) => <tr key={j}>{head.map((_, k) => <td key={k} className="px-3 py-2 align-top text-slate-700">{inline(r[k] ?? "")}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            );
          }
          case "embed": return <Fragment key={i}>{embeds[b.key] ?? null}</Fragment>;
        }
      })}
    </>
  );
}
