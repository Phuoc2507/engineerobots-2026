import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, Users, Wallet } from "lucide-react";
import type { Content } from "@/lib/content";
import Rich from "@/components/content/Rich";
import AnnounceBar from "@/components/content/AnnounceBar";
import Countdown from "./Countdown";
import DominationGrid from "./DominationGrid";
import { OrganizerLogos } from "@/components/brand/Logos";

export default function Hero({ c }: { c: Content }) {
  const h = c.hero;
  return (
    <section className="relative overflow-hidden bg-navy bg-tech-grid bg-grid-40 pt-28 pb-20 text-white md:pt-36 md:pb-28">
      {c.brand.heroBackground && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.brand.heroBackground} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy/80" />
        </div>
      )}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-mech-red/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-fmes/40 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <AnnounceBar a={c.announce} className="mb-8 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/20" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 md:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-7 inline-flex items-center gap-4 rounded-full bg-white/5 py-1.5 pl-1.5 pr-5 ring-1 ring-white/10">
            <OrganizerLogos b={c.brand} size={40} className="!gap-2" />
            {c.brand.logosText.trim() && (
              <span className="hidden text-[11px] font-semibold uppercase leading-tight tracking-[0.2em] text-white/70 sm:block">
                <Rich text={c.brand.logosText} />
              </span>
            )}
          </div>
          <p className="section-kicker !text-mech-gold">
            <span className="h-px w-8 bg-mech-gold" />
            {h.kicker}
          </p>
          <h1 className="mt-5 font-display uppercase leading-[0.9] tracking-wide">
            <span className="block text-6xl sm:text-7xl md:text-8xl">{h.title1}</span>
            <span className="block text-7xl text-mech-gold sm:text-8xl md:text-9xl">{h.title2}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            <Rich text={h.intro} strongClass="text-white" />
          </p>

          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
            {h.chips.filter((x) => x.text.trim()).map((x, i) => {
              const Icon = [Users, BadgeCheck, Wallet][i % 3];
              return (
                <li key={`${i}${x.text}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                  <Icon className="h-4 w-4 text-mech-gold" /> {x.text}
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <Countdown start={c.site.registrationStart} deadline={c.site.registrationDeadline} note={c.site.countdownNote}
              labels={{ before: c.home.countdownBefore, during: c.home.countdownDuring, after: c.home.countdownAfter }} />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary">
              {h.ctaPrimary} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/arena-3d" className="btn-outline">
              <Box className="h-5 w-5" /> {h.ctaSecondary}
            </Link>
          </div>
        </div>

        {c.brand.heroVisual ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={c.brand.heroVisual} alt={c.site.name} className="mx-auto max-h-[560px] w-full rounded-2xl object-contain shadow-2xl shadow-black/30" />
        ) : (
          <DominationGrid />
        )}
      </div>
    </section>
  );
}
