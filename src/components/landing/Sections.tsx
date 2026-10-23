import Image from "next/image";
import { OrganizerLogos } from "@/components/brand/Logos";
import Link from "next/link";
import { ArrowRight, Box, CalendarClock, ChevronDown, Flag, Mail, Radio, Trophy, Users, Wallet } from "lucide-react";
import { FAQ, JOIN_STEPS, NAV_LINKS, SITE, TIMELINE } from "@/lib/site";

export function Intro() {
  const stats = [
    { icon: Trophy, value: "32–64", label: "Đội thi dự kiến" },
    { icon: Users, value: "3–5", label: "Thành viên / đội" },
    { icon: Flag, value: "2", label: "Chặng thi đấu" },
    { icon: Wallet, value: "0đ", label: "Lệ phí tham dự" },
  ];
  return (
    <section id="gioi-thieu" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="section-kicker">
              <span className="h-px w-8 bg-mech-red" /> Giới thiệu
            </p>
            <h2 className="section-title mt-3">Sân chơi đầu tiên của kỹ sư K26</h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              ENGINEEROBOTS là cuộc thi học thuật thường niên dành cho tân sinh viên Khoa Cơ khí – Cơ điện tử, Chế
              tạo máy, Ô tô, Robot &amp; AI, Tự động hóa. Chỉ với kiến thức cơ khí và lập trình cơ bản, các đội sẽ tự
              tay đi từ ý tưởng đến một robot thi đấu thực thụ.
            </p>
            <p className="mt-4 text-slate-600">
              Tổ chức bởi <strong className="text-navy">{SITE.organizer}</strong>.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-ice p-5 md:p-6">
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
              Tham gia chỉ với <span className="text-mech-gold">3 bước</span>
            </h3>
            <Link href="/register" className="btn-primary shrink-0">
              Bắt đầu đăng ký <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {JOIN_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
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

export function ArenaShowcase() {
  const mechanisms = [
    {
      src: "/images/ground_flip_mechanism.gif",
      title: "Phương án A · Tấm lật bản lề",
      desc: "Robot gắn mũi vát 30° sát sàn, đẩy nhẹ là tấm lật úp sang màu đội mình.",
    },
    {
      src: "/images/rocker_plate_mechanism.gif",
      title: "Phương án B · Bàn đạp bập bênh",
      desc: "Bàn đạp cao 12 mm có nam châm – chỉ cần cán bánh xe qua là đổi màu.",
    },
  ];
  return (
    <section id="sa-ban-3d" className="bg-navy py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-kicker !text-mech-gold">
              <span className="h-px w-8 bg-mech-gold" /> Sa bàn thi đấu
            </p>
            <h2 className="section-title mt-3 !text-white">Cơ chế lật cứ điểm sát mặt đất</h2>
            <p className="mt-4 max-w-2xl text-white/75">
              BTC đang chốt một trong hai phương án dưới đây. Khám phá sa bàn 3D tương tác với các điểm ghim kích
              thước và mô phỏng xe chạy thử.
            </p>
          </div>
          <Link href="/arena-3d" className="btn-primary shrink-0">
            <Box className="h-5 w-5" /> Khám phá sa bàn 3D
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {mechanisms.map((m) => (
            <figure key={m.src} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <Image src={m.src} alt={m.title} width={1000} height={600} unoptimized className="h-auto w-full" />
              <figcaption className="p-5">
                <div className="font-display text-xl uppercase tracking-wide">{m.title}</div>
                <p className="mt-1 text-sm text-white/75">{m.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Timeline() {
  return (
    <section id="lich-trinh" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="section-kicker">
          <span className="h-px w-8 bg-mech-red" /> Lịch trình
        </p>
        <h2 className="section-title mt-3">Các mốc quan trọng</h2>
        <ol className="relative mt-12 grid gap-4 border-l-2 border-slate-200 pl-6 md:grid-cols-5 md:gap-6 md:border-l-0 md:pl-0">
          {TIMELINE.map((t, i) => {
            const current = t.status === "current";
            return (
              <li
                key={t.title}
                className={`relative rounded-xl border p-5 ${
                  current ? "border-mech-red bg-white shadow-lg shadow-mech-red/10" : "border-slate-200 bg-ice"
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
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Đang mở
                    </span>
                  )}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-mech-red">
                  <CalendarClock className="h-3.5 w-3.5" /> {t.date}
                </div>
                <div className="mt-1 font-bold text-navy">{t.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Leaderboard() {
  return (
    <section id="bang-vang" className="bg-ice pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* TODO(Giai đoạn 3): đọc bảng matches qua Supabase Realtime */}
        <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:p-8">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-navy text-mech-gold">
            <Radio className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <div className="font-display text-2xl uppercase text-navy">Bảng điểm trực tiếp</div>
            <p className="mt-1 text-slate-600">
              Mở khi giải khởi tranh – điểm số và trạng thái 9 cứ điểm của từng trận cập nhật theo thời gian thực.
            </p>
          </div>
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 font-bold uppercase tracking-wide text-navy-600 hover:text-mech-red"
          >
            Xem bảng điểm <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="hoi-dap" className="bg-ice py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="section-kicker">
            <span className="h-px w-8 bg-mech-red" /> Hỏi đáp
          </p>
          <h2 className="section-title mt-3">Câu hỏi thường gặp</h2>
          <p className="mt-4 text-slate-600">Chưa thấy câu trả lời? Liên hệ BTC qua fanpage CLB Robot Cơ khí (FMES).</p>
        </div>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-white open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-navy [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-mech-red transition group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RegisterCta() {
  return (
    <section id="dang-ky" className="relative overflow-hidden bg-mech-red py-20 text-white">
      <div className="pointer-events-none absolute inset-0 bg-tech-grid bg-grid-40 opacity-40" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-6">
        <h2 className="font-display text-4xl uppercase tracking-wide md:text-6xl">Sẵn sàng chế tạo robot?</h2>
        <p className="mt-4 max-w-2xl text-lg text-white/90">
          Đăng ký bằng tài khoản Google email trường <strong>@student.hcmute.edu.vn</strong>. 100% thành viên phải
          là sinh viên K26 – hệ thống tự xác thực qua MSSV.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-white px-8 py-4 font-bold uppercase tracking-wide text-mech-red shadow-xl transition hover:-translate-y-0.5 hover:bg-mech-gold hover:text-navy"
        >
          Đăng ký ngay <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-900 pb-24 pt-12 text-white/75 sm:pb-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 md:grid-cols-4 md:px-6">
        <div>
          <div className="font-display text-2xl tracking-wider text-white">{SITE.name}</div>
          <p className="mt-2 text-sm">&ldquo;{SITE.theme}&rdquo;</p>
        </div>
        <nav className="text-sm" aria-label="Liên kết nhanh">
          <div className="font-bold uppercase tracking-wider text-white">Liên kết nhanh</div>
          <ul className="mt-2 space-y-1.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-mech-gold">{l.label}</a>
              </li>
            ))}
            <li><Link href="/rules" className="hover:text-mech-gold">Thể lệ chi tiết</Link></li>
          </ul>
        </nav>
        <div className="text-sm">
          <div className="font-bold uppercase tracking-wider text-white">Đơn vị chỉ đạo</div>
          <p className="mt-2">{SITE.faculty}</p>
          <div className="mt-4 font-bold uppercase tracking-wider text-white">Đơn vị tổ chức</div>
          <p className="mt-2">{SITE.organizer}</p>
        </div>
        <div className="text-sm">
          <div className="font-bold uppercase tracking-wider text-white">Liên hệ</div>
          {/* TODO(BTC): bổ sung email / fanpage chính thức */}
          <p className="mt-2 inline-flex items-center gap-2">
            <Mail className="h-4 w-4" /> Đang cập nhật
          </p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-white/10 px-4 pt-8 md:flex-row md:items-center md:justify-between md:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Đồng hành tổ chức</p>
        <OrganizerLogos size={56} labels className="!gap-6" />
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-4 pt-6 text-xs md:px-6">
        © 2026 {SITE.name} · {SITE.faculty} ·{" "}
        <Link href="/privacy" className="hover:text-mech-gold">Chính sách quyền riêng tư</Link>
      </div>
    </footer>
  );
}
