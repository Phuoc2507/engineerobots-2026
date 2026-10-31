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
        <h2 className="section-title mt-3">Ba chặng – 180 / 300 giây – Một hành trình kỹ sư</h2>

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
                Mỗi đội một làn line riêng rộng 900 mm dọc hai mép sa bàn. Robot xuất phát từ Trạm khởi hành 410 × 360 mm, bám line đen
                rộng 20 mm qua Đường Danh vọng thẳng 1800 mm tới Checkpoint, rồi vượt Đường Thách thức ziczac 45° dài 1940 mm về vạch chữ T.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                <li><strong>Tự hành 100%:</strong> chỉ ấn nút khởi động một lần, tay cầm đặt xuống đất suốt Chặng 1; về đích xong robot tự chuyển sang điều khiển từ xa.</li>
                <li><strong>Mất line / chạm rào chắn:</strong> −5đ mỗi lần. Xuất phát sớm: −5đ.</li>
                <li><strong>Retry:</strong> chưa qua Checkpoint thì về Trạm khởi hành; đã qua Checkpoint thì đặt lại tại Checkpoint.</li>
                <li><strong>Giới hạn 60 giây (TIMEOUT):</strong> chưa về đích thì 01 thành viên nhấc robot đưa tới khu vực đích Chặng 1 để thi Chặng 2 (mất +20 về đích, giữ +10 Checkpoint nếu đã qua).</li>
                <li><strong>Thời gian về đích</strong> được ghi lại để xét phụ khi hòa điểm (đội TIMEOUT không được xét tiêu chí này).</li>
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Fact k="Checkpoint" v="+10đ" />
                <Fact k="Về đích" v="+20đ" />
              </div>
            </div>
          )}

          {tab === "stage2" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Tích lũy – Tranh chấp cấu kiện</h3>
              <p className="mt-4 text-slate-600">
                Được điều khiển từ xa. Mỗi đội có 2 Cấu kiện Kiến thức là bóng pickleball Ø74 mm màu đội mình; robot dùng cơ cấu tự chọn
                (càng đẩy, con lăn, tay gắp…) đưa bóng vượt gờ vào Trạm thành tựu 300 × 300 mm. Bóng ngoài trạm được tranh chấp;
                bóng nằm trọn trong trạm là bất khả xâm phạm. Chỉ ở Vòng Chung kết xếp hạng, sau khi đủ 2 Kiến thức, đội mới được đưa
                bóng Cơ hội vàng trên Bục Cơ hội về trạm. Cần ≥ 2 Kiến thức trong trạm để sang Chặng 3.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Fact k="Kiến thức" v="+15đ / bóng" />
                <Fact k="Cơ hội vàng" v="+30đ" />
              </div>
              <div className="mt-4 rounded-lg border-l-4 border-mech-red bg-white p-4 text-sm text-slate-700">
                Đâm húc phá hoại hoặc ép khóa cứng robot đối phương vào vách sân quá 5 giây khi không tranh chấp cấu kiện: <b>−10đ</b>/lần. Ra khỏi khu vực Chặng 2: <b>−10đ</b> (đi qua Cầu khi đã đủ điều kiện lên Chặng 3 không tính). Cố ý húc văng bóng Kiến thức của đối phương ra ngoài sân: <b>−10đ</b>/lần (đặt lại bóng); tự làm văng bóng đội mình: <b>−5đ</b>/lần (đặt lại bóng). Tác động bóng trong trạm đối thủ: <b>−20đ</b>/lần. Cố ý thu thập bóng vàng khi chưa đủ 2 Kiến thức: <b>−10đ</b>/lần. Được chặn đường, nhưng cầm/giữ bóng Kiến thức của đối phương: <b>−10đ</b>/lần. Vòng loại sang nửa sân đối phương: <b>−15đ</b> và Retry.
              </div>
            </div>
          )}

          {tab === "stage3" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Bản lĩnh – Bảo vệ Đồ án</h3>
              <p className="mt-4 text-slate-600">
                Qua Cầu Bản lĩnh, mỗi đội thi trên nửa sân riêng: vượt Đường Thử thách 5 thanh gờ ống PVC cao 15 mm, đưa bóng Đồ án Ø74 mm từ Trạm
                Thực nghiệm lên Dốc Kiên trì (10°), đặt vững trên đế nhỏ trong Ô Bảo vệ 120 × 120 mm trên Đài cao 100 mm, rồi leo Dốc
                Thăng hoa lên Bục Vinh Quang 200 mm nhấn nút Đèn trên vách ngăn (đội nhấn trước +40đ, nhấn sau +25đ). Chạm vạch giới hạn Đường Thử thách hoặc làm rơi Đồ án: −5đ/lần; ra khỏi khu vực: −10đ;
                lấn sang sân đối phương: −15đ và Retry.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Fact k="Cầu Bản lĩnh" v="+10đ" />
                <Fact k="Đường Thử thách" v="+20đ" />
                <Fact k="Bảo vệ Đồ án" v="+25đ" />
                <Fact k="Đèn Vinh Quang" v="+40đ / +25đ" />
              </div>
              <div className="mt-4 rounded-lg border-l-4 border-mech-gold bg-white p-4 text-slate-700">
                <strong className="text-navy">CHIẾN THẮNG TUYỆT ĐỐI (Chung kết):</strong> hoàn thành đúng trình tự 2 Kiến thức + Cơ
                hội vàng → Cầu → Đường Thử thách → Đồ án trên đế → Dốc Thăng hoa → nhấn sáng Đèn Vinh Quang thì thắng ngay, trận kết thúc.
                Nhấn đèn khi chưa đủ trình tự không tạo ra Chiến thắng tuyệt đối.
              </div>
            </div>
          )}

          {tab === "specs" && (
            <div>
              <h3 className="font-display text-3xl uppercase text-navy">Quy chuẩn kỹ thuật robot</h3>
              <p className="mt-4 text-slate-600">
                Robot được kiểm định tại bàn kỹ thuật (quét QR đội) trước mỗi trận, không tính vào thời gian chuẩn bị (Bo3 chỉ kiểm định ván đầu); không đạt là thua trận, không có thời gian sửa. Được dùng robot dự phòng nếu robot đó cũng đạt kiểm định. Cấm vũ khí, thiết bị gây nhiễu,
                chất lỏng. Cơ cấu thu thập tự do (càng đẩy, con lăn, tay gắp, ngàm kẹp…); bề mặt tiếp xúc bóng và nút đèn phải mềm.
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
              alt="Sơ đồ sa bàn 4800 × 4800 mm: hai làn dò line hai bên, Chặng 2 cấu kiện và Bục Cơ hội phía dưới, Chặng 3 Cầu Bản lĩnh, Địa hình và Bục Vinh Quang phía trên"
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
