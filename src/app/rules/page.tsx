import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Box, Download } from "lucide-react";
import { PRIZES, ROBOT_SPECS, WORKSHOPS } from "@/lib/site";
import PortalShell from "@/components/register/PortalShell";

export const metadata: Metadata = {
  title: "Thể lệ · ENGINEEROBOTS 2026",
  description: "Thể lệ chính thức ENGINEEROBOTS 2026 – Hành trình Kỹ sư Cơ khí: quy chuẩn robot, sa bàn, 3 chặng thi, barem điểm, retry, xử phạt và khiếu nại.",
};

const card = "rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7";
const h2 = "font-display text-2xl uppercase tracking-wide text-navy";

const SCORING = [
  { stage: "Chặng 1 · Thích nghi", task: "Qua Checkpoint (cuối Đường Danh vọng)", pts: "+10", cond: "Toàn bộ xe đi qua vạch Checkpoint; robot được lưu vị trí Retry tại đó" },
  { stage: "Chặng 1 · Thích nghi", task: "Về đích (hết Đường Thách thức)", pts: "+20", cond: "≥ 2 bánh dẫn động cắt vạch chữ T 300 mm; thời gian là chỉ số phụ khi hòa" },
  { stage: "Chặng 2 · Tích lũy", task: "Cấu kiện Kiến thức 60 mm vào Trạm thành tựu", pts: "+15 / khối", cond: "Nằm hoàn toàn trên mặt sàn và trọn trong trạm của đội lúc hết giờ (3 khối = 45đ)" },
  { stage: "Chặng 2 · Tích lũy", task: "Cấu kiện Cơ hội vàng 80 mm vào Trạm thành tựu", pts: "+25", cond: "Chỉ Vòng Chung kết; phải có ≥ 2 khối Kiến thức trước; mở khóa Chặng 3" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Vượt Cầu Bản lĩnh", pts: "+10", cond: "Toàn bộ thân xe qua khỏi cầu" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Cứ điểm góc: Năng động, Sáng tạo, Hội nhập, Bền vững", pts: "+20 / điểm", cond: "Mặt màu đội ngửa lên, nghiêng < 45° lúc hết giờ" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Cứ điểm Vinh quang trên Bục Vinh quang", pts: "+50", cond: "Ngửa màu đội lúc hết giờ; chỉ được lật khi đã giữ ≥ 1 cứ điểm góc" },
  { stage: "Toàn trận", task: "CHIẾN THẮNG TUYỆT ĐỐI", pts: "Thắng ngay", cond: "Giữ Cứ điểm Vinh quang + ≥ 3/4 cứ điểm góc → trận kết thúc ngay lập tức" },
];

const PENALTIES = [
  { name: "Chặng 1: mất line (được Retry, tính 1 lần Retry)", pts: "−5 / lần" },
  { name: "Chặng 1: đâm vào rào chắn", pts: "−5 / lần" },
  { name: "Xuất phát sớm (dừng robot, đưa về vị trí ban đầu)", pts: "−5" },
  { name: "Chạm vào robot / sa bàn khi chưa được phép", pts: "−10 / lần" },
  { name: "Cố ý ngăn chặn đối phương ghi điểm (Chặng 2)", pts: "−10 / lần" },
  { name: "Robot ra khỏi khu vực Chặng 2 / Chặng 3", pts: "−10 / lần" },
  { name: "Chiếm giữ Cầu Bản lĩnh quá 15 giây (buộc lùi về)", pts: "−15" },
  { name: "Can thiệp Trạm thành tựu đối phương (phục hồi cấu kiện)", pts: "−20" },
];

const TIEBREAK = [
  "Đội giành Chiến thắng tuyệt đối.",
  "Tổng điểm cao hơn.",
  "Thời gian hoàn thành Chặng 1 nhanh hơn (theo đồng hồ Trọng tài).",
  "Nhiều điểm hơn ở Chặng 3.",
  "Có Cấu kiện Cơ hội vàng trong Trạm thành tựu.",
  "Gọi Retry ít hơn.",
  "Bốc thăm trước Ban Tổ chức.",
];

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-slate-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-ice text-xs uppercase text-navy-600">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default function RulesPage() {
  return (
    <PortalShell title="Thể lệ chính thức" subtitle="Số 26/TB-BTC-ENGINEEROBOTS · ngày 24/10/2026 · Chủ đề “Hành trình Kỹ sư Cơ khí”.">
      <div className="space-y-6">
        <nav aria-label="Mục lục" className={`${card} text-sm`}>
          <p className="font-bold text-navy">Mục lục</p>
          <ol className="mt-2 grid list-decimal gap-1 pl-5 text-navy-600 sm:grid-cols-2">
            {[["doi-tuong", "Đối tượng"], ["robot", "Quy chuẩn robot"], ["sa-ban", "Sa bàn"], ["the-thuc", "Thể thức"], ["chang", "Luật 3 chặng"], ["diem", "Barem điểm"], ["retry", "Retry"], ["phat", "Xử phạt"], ["ket-qua", "Kết quả & khiếu nại"], ["giai", "Giải thưởng & hỗ trợ"]].map(([id, l]) => (
              <li key={id}><a href={`#${id}`} className="hover:text-mech-red">{l}</a></li>
            ))}
          </ol>
        </nav>

        <section id="doi-tuong" className={card}>
          <h2 className={h2}>I. Đối tượng tham gia</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>Tân sinh viên khóa 2026 hệ chính quy, Trường ĐH Công nghệ Kỹ thuật TP.HCM (HCM-UTE).</li>
            <li>Tham gia theo đội, <b>tối đa 05 thành viên</b>; mỗi đội bắt buộc có 01 Đội trưởng để liên hệ, bốc thăm và ký biên bản.</li>
            <li>Mỗi sinh viên chỉ đăng ký trong đúng 01 đội.</li>
          </ul>
        </section>

        <section id="robot" className={card}>
          <h2 className={h2}>II. Quy chuẩn kỹ thuật robot</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ROBOT_SPECS.map((s) => (
              <div key={s.label} className="rounded-lg bg-ice p-3"><dt className="text-xs text-slate-500">{s.label}</dt><dd className="font-bold text-navy">{s.value}</dd></div>
            ))}
          </dl>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Kiểm định kỹ thuật trước <b>mỗi vòng đấu</b>. Kích thước xuất phát 300 (D) × 250 (R) × 200 (C) mm, dung sai +10 mm; từ Chặng 2 được bung cơ cấu.</li>
            <li>Pin DC (LiPo, Li-Ion, Ni-MH, 18650) tối đa 12,6 V. Cấm điện lưới AC hoặc điện áp &gt; 14,8 V.</li>
            <li>Chặng 1 tự hành 100%, chỉ bấm nút Start một lần. Sau khi hoàn thành Chặng 1 được điều khiển từ xa (RF, Bluetooth, Wifi, gamepad không dây…).</li>
            <li>Cấm vũ khí, vật sắc nhọn, cơ cấu phá hoại, chất lỏng, khói, lửa.</li>
            <li>Cấm thiết bị gây nhiễu sóng hoặc can thiệp tín hiệu đội khác — <b>truất quyền thi đấu</b>.</li>
            <li>Bề mặt cơ cấu gắp / lật phải bọc cao su, silicon hoặc vật liệu mềm.</li>
          </ul>
        </section>

        <section id="sa-ban" className={card}>
          <h2 className={h2}>III. Sa bàn 4,8 × 4,8 m</h2>
          <Image src="/images/sa-ban-2026.png" alt="Sơ đồ sa bàn ENGINEEROBOTS 2026 theo thể lệ, đánh số 1.1–3.8" width={1319} height={1866} className="mt-4 h-auto w-full rounded-lg ring-1 ring-slate-200" />
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/arena-3d" className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white"><Box className="h-4 w-4" /> Xem sa bàn 3D</Link>
            <a href="/models/ban-ve-sa-ban-2026.pdf" className="inline-flex h-10 items-center gap-2 rounded-md bg-ice px-4 font-bold text-navy"><Download className="h-4 w-4" /> Bản vẽ kỹ thuật (PDF)</a>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Sân bao quanh bởi dây giăng cảnh báo. Vạch dò line màu đen rộng 20 mm trên nền trắng.</li>
            <li><b>Chặng 1:</b> 2 làn biên 4800 × 900 mm (Đỏ trái, Xanh phải); Khu xuất phát 300 × 250 mm ở đỉnh làn; <i>Đường Danh vọng</i> thẳng 1800 mm kết thúc tại Checkpoint, tiếp nối <i>Đường Thách thức</i> ziczac góc 45°, về đích ở vạch chữ T 300 mm.</li>
            <li><b>Chặng 2:</b> khu 3000 × 1850 mm; 2 Trạm thành tựu 250 × 250 mm (họa tiết lưới) ở 2 góc đáy; 2 Ô Retry 300 × 250 mm (gạch chéo 45°) sát lối vào; 6 Cấu kiện Kiến thức lập phương 60 mm (3 Đỏ, 3 Xanh xếp xen kẽ); Bục Cơ hội đáy 400 × 400, đỉnh 300 × 300, cao 50 mm với Cấu kiện Cơ hội vàng 80 mm trên đỉnh.</li>
            <li><b>Chặng 3:</b> khu 3000 × 2400 mm; Cầu Bản lĩnh (3.8) bằng gỗ có dây treo, dài 400 × rộng 300 × cao 100 mm, nằm giữa ranh Chặng 2/Chặng 3 — lối duy nhất sang Chặng 3; 2 Ô Retry 300 × 250 mm sát biên ngoài; 4 cứ điểm góc 200 × 200 mm <i>Năng động, Sáng tạo, Hội nhập, Bền vững</i> (nửa trái Đỏ, nửa phải Xanh, trục kim loại); Bục Vinh quang đáy 700 × 700, đỉnh 600 × 600, cao 50 mm với Cứ điểm Vinh quang 200 × 200 mm.</li>
          </ul>
        </section>

        <section id="the-thuc" className={card}>
          <h2 className={h2}>IV. Thể thức thi đấu</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>Mỗi trận <b>03:00</b>; 01 phút chuẩn bị trước trận. Đồng hồ chạy liên tục, chỉ dừng khi Trọng tài chính ra lệnh dừng khẩn cấp (sa bàn hư hỏng, chập điện).</li>
            <li><b>Vòng loại:</b> xếp hạng theo thời gian hoàn thành Chặng 1 và đưa 2 Cấu kiện Kiến thức vào Trạm thành tựu. <b>16 đội</b> nhanh nhất vào Vòng Chung kết xếp hạng.</li>
            <li><b>Vòng Chung kết xếp hạng:</b> đối kháng 1 vs 1 loại trực tiếp; <b>trận Chung kết</b> thi đấu Best of 3.</li>
          </ul>
        </section>

        <section id="chang" className={card}>
          <h2 className={h2}>V. Luật từng chặng</h2>
          <h3 className="mt-4 font-bold text-team-red">Chặng 1 · Thích nghi (dò line tự động)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Robot nằm trọn trong khu xuất phát 300 × 250 mm. Khi có hiệu lệnh, 01 thành viên ấn nút khởi động một lần duy nhất.</li>
            <li>Qua Checkpoint cuối Đường Danh vọng (toàn bộ xe đi qua): <b>+10 điểm</b>, robot được lưu vị trí Retry tại Checkpoint.</li>
            <li>Về đích khi ≥ 2 bánh dẫn động cắt vạch chữ T cuối Đường Thách thức: <b>+20 điểm</b>. Thời gian hoàn thành là chỉ số phụ khi hòa.</li>
            <li>Mất line: <b>−5 điểm/lần</b>, đội được Retry (tính 1 lần). Đâm vào rào chắn: <b>−5 điểm/lần</b>.</li>
          </ul>
          <h3 className="mt-4 font-bold text-navy">Chặng 2 · Tích lũy (thu thập cấu kiện)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Hoàn thành Chặng 1 thì được điều khiển từ xa. Đội Đỏ lấy Cấu kiện Kiến thức Đỏ, đội Xanh lấy khối Xanh.</li>
            <li>Khối hợp lệ khi nằm hoàn toàn trên mặt sàn và trọn trong Trạm thành tựu của đội lúc hết giờ: <b>+15 điểm/khối</b>. Khối rơi ra ngoài không tính.</li>
            <li><b>Vòng Chung kết:</b> sau khi có ≥ 2 khối Kiến thức, đội được lấy Cấu kiện Cơ hội vàng trên Bục Cơ hội: <b>+25 điểm</b>, là chỉ số phụ khi hòa. Chỉ khi hoàn thành Cơ hội vàng mới được sang Chặng 3.</li>
            <li>Cố ý ngăn chặn đối phương ghi điểm: <b>−10 điểm/lần</b>. Ra khỏi khu vực Chặng 2: <b>−10 điểm/lần</b>.</li>
          </ul>
          <h3 className="mt-4 font-bold text-team-blue">Chặng 3 · Bản lĩnh (cứ điểm & Bục Vinh quang)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Vượt Cầu Bản lĩnh (toàn bộ thân xe): <b>+10 điểm</b>. Chiếm giữ cầu quá 15 giây: <b>−15 điểm</b> và buộc lùi về.</li>
            <li>Các cứ điểm bắt đầu ở trạng thái cân bằng. Lật mặt màu đội mình ngửa lên, nghiêng &lt; 45°: <b>+20 điểm/cứ điểm góc</b>. Được lật qua lại không giới hạn; điểm chốt lúc hết giờ.</li>
            <li>Cứ điểm Vinh quang chỉ được lật khi đội đã giữ ≥ 1 cứ điểm góc: <b>+50 điểm</b>.</li>
            <li><b>CHIẾN THẮNG TUYỆT ĐỐI:</b> giữ Cứ điểm Vinh quang + ≥ 3/4 cứ điểm góc → trận kết thúc ngay lập tức, thắng bất kể tỉ số.</li>
            <li>Ra khỏi khu vực Chặng 3: <b>−10 điểm/lần</b>.</li>
          </ul>
        </section>

        <section id="diem" className={card}>
          <h2 className={h2}>VI. Barem điểm</h2>
          <Table head={["Chặng", "Nhiệm vụ", "Điểm", "Điều kiện công nhận"]} rows={SCORING.map((s) => [s.stage, s.task, <b key="p" className="whitespace-nowrap text-navy">{s.pts}</b>, s.cond])} />
          <p className="mt-2 text-xs text-slate-500">Điểm tối đa không tính Chiến thắng tuyệt đối: 30 + 45 + 25 + 10 + 80 + 50 = 240 điểm.</p>
        </section>

        <section id="retry" className={card}>
          <h2 className={h2}>VII. Retry</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Tối đa <b>03 lần Retry</b> mỗi trận; chỉ người điều khiển chính hô “RETRY”. Đồng hồ vẫn chạy.</li>
            <li>Retry tại Ô Retry của chặng đang gặp sự cố hoặc lùi về chặng trước — <b>không nhảy cóc lên chặng sau</b>.</li>
            <li>Chặng 1: về khu xuất phát (hoặc Checkpoint nếu đã qua). Chặng 2: Ô Retry Chặng 2 sát lối vào. Chặng 3: Ô Retry Chặng 3 sát biên ngoài. Robot phải nằm trọn trong ô.</li>
            <li>Cấu kiện đang mang khi Retry được trả về vị trí ban đầu. Cứ điểm đã lật giữ nguyên hiện trạng.</li>
          </ul>
        </section>

        <section id="phat" className={card}>
          <h2 className={h2}>VIII. Lỗi & xử phạt</h2>
          <Table head={["Lỗi", "Phạt"]} rows={PENALTIES.map((p) => [p.name, <b key="p" className="whitespace-nowrap text-mech-red">{p.pts}</b>])} />
          <h3 className="mt-4 font-bold text-navy">Truất quyền thi đấu</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Cố ý phá hủy robot đối phương; làm hư hỏng nghiêm trọng sa bàn (gãy rào chắn, sập bục, rách sàn); sử dụng thiết bị cấm.</li>
            <li>Vi phạm hành vi: nhắc nhở <b>01 lần cảnh cáo</b>, tái phạm bị truất quyền. BTC có quyền truất quyền ngay với vi phạm nghiêm trọng.</li>
          </ul>
          <h3 className="mt-4 font-bold text-navy">Loại khỏi giải</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Lăng mạ, xúc phạm Trọng tài, BTC hoặc đội bạn; gian lận nhân sự (thuê người ngoài, khóa trên lái hộ); không chấp hành phán quyết, kích động bạo lực hoặc bỏ trận.</li>
          </ul>
        </section>

        <section id="ket-qua" className={card}>
          <h2 className={h2}>IX. Kết quả & khiếu nại</h2>
          <p className="mt-3 text-sm font-bold text-navy">Thứ tự xác định đội thắng</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">{TIEBREAK.map((t) => <li key={t}>{t}</li>)}</ol>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Khiếu nại <b>trong vòng 02 phút</b> sau khi công bố kết quả và trước khi ký biên bản; quá hạn bị bác. Gửi qua <Link href="/team/dashboard" className="font-semibold text-navy-600 underline">trang đội thi</Link>.</li>
            <li>Chỉ 01 đại diện được khiếu nại. Bằng chứng là camera sa bàn của BTC; video điện thoại chỉ để tham khảo. Gây áp lực tập thể → xử thua.</li>
            <li>Quyết định của Trưởng Ban Trọng tài và Trưởng BTC là chung cuộc.</li>
          </ul>
        </section>

        <section id="giai" className={card}>
          <h2 className={h2}>X. Giải thưởng & hỗ trợ</h2>
          <Table head={["Giải", "Tiền thưởng", "Kèm theo"]} rows={PRIZES.map((p) => [<b key="r" className="text-navy">{p.rank}</b>, p.reward, p.extra])} />
          <p className="mt-3 text-sm text-slate-700">100% thành viên thi đấu được cấp Giấy chứng nhận và đề xuất cộng điểm rèn luyện HK I năm học 2026–2027.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {WORKSHOPS.map((w) => <li key={w.title}><b>{w.title}:</b> {w.desc}</li>)}
            <li>Mỗi đội cử ít nhất 01 thành viên tham dự tập huấn.</li>
            <li><b>Chạy thử sa bàn:</b> trên sa bàn thật trước ngày thi — <Link href="/team/dashboard" className="font-semibold text-navy-600 underline">đặt slot</Link>.</li>
          </ul>
        </section>
      </div>
    </PortalShell>
  );
}
