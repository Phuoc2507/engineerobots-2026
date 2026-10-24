"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Boxes, Cpu, Crown, Route } from "lucide-react";
import { ROBOT_SPECS } from "@/lib/site";

const TABS = [
  { id: "stage1", label: "Chặng 1 · Thích nghi", icon: Route },
  { id: "stage2", label: "Chặng 2 · Tích lũy", icon: Boxes },
  { id: "stage3", label: "Chặng 3 · Bản lĩnh", icon: Crown },
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
        <h2 className="section-title mt-3">Ba chặng – 180 giây – Một hành trình kỹ sư</h2>

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
              <h3 className="font-display text-3xl uppercase text-navy">Thích nghi – Dò line tự hành</h3>
              <p className="mt-4 text-slate-600">
                Mỗi đội một làn line riêng rộng 90 cm dọc hai mép sa bàn. Robot xuất phát từ khu 30 × 25 cm, bám line đen
                rộng 20 mm qua Đường Danh vọng thẳng 180 cm tới Checkpoint, rồi vượt Đường Thách thức ziczac 45° về vạch chữ T.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                <li><strong>Tự hành 100%:</strong> chỉ ấn nút khởi động một lần, không được điều khiển.</li>
                <li><strong>Mất line / đâm rào chắn:</strong> −5đ mỗi lần. Xuất phát sớm: −5đ.</li>
                <li><strong>Thời gian về đích</strong> được ghi lại để xét phụ khi hòa điểm.</li>
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Fact k="Checkpoint" v="+10đ" />
                <Fact k="Về đích" v="+20đ" />
              </div>
            </div>
          )}

          {tab === "stage2" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Tích lũy – Cấu kiện tri thức</h3>
              <p className="mt-4 text-slate-600">
                Được điều khiển từ xa. Robot đưa 3 Cấu kiện Kiến thức 6 cm màu đội mình về Trạm thành tựu 25 × 25 cm; khối
                tính khi nằm trọn trong trạm lúc hết giờ. Ở Vòng Chung kết, có ≥ 2 khối mới được lấy Cấu kiện Cơ hội vàng
                8 cm trên Bục Cơ hội, và phải xong Cơ hội vàng mới sang Chặng 3.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Fact k="Kiến thức" v="+15đ × 3" />
                <Fact k="Cơ hội vàng" v="+25đ" />
              </div>
              <div className="mt-4 rounded-lg border-l-4 border-mech-red bg-white p-4 text-sm text-slate-700">
                Cố ý ngăn đối phương ghi điểm: <b>−10đ</b>/lần. Can thiệp Trạm thành tựu đối thủ: <b>−20đ</b>.
              </div>
            </div>
          )}

          {tab === "stage3" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Bản lĩnh – Chiếm cứ điểm</h3>
              <p className="mt-4 text-slate-600">
                Vượt Cầu Bản lĩnh (+10đ), robot lật 4 cứ điểm Năng động, Sáng tạo, Hội nhập, Bền vững và Cứ điểm Vinh quang
                trên bục trung tâm sang màu đội mình. Điểm chốt lúc hết giờ (nghiêng dưới 45°).
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Fact k="Cứ điểm góc" v="4 × 20đ" />
                <Fact k="Cứ điểm Vinh quang" v="+50đ" />
              </div>
              <div className="mt-4 rounded-lg border-l-4 border-mech-gold bg-white p-4 text-slate-700">
                <strong className="text-navy">CHIẾN THẮNG TUYỆT ĐỐI:</strong> giữ Cứ điểm Vinh quang và ít nhất 3/4 cứ điểm
                góc là trận kết thúc ngay.
              </div>
            </div>
          )}

          {tab === "specs" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Quy chuẩn kỹ thuật robot</h3>
              <p className="mt-4 text-slate-600">
                Robot được kiểm định tại bàn kỹ thuật (quét QR đội) trước mỗi trận. Cấm vũ khí, thiết bị gây nhiễu,
                chất lỏng; cơ cấu gắp phải có đệm mềm.
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
              src="/images/sa-ban-2026.png"
              alt="Sơ đồ sa bàn 4800 × 4800 mm: hai làn dò line hai bên, Chặng 2 cấu kiện và Bục Cơ hội phía dưới, Chặng 3 Cầu Bản lĩnh, cứ điểm và Bục Vinh quang phía trên"
              width={1319}
              height={1866}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full rounded-md"
            />
            <figcaption className="mt-2 flex items-center justify-between px-1 text-xs text-slate-500">
              <span>Sơ đồ sa bàn 4800 × 4800 mm</span>
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
