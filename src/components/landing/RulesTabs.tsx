"use client";

/* eslint-disable @next/next/no-img-element -- sơ đồ sa bàn có thể là ảnh BTC tải lên kho ấn phẩm */
import Link from "next/link";
import { useState } from "react";
import { Boxes, Cpu, Crown, Route } from "lucide-react";
import type { Content } from "@/lib/content";
import Doc from "@/components/content/Doc";

const ICONS = [Route, Boxes, Crown];

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{k}</div>
      <div className="mt-1 font-display text-2xl text-navy">{v}</div>
    </div>
  );
}

// "Checkpoint | +10đ" mỗi dòng một ô
const parseFacts = (s: string) =>
  s.split("\n").map((l) => l.split("|").map((x) => x.trim())).filter(([k, v]) => k && v).map(([k, v]) => ({ label: k, value: v }));

export default function RulesTabs({ h, specs, image }: { h: Content["home"]; specs: { label: string; value: string }[]; image: string }) {
  const tabs = [
    ...h.rulesTabs.filter((t) => t.label.trim()).map((t, i) => ({ ...t, icon: ICONS[i % ICONS.length], facts: parseFacts(t.facts) })),
    { label: h.specsLabel, title: h.specsTitle, body: h.specsBody, icon: Cpu, facts: specs },
  ];
  const [tab, setTab] = useState(0);
  const t = tabs[Math.min(tab, tabs.length - 1)];

  return (
    <section id="the-le" className="bg-part-rules pb-12 pt-20 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="section-kicker">
          <span className="h-px w-8 bg-mech-red" /> {h.rulesKicker}
        </p>
        <h2 className="section-title mt-3">{h.rulesTitle}</h2>

        <div role="tablist" className="mt-10 flex flex-wrap gap-2">
          {tabs.map((x, i) => (
            <button
              key={`${i}${x.label}`}
              role="tab"
              aria-controls="rules-panel"
              aria-selected={t === x}
              onClick={() => setTab(i)}
              className={`inline-flex items-center gap-2 min-h-11 rounded-md px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                t === x ? "bg-navy text-white shadow-lg" : "bg-white text-navy hover:bg-slate-100"
              }`}
            >
              <x.icon className="h-4 w-4" /> {x.label}
            </button>
          ))}
        </div>

        <div id="rules-panel" role="tabpanel" className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-3xl uppercase text-navy">{t.title}</h3>
            <div className="mt-4 [&>p:first-child]:text-base [&>p:first-child]:text-slate-600 [&_li]:text-base [&_p]:text-base">
              <Doc text={t.body} />
            </div>
            {t.facts.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {t.facts.map((f, i) => <Fact key={`${i}${f.label}`} k={f.label} v={f.value} />)}
              </div>
            )}
          </div>

          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <img
              src={image}
              alt="Sơ đồ sa bàn 4800 × 4800 mm: hai làn dò line hai bên, Chặng 2 cấu kiện và Bục Cơ hội phía dưới, Chặng 3 Cầu Bản lĩnh, Địa hình và Bục Vinh Quang phía trên"
              width={1800}
              height={2363}
              loading="lazy"
              className="h-auto w-full rounded-md"
            />
            <figcaption className="mt-2 flex items-center justify-between px-1 text-xs text-slate-500">
              <span>{h.rulesImageCaption}</span>
              <Link href="/rules" className="font-semibold text-navy-600 hover:underline">
                {h.rulesImageLink}
              </Link>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
