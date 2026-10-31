import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { SITE } from "@/lib/site";
import { BrandMark } from "@/components/brand/Logos";

// Khung chung cho các trang cổng sinh viên (/register, /team/dashboard)
export default function PortalShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-navy pb-24 pt-6 text-white">
        <div className="pointer-events-none absolute inset-0 bg-tech-grid bg-grid-40" />
        <div className="relative mx-auto flex max-w-3xl items-center justify-between px-4">
          <Link href="/" aria-label="FME JOURNEY 2026 – Trang chủ"><BrandMark /></Link>
          <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-white/80 transition hover:text-mech-gold">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Link>
        </div>
        <div className="relative mx-auto mt-10 max-w-3xl px-4">
          <p className="section-kicker text-mech-gold">{SITE.name}</p>
          <h1 className="mt-2 font-display text-4xl uppercase tracking-wide md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-white/75">{subtitle}</p>
        </div>
      </header>
      <main className="relative mx-auto -mt-16 max-w-3xl px-4 pb-20">{children}</main>
    </div>
  );
}

export function AccountBar({ email }: { email: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200">
      <p className="min-w-0 truncate text-sm text-slate-600">Đăng nhập: <b className="text-navy">{email}</b></p>
      <SignOutButton compact />
    </div>
  );
}

export function SignOutButton({ compact, to }: { compact?: boolean; to?: string }) {
  return (
    <form action="/auth/signout" method="post">
      {to && <input type="hidden" name="to" value={to} />}
      <button className={`inline-flex items-center gap-1.5 rounded-md font-semibold transition ${
        compact ? "h-9 px-2 text-sm text-slate-500 hover:text-mech-red" : "h-11 border border-slate-300 px-4 text-navy hover:border-mech-red hover:text-mech-red"
      }`}>
        <LogOut className="h-4 w-4" /> Đăng xuất
      </button>
    </form>
  );
}
