"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

// Thanh CTA dính đáy màn hình trên mobile: hiện sau khi lướt qua Hero, ẩn khi tới section Đăng ký
export default function MobileCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const cta = document.getElementById("dang-ky");
      const nearCta = cta ? cta.getBoundingClientRect().top < window.innerHeight : false;
      setShow(window.scrollY > window.innerHeight * 0.8 && !nearCta);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy/95 p-3 backdrop-blur transition-transform sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <Link href="/register" tabIndex={show ? 0 : -1} className="btn-primary w-full">
        Đăng ký đội thi <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
