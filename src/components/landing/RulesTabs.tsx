"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Cpu, Flag, Route } from "lucide-react";
import { ROBOT_SPECS } from "@/lib/site";

const TABS = [
  { id: "stage1", label: "Chặng 1 · Dò line", icon: Route },
  { id: "stage2", label: "Chặng 2 · Domination", icon: Flag },
  { id: "specs", label: "Quy chuẩn robot", icon: Cpu },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{k}</div>
      <div className="mt-1 font-display text-2xl text-navy">{v}</div>
    </div>
  );
}

export default function RulesTabs() {
  const [tab, setTab] = useState<TabId>("stage1");

  return (
    <section id="the-le" className="bg-ice pb-12 pt-20 md:pt-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="section-kicker">
          <span className="h-px w-8 bg-mech-red" /> Thể lệ thi đấu
        </p>
        <h2 className="section-title mt-3">Hai chặng – Một hành trình kỹ sư</h2>

        <div role="tablist" className="mt-10 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-controls="rules-panel"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 min-h-11 rounded-md px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                tab === t.id ? "bg-navy text-white shadow-lg" : "bg-white text-navy hover:bg-slate-100"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div id="rules-panel" role="tabpanel" className="mt-8 grid gap-10 lg:grid-cols-2">
          {tab === "stage1" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Thích nghi – Dò line tốc độ</h3>
              <p className="mt-4 text-slate-600">
                Sân 2400 × 650 mm chia đôi độc lập cho Đội Đỏ và Đội Xanh. Line đen rộng 25 mm trên nền trắng, phù
                hợp thanh cảm biến hồng ngoại 4–8 mắt (TCRT5000, QTR-8A) hoặc camera.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                <li>
                  <strong>Phần 1 – Cơ bản:</strong> đoạn thẳng tăng tốc, cua chuyển làn 180° (R = 162,5 mm), qua
                  vạch Check Point màu cam.
                </li>
                <li>
                  <strong>Phần 2 – Nâng cao:</strong> S-Curve ziczac 500 mm (biên độ ±70 mm) và ngã tư giao cắt
                  vuông góc.
                </li>
                <li>
                  <strong>Về đích:</strong> hai vạch đích tách xa nhau 440 mm, mở cổng tiến vào Chặng 2.
                </li>
              </ul>
            </div>
          )}

          {tab === "stage2" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Bản lĩnh – Chiếm lĩnh cứ điểm</h3>
              <p className="mt-4 text-slate-600">
                Sân chung 2400 × 1150 mm, hai đội đối kháng trực diện. Robot lật các cứ điểm sát mặt đất sang màu
                đội mình.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Fact k="Cứ điểm thường" v="8 × 10đ" />
                <Fact k="Lõi Vàng trung tâm" v="30đ" />
              </div>
              <div className="mt-4 rounded-lg border-l-4 border-mech-gold bg-white p-4 text-slate-700">
                <strong className="text-navy">Knock-out &ldquo;Bản lĩnh Kỹ sư&rdquo;:</strong> chiếm từ 6/9 cứ điểm
                (bắt buộc có Lõi Vàng) và giữ vững 15 giây liên tục là thắng ngay.
              </div>
            </div>
          )}

          {tab === "specs" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Quy chuẩn kỹ thuật robot</h3>
              <p className="mt-4 text-slate-600">
                Robot được kiểm định tại bàn kỹ thuật (quét QR đội) trước mỗi trận đấu.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {ROBOT_SPECS.map((s) => (
                  <Fact key={s.label} k={s.label} v={s.value} />
                ))}
              </div>
            </div>
          )}

          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <Image
              src="/images/map_option1_domination.png"
              alt="Sơ đồ sa bàn 2D: Chặng 1 dò line phía dưới, Chặng 2 ma trận 9 cứ điểm phía trên"
              width={3118}
              height={2380}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full rounded-md"
            />
            <figcaption className="mt-2 flex items-center justify-between px-1 text-xs text-slate-500">
              <span>Sơ đồ sa bàn 2400 × 1800 mm</span>
              <Link href="/rules" className="font-semibold text-navy-600 hover:underline">
                Thể lệ chi tiết →
              </Link>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
