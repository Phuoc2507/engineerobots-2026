import Link from "next/link";
import { MonitorPlay } from "lucide-react";
import { SITE, STAFF_ROLES } from "@/lib/site";
import type { Staff } from "@/lib/staff";
import { BrandMark } from "@/components/brand/Logos";
import { SignOutButton } from "@/components/register/PortalShell";

const TABS = [
  { href: "/admin", label: "Tổng quan", roles: ["BTC"] },
  { href: "/admin/teams", label: "Đội thi", roles: ["BTC"] },
  { href: "/admin/matches", label: "Trận đấu", roles: ["BTC"] },
  { href: "/referee", label: "Điều khiển trận", roles: ["BTC", "HEAD_REFEREE", "REFEREE"] },
  { href: "/admin/checkin", label: "Check-in & Kỹ thuật", roles: ["BTC", "HEAD_REFEREE", "REFEREE"] },
  { href: "/admin/practice", label: "Thử sa bàn", roles: ["BTC"] },
  { href: "/admin/appeals", label: "Khiếu nại", roles: ["BTC", "HEAD_REFEREE"] },
  { href: "/admin/rules", label: "Barem điểm", roles: ["BTC"] },
  { href: "/admin/staff", label: "Nhân sự", roles: ["BTC"] },
  { href: "/admin/settings", label: "Cài đặt", roles: ["BTC"] },
];

// Khung chung cho khu vực BTC / trọng tài (rộng hơn cổng sinh viên)
export default function AdminShell({ staff, active, title, children, actions }: {
  staff: Staff; active: string; title: string; children: React.ReactNode; actions?: React.ReactNode;
}) {
  const tabs = TABS.filter((t) => t.roles.includes(staff.role));
  return (
    <div className="min-h-screen bg-ice">
      <header className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0 bg-tech-grid bg-grid-40" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" aria-label={`${SITE.name} – Trang chủ`}><BrandMark /></Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/stage" target="_blank" className="hidden items-center gap-1.5 font-semibold text-white/80 hover:text-mech-gold sm:inline-flex">
              <MonitorPlay className="h-4 w-4" /> Màn hình sân khấu
            </Link>
            <span className="hidden text-right leading-tight md:block">
              <b className="block">{staff.full_name || staff.email}</b>
              <span className="text-xs text-mech-gold">{STAFF_ROLES[staff.role] ?? staff.role}</span>
            </span>
            <div className="[&_button]:text-white/70 [&_button:hover]:text-mech-gold">
              <SignOutButton compact to="/referee/login" />
            </div>
          </div>
        </div>
        <nav className="relative mx-auto max-w-6xl overflow-x-auto px-4" aria-label="Khu vực quản trị">
          <ul className="flex gap-1 whitespace-nowrap">
            {tabs.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active === t.href ? "page" : undefined}
                  className={`inline-block rounded-t-md px-4 py-2.5 text-sm font-bold transition ${
                    active === t.href ? "bg-ice text-navy" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-20">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl uppercase tracking-wide text-navy">{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
