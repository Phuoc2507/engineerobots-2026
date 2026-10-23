import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, Users, Wallet } from "lucide-react";
import { SITE } from "@/lib/site";
import Countdown from "./Countdown";
import DominationGrid from "./DominationGrid";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy bg-tech-grid bg-grid-40 pt-28 pb-20 text-white md:pt-36 md:pb-28">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-mech-red/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-navy-600/60 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 md:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="section-kicker !text-mech-gold">
            <span className="h-px w-8 bg-mech-gold" />
            {SITE.faculty} · Tân sinh viên K26
          </p>
          <h1 className="mt-5 font-display uppercase leading-[0.9] tracking-wide">
            <span className="block text-6xl sm:text-7xl md:text-8xl">Engineerobots</span>
            <span className="block text-7xl text-mech-gold sm:text-8xl md:text-9xl">2026</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            Chủ đề <strong className="text-white">&ldquo;{SITE.theme}&rdquo;</strong>. Thiết kế, chế tạo và lập
            trình robot vượt <strong className="text-white">Chặng 1 dò line tốc độ</strong>, rồi đối kháng trực
            diện tranh <strong className="text-white">9 cứ điểm Domination</strong>.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
            {[
              { icon: Users, t: "Đội 3–5 người" },
              { icon: BadgeCheck, t: "Chỉ dành cho K26" },
              { icon: Wallet, t: "Miễn phí 100%" },
            ].map((c) => (
              <li key={c.t} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                <c.icon className="h-4 w-4 text-mech-gold" /> {c.t}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              Cổng đăng ký đóng sau
            </p>
            <Countdown deadline={SITE.registrationDeadline} />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary">
              Đăng ký đội thi <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/arena-3d" className="btn-outline">
              <Box className="h-5 w-5" /> Xem sa bàn 3D
            </Link>
          </div>
        </div>

        <DominationGrid />
      </div>
    </section>
  );
}
