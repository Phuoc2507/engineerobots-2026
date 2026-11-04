import Link from "next/link";
import ArenaVideo from "@/components/landing/ArenaVideo";
import Reveal from "@/components/landing/Reveal";
import { ArrowRight, Box, CalendarClock, Flag, Globe, Mail, Phone, Radio, ThumbsUp, Trophy, Users, Wallet } from "lucide-react";
import type { Content } from "@/lib/content";
import Rich from "@/components/content/Rich";

const STAT_ICONS = [Trophy, Users, Flag, Wallet];

export function Intro({ c }: { c: Content }) {
  const it = c.intro;
  const stats = it.stats.map((s, i) => ({ ...s, icon: STAT_ICONS[i % STAT_ICONS.length] }));
  return (
    <section id="gioi-thieu" className="bg-part-intro py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="section-kicker">
              <span className="h-px w-8 bg-mech-red" /> {it.kicker}
            </p>
            <h2 className="section-title mt-3">{it.title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              <Rich text={it.body} strongClass="text-navy" />
            </p>
            <p className="mt-4 text-slate-600">
              {c.home.organizerPrefix} <strong className="text-navy">{c.site.organizer}</strong>.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={`${s.label}${s.value}`} className="rounded-xl border border-slate-200 bg-ice p-5 md:p-6">
                <s.icon className="h-6 w-6 text-mech-red" />
                <dd className="mt-4 font-display text-4xl text-navy md:text-5xl">{s.value}</dd>
                <dt className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-600">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Quy trình tham gia */}
        <div className="mt-16 rounded-2xl bg-navy p-6 text-white md:p-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h3 className="font-display text-2xl uppercase tracking-wide md:text-3xl">
              {it.stepsTitle} <span className="text-mech-gold">{it.stepsHighlight}</span>
            </h3>
            <Link href="/register" className="btn-primary shrink-0">
              {c.home.stepsButton} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {it.steps.map((s, i) => (
              <li key={`${i}${s.title}`} className="flex gap-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mech-gold font-display text-lg text-navy">
                  {i + 1}
                </span>
                <div>
                  <div className="font-bold">{s.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ArenaShowcase({ c }: { c: Content }) {
  const a = c.arena;
  const zones = a.zones;
  return (
    <section id="sa-ban-3d" className="bg-part-arena py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-kicker !text-mech-gold">
              <span className="h-px w-8 bg-mech-gold" /> {a.kicker}
            </p>
            <h2 className="section-title mt-3 !text-white">{a.title}</h2>
            <p className="mt-4 max-w-2xl text-white/75">{a.text}</p>
          </div>
          <Link href="/arena-3d" className="btn-primary shrink-0">
            <Box className="h-5 w-5" /> {c.home.arenaButton}
          </Link>
        </div>
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
          <Reveal>
            <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/30">
              <ArenaVideo src={a.video} poster={a.poster} />
              <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-navy-900/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-mech-red" /> {a.videoLabel}
              </span>
            </div>
          </Reveal>
          <ul className="space-y-4">
            {zones.map((z, i) => (
              <li key={`${i}${z.tag}`}>
                <Reveal delay={120 * (i + 1)}>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-mech-gold/50 hover:bg-white/10">
                    <span className="text-xs font-bold uppercase tracking-widest text-mech-gold">{z.tag}</span>
                    <div className="mt-1 font-display text-xl uppercase tracking-wide">{z.title}</div>
                    <p className="mt-1 text-sm text-white/75">{z.desc}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Prizes({ c }: { c: Content }) {
  const pz = c.prizes;
  return (
    <section id="giai-thuong" className="bg-part-prizes py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="section-kicker">
          <span className="h-px w-8 bg-mech-red" /> {pz.kicker}
        </p>
        <h2 className="section-title mt-3">{pz.title}</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {pz.items.map((p, i) => (
            <li key={`${i}${p.rank}`} className={`flex flex-col rounded-xl p-5 ${i === 0 ? "bg-navy text-white shadow-lg" : "bg-white ring-1 ring-slate-200"}`}>
              <div className={`text-xs font-bold uppercase tracking-widest ${i === 0 ? "text-mech-gold" : "text-mech-red"}`}>{p.rank}</div>
              {/* "Hiện kim + Giấy chứng nhận": tách 2 dòng để chữ lớn không bị ngắt giữa cụm từ */}
              {p.reward.split(" + ").map((part, j) => (
                <div key={part} className={j === 0
                  ? `mt-2 font-display text-2xl uppercase leading-none tracking-wide ${i === 0 ? "" : "text-navy"}`
                  : `mt-1.5 whitespace-nowrap text-sm font-semibold ${i === 0 ? "text-white/85" : "text-slate-600"}`}>
                  {j > 0 && "+ "}{part}
                </div>
              ))}
              {p.extra && <p className={`mt-auto pt-3 text-xs ${i === 0 ? "text-white/70" : "text-slate-500"}`}>{p.extra}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 text-sm text-slate-500">
          {pz.notes.split("\n").filter((l) => l.trim()).map((l) => <p key={l}>{l}</p>)}
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {pz.workshops.map((w, i) => (
            <div key={`${i}${w.title}`} className="rounded-xl border-l-4 border-fmes bg-white p-5 shadow-sm">
              <div className="font-display text-lg uppercase text-navy">{w.title}</div>
              <p className="mt-1 text-sm text-slate-600">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Timeline({ c }: { c: Content }) {
  const tl = c.timeline;
  return (
    <section id="lich-trinh" className="bg-part-timeline py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="section-kicker">
          <span className="h-px w-8 bg-mech-red" /> {tl.kicker}
        </p>
        <h2 className="section-title mt-3">{tl.title}</h2>
        <ol className="relative mt-12 grid gap-4 border-l-2 border-slate-200 pl-6 md:grid-cols-5 md:gap-6 md:border-l-0 md:pl-0">
          {tl.items.map((t, i) => {
            const current = t.status === "current";
            const done = t.status === "done";
            return (
              <li
                key={`${i}${t.title}`}
                className={`relative rounded-xl border p-5 ${
                  current ? "border-mech-red bg-white shadow-lg shadow-mech-red/10" : done ? "border-slate-200 bg-ice opacity-70" : "border-slate-200 bg-ice"
                }`}
              >
                <span
                  className={`absolute -left-[33px] top-6 h-4 w-4 rounded-full border-4 border-white md:hidden ${
                    current ? "bg-mech-red" : "bg-slate-300"
                  }`}
                />
                <div className="flex items-center justify-between">
                  <span className={`font-display text-4xl ${current ? "text-mech-red" : "text-slate-300"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {current && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mech-red px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {c.home.timelineBadge}
                    </span>
                  )}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-mech-red">
                  <CalendarClock className="h-3.5 w-3.5" /> {t.date}
                </div>
                <div className="mt-1 font-bold text-navy">{t.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.desc}</p>
                {t.href && t.cta && (
                  <Link href={t.href} className="mt-3 inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-navy-600 px-2.5 py-2 text-xs font-bold text-white transition hover:bg-mech-red">
                    {t.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
        <Link href="/lich-thi" className="mt-8 inline-flex items-center gap-2 font-bold text-navy-600 hover:text-mech-red">
          {c.home.timelineLink} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function Leaderboard({ c }: { c: Content }) {
  const h = c.home;
  if (!h.liveOn) return null;
  return (
    <section id="bang-vang" className="bg-part-rules pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:p-8">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-navy text-mech-gold">
            <Radio className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <div className="font-display text-2xl uppercase text-navy">{h.liveTitle}</div>
            <p className="mt-1 text-slate-600">{h.liveText}</p>
          </div>
          <Link
            href={h.liveHref || "/lich-thi"}
            className="inline-flex items-center gap-2 font-bold uppercase tracking-wide text-navy-600 hover:text-mech-red"
          >
            {h.liveButton} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function RegisterCta({ c }: { c: Content }) {
  return (
    <section id="dang-ky" className="relative overflow-hidden bg-part-cta py-20 text-white">
      <div className="pointer-events-none absolute inset-0 bg-tech-grid bg-grid-40 opacity-40" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-6">
        <h2 className="font-display text-4xl uppercase tracking-wide md:text-6xl">{c.cta.title}</h2>
        <p className="mt-4 max-w-2xl text-lg text-white/90">
          <Rich text={c.cta.text} />
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-white px-8 py-4 font-bold uppercase tracking-wide text-mech-red shadow-xl transition hover:-translate-y-0.5 hover:bg-mech-gold hover:text-navy"
        >
          {c.cta.button} <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

export function Footer({ c }: { c: Content }) {
  const SITE = c.site;
  const F = c.footer;
  return (
    <footer className="bg-part-footer pb-24 pt-12 text-white/75 sm:pb-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 md:grid-cols-4 md:px-6">
        <div>
          <div className="font-display text-2xl tracking-wider text-white">{SITE.name}</div>
          <p className="mt-2 text-sm">&ldquo;{SITE.theme}&rdquo;</p>
        </div>
        <nav className="text-sm" aria-label="Liên kết nhanh">
          <div className="font-bold uppercase tracking-wider text-white">{F.linksTitle}</div>
          <ul className="mt-2 space-y-1.5">
            {F.links.filter((l) => l.label.trim() && l.href.trim()).map((l, i) => (
              <li key={`${i}${l.href}`}>
                <a href={l.href} className="hover:text-mech-gold">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          <div className="font-bold uppercase tracking-wider text-white">{F.facultyTitle}</div>
          <Units units={F.facultyUnits} />
          <div className="mt-4 font-bold uppercase tracking-wider text-white">{F.organizerTitle}</div>
          <Units units={F.organizerUnits} />
        </div>
        <div className="text-sm">
          <div className="font-bold uppercase tracking-wider text-white">{F.contactTitle}</div>
          {/* Sửa ở /admin/content → Chân trang → Các dòng liên hệ */}
          <ul className="mt-2 space-y-2">
            {F.contactLinks.filter((l) => l.label.trim() || l.url.trim()).map((l, i) => (
              <li key={`${i}${l.label}${l.url}`}><ContactLine label={l.label} value={l.url} /></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-4 pt-6 text-xs md:px-6">
        {F.copyright}{F.owner.trim() && <> · {F.owner}</>} ·{" "}
        <Link href="/privacy" className="hover:text-mech-gold">{F.privacyLabel}</Link>
      </div>
    </footer>
  );
}

// Link liên hệ: tự nhận email / số điện thoại / trang web để chọn biểu tượng và kiểu liên kết
const EMAIL = /[^\s@:]+@[^\s@]+\.[^\s@]+/;
const PHONE = /\+?\d[\d\s.]{7,}\d/;
function contactHref(raw: string) {
  const v = raw.trim();
  if (/^(mailto:|tel:|https?:\/\/)/i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v) && /[a-z]/i.test(v) && !EMAIL.test(v)) return `https://${v}`;
  const mail = v.match(EMAIL);
  if (mail) return `mailto:${mail[0]}`;
  const phone = v.match(PHONE);
  if (phone) return `tel:${phone[0].replace(/[\s.]/g, "")}`;
  return null;
}

// Một dòng ở cột Liên hệ: chữ thường; kèm SĐT / email thì hiện thêm dòng bấm được; kèm link thì cả dòng là nút
function ContactLine({ label, value }: { label: string; value: string }) {
  const href = contactHref(value);
  const text = label.trim() ? <Rich text={label} strongClass="font-semibold text-white" /> : null;
  if (!href) return <p>{text}{text && value.trim() ? " " : ""}{value.trim()}</p>;
  if (/^https?:/i.test(href)) return <ContactLink url={href} label={label.trim() || value.trim()} />;
  return (
    <>
      {text && <p>{text}</p>}
      <ContactLink url={href} label={value.trim()} />
    </>
  );
}

function ContactLink({ url, label }: { url: string; label: string }) {
  const href = contactHref(url) ?? "#";
  const Icon = href.startsWith("mailto:") ? Mail : href.startsWith("tel:") ? Phone : /facebook\.com|fb\.com|fb\.me/i.test(href) ? ThumbsUp : Globe;
  const ext = /^https?:/i.test(href);
  return (
    <a href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex items-start gap-2 break-words font-semibold text-white/90 hover:text-mech-gold">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" /> {label}
    </a>
  );
}

function Units({ units }: { units: { name: string; fanpage: string; email: string }[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {units.filter((u) => u.name.trim()).map((u, i) => (
        <li key={`${i}${u.name}`}>
          <p>{u.name}</p>
          {(u.fanpage.trim() || u.email.trim()) && (
            <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
              {u.fanpage.trim() && <ContactLink url={u.fanpage} label="Fanpage" />}
              {u.email.trim() && <ContactLink url={u.email} label={u.email.trim()} />}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
