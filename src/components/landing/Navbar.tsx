"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Gavel, GraduationCap, LogIn, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { BrandMark } from "@/components/brand/Logos";

const LOGIN_OPTIONS = [
  { href: "/team/dashboard", icon: GraduationCap, title: "Sinh viên K26", hint: "Email @student.hcmute.edu.vn", tone: "text-navy-600" },
  { href: "/referee/login", icon: Gavel, title: "Trọng tài / BTC", hint: "Tài khoản do BTC cấp", tone: "text-mech-red" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tô sáng mục menu ứng với section đang xem
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!loginOpen && !open) return;
    const onClick = (e: MouseEvent) => {
      if (!loginRef.current?.contains(e.target as Node)) setLoginOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLoginOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [loginOpen, open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || open ? "bg-navy/95 shadow-lg backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="text-white" aria-label="ENGINEERING PATH 2026 – Trang chủ">
          <BrandMark />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? "true" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                  active === l.href ? "bg-white/10 text-mech-gold" : "text-white/85 hover:text-mech-gold"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div ref={loginRef} className="relative hidden sm:block">
            <button
              onClick={() => setLoginOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-white transition hover:text-mech-gold"
              aria-expanded={loginOpen}
              aria-haspopup="menu"
            >
              <LogIn className="h-4 w-4" /> Đăng nhập
            </button>
            {loginOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg bg-white text-navy shadow-2xl ring-1 ring-black/5">
                {LOGIN_OPTIONS.map((o, i) => (
                  <Link
                    key={o.href}
                    href={o.href}
                    role="menuitem"
                    className={`flex items-start gap-3 px-4 py-3 transition hover:bg-ice ${i ? "border-t border-slate-100" : ""}`}
                  >
                    <o.icon className={`mt-0.5 h-5 w-5 ${o.tone}`} />
                    <span>
                      <span className="block font-semibold">{o.title}</span>
                      <span className="block text-xs text-slate-500">{o.hint}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/register"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-mech-red px-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
          >
            Đăng ký <ArrowRight className="hidden h-4 w-4 sm:block" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md text-white lg:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-4 pb-5 lg:hidden">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-base font-semibold uppercase tracking-wide ${
                    active === l.href ? "text-mech-gold" : "text-white/90"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-2 border-t border-white/10 pt-4 sm:hidden">
            {LOGIN_OPTIONS.map((o) => (
              <Link
                key={o.href}
                href={o.href}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 text-white"
              >
                <o.icon className="h-5 w-5 text-mech-gold" />
                <span className="text-sm font-semibold">Đăng nhập · {o.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
