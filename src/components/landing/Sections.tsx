import { OrganizerLogos } from "@/components/brand/Logos";
import Link from "next/link";
import ArenaVideo from "@/components/landing/ArenaVideo";
import Reveal from "@/components/landing/Reveal";
import { ArrowRight, Box, CalendarClock, ChevronDown, Flag, Mail, MapPin, MessageCircle, Phone, Radio, ThumbsUp, Trophy, Users, Wallet } from "lucide-react";
import { CONTACT, FAQ, JOIN_STEPS, NAV_LINKS, PRIZES, SITE, TIMELINE, WORKSHOPS } from "@/lib/site";

export function Intro() {
  const stats = [
    { icon: Trophy, value: "32–64", label: "Đội thi dự kiến" },
    { icon: Users, value: "≤ 5", label: "Thành viên / đội" },
    { icon: Flag, value: "3", label: "Chặng thi đấu" },
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
              ENGINEERING PATH là cuộc thi học thuật thường niên do Khoa Cơ khí tổ chức, dành cho tân sinh viên
              khóa 2026 hệ chính quy toàn trường HCM-UTE. Chỉ với kiến thức cơ khí và lập trình cơ bản, các đội sẽ tự
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
  const zones = [
    { tag: "Chặng 1", title: "Hai làn dò line", desc: "Làn 90 cm dọc hai mép, line đen 20 mm: Đường Danh vọng thẳng 180 cm tới Checkpoint, Đường Thách thức ziczac 45°, vạch đích chữ T." },
    { tag: "Chặng 2", title: "Cấu kiện & Bục Cơ hội", desc: "6 Cấu kiện Kiến thức 6 cm hai màu, Bục Cơ hội 40 × 40 cm cao 5 cm mang khối Cơ hội vàng 8 cm, 2 Trạm thành tựu 30 × 30 cm ở hai cánh sân." },
    { tag: "Chặng 3", title: "Cầu Bản lĩnh & Bục Vinh Quang", desc: "Cầu gỗ 60 × 55 cm, 2 sân độc lập: Địa hình 5 thanh gờ, Trạm Thực nghiệm, Dốc Kiên trì lên Đài Bảo vệ 25 cm, Dốc Thăng hoa lên Đỉnh 50 cm có Đèn Vinh Quang." },
  ];
  return (
    <section id="sa-ban-3d" className="bg-navy py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-kicker !text-mech-gold">
              <span className="h-px w-8 bg-mech-gold" /> Sa bàn thi đấu
            </p>
            <h2 className="section-title mt-3 !text-white">Sa bàn 4,8 × 4,8 m</h2>
            <p className="mt-4 max-w-2xl text-white/75">
              Một sa bàn chung, ba vùng thi đấu nối tiếp nhau. Xoay, phóng to mô hình 3D để xem kích thước từng chi tiết.
            </p>
          </div>
          <Link href="/arena-3d" className="btn-primary shrink-0">
            <Box className="h-5 w-5" /> Khám phá sa bàn 3D
          </Link>
        </div>
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
          <Reveal>
            <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/30">
              <ArenaVideo />
              <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-navy-900/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-mech-red" /> Mô phỏng trận đấu
              </span>
            </div>
          </Reveal>
          <ul className="space-y-4">
            {zones.map((z, i) => (
              <li key={z.tag}>
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

export function Prizes() {
  return (
    <section id="giai-thuong" className="bg-ice py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="section-kicker">
          <span className="h-px w-8 bg-mech-red" /> Giải thưởng & hỗ trợ
        </p>
        <h2 className="section-title mt-3">Tổng giải thưởng 4.500.000đ</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PRIZES.map((p, i) => (
            <li key={p.rank} className={`rounded-xl p-5 ${i === 0 ? "bg-navy text-white shadow-lg" : "bg-white ring-1 ring-slate-200"}`}>
              <div className={`text-xs font-bold uppercase tracking-widest ${i === 0 ? "text-mech-gold" : "text-mech-red"}`}>{p.rank}</div>
              <div className={`mt-2 font-display text-3xl ${i === 0 ? "" : "text-navy"}`}>{p.reward}</div>
              <p className={`mt-1 text-sm ${i === 0 ? "text-white/75" : "text-slate-500"}`}>{p.extra}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-500">Mọi thành viên tham gia nhận Giấy chứng nhận và điểm cộng hoạt động theo quy định của Khoa.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {WORKSHOPS.map((w) => (
            <div key={w.title} className="rounded-xl border-l-4 border-fmes bg-white p-5 shadow-sm">
              <div className="font-display text-lg uppercase text-navy">{w.title}</div>
              <p className="mt-1 text-sm text-slate-600">{w.desc}</p>
            </div>
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
        <Link href="/lich-thi" className="mt-8 inline-flex items-center gap-2 font-bold text-navy-600 hover:text-mech-red">
          Xem lịch thi đấu chi tiết <ArrowRight className="h-4 w-4" />
        </Link>
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
              Mở khi giải khởi tranh – điểm số và tiến độ Chặng 3 của từng trận cập nhật theo thời gian thực.
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
          <p className="mt-4 text-slate-600">Chưa thấy câu trả lời? Liên hệ BTC qua fanpage CLB NCKH CK (FMES).</p>
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
            <li><Link href="/lich-thi" className="hover:text-mech-gold">Lịch thi & bảng xếp hạng</Link></li>
            <li><Link href="/vote" className="hover:text-mech-gold">Bình chọn khán giả</Link></li>
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
          {/* Điền thông tin trong CONTACT (src/lib/site.ts) — mục trống sẽ tự ẩn */}
          <ul className="mt-2 space-y-1.5">
            {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-mech-gold"><Mail className="h-4 w-4 shrink-0" /> {CONTACT.email}</a></li>}
            {CONTACT.phone && <li><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-mech-gold"><Phone className="h-4 w-4 shrink-0" /> {CONTACT.phone}</a></li>}
            {CONTACT.fanpage && <li><a href={CONTACT.fanpage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-mech-gold"><ThumbsUp className="h-4 w-4 shrink-0" /> Fanpage</a></li>}
            {CONTACT.zaloGroup && <li><a href={CONTACT.zaloGroup} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-mech-gold"><MessageCircle className="h-4 w-4 shrink-0" /> Nhóm Zalo đội trưởng</a></li>}
            {CONTACT.address && <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {CONTACT.address}</li>}
            {!CONTACT.email && !CONTACT.phone && !CONTACT.fanpage && <li className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> Kênh liên hệ đang cập nhật</li>}
          </ul>
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
