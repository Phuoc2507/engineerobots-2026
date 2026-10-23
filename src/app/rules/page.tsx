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
  { stage: "Chặng 1 · Thích nghi", task: "Dò line tự động hết quãng đường", pts: "+20", cond: "≥ 2 bánh dẫn động cắt vạch chữ T và thoát qua cổng 55 cm" },
  { stage: "Chặng 2 · Tích lũy", task: "Khối cấu kiện 6 cm về Ô tập kết", pts: "+15 / khối", cond: "≥ 50% đáy nằm trong ô 25 × 25 cm lúc hết giờ (tối đa 3 khối = 45đ)" },
  { stage: "Chặng 2 · Tích lũy", task: "Khối Vàng 8 cm về Ô tập kết", pts: "+40", cond: "Nằm hợp lệ trong ô tập kết; được ưu tiên khi xét hòa" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Vượt cửa thông lên Chặng 3", pts: "+10", cond: "Toàn bộ thân xe qua vạch nét đứt cyan" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Lật Cứ điểm góc (4 vị trí)", pts: "+20 / điểm", cond: "Mặt màu đội ngửa lên, nghiêng < 45° tại 03:00" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Lật Cứ điểm Tối cao trên Master Tower", pts: "+50", cond: "Ngửa màu đội mình tại 03:00" },
  { stage: "Toàn trận", task: "CHIẾN THẮNG TUYỆT ĐỐI (Knock-out)", pts: "Thắng ngay", cond: "Master Point + ≥ 3/4 Cứ điểm góc, giữ liên tục 10 giây" },
];

const PENALTIES = [
  { name: "Chạm tay vào sa bàn / robot khi chưa được Retry", pts: "−10 / lần" },
  { name: "Xuất phát sớm (lần 1 cảnh cáo, trả về vị trí ban đầu; từ lần 2)", pts: "−10" },
  { name: "Kẹp từ 2 khối trở lên cùng lúc (hủy các khối đang kẹp)", pts: "−10" },
  { name: "Chiếm giữ cửa thông quá 15 giây để chặn đối phương", pts: "−15" },
  { name: "Xâm phạm Ô tập kết đối phương (phục hồi nguyên trạng)", pts: "−20" },
  { name: "Húc đổ / trèo qua tường ngăn kiên cố 210 cm (dừng trận)", pts: "−30" },
];

const TIEBREAK = [
  "Đội giành chiến thắng tuyệt đối (Knock-out).",
  "Tổng điểm thi đấu cao hơn (cộng các chặng, trừ điểm phạt).",
  "Thời gian hoàn thành Chặng 1 nhanh hơn (cảm biến của BTC).",
  "Chiếm được nhiều cứ điểm hơn ở Chặng 3.",
  "Lấy được Khối Vàng về ô tập kết.",
  "Gọi Retry ít hơn.",
  "Bốc thăm may mắn (Coin Toss) trước Ban Giám sát.",
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
            <li>Tân sinh viên khóa 2026 hệ chính quy, Khoa Cơ khí, HCM-UTE.</li>
            <li>Tham gia theo đội, <b>tối đa 05 thành viên</b>; mỗi đội cử 01 Đội trưởng để liên hệ, bốc thăm và ký biên bản.</li>
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
            <li>Chặng 1 tự hành 100%, chỉ bấm nút Start một lần. Từ Chặng 2 được dùng tay cầm 2,4 GHz (RF, Bluetooth, Wifi, gamepad) hoặc tiếp tục tự hành.</li>
            <li>Cấm vũ khí, vật sắc nhọn, mũi khoan, lưỡi cắt, keo dính sàn, nam châm điện mạnh, chất lỏng, khói, lửa, chất ăn mòn.</li>
            <li>Cấm thiết bị gây nhiễu sóng — <b>truất quyền và hủy toàn bộ kết quả mùa giải</b>.</li>
            <li>Bề mặt cơ cấu gắp / lật phải bọc cao su, silicon hoặc vật liệu mềm.</li>
          </ul>
        </section>

        <section id="sa-ban" className={card}>
          <h2 className={h2}>III. Sa bàn 4,8 × 4,8 m</h2>
          <Image src="/images/sa-ban-2026.png" alt="Bản vẽ mặt bằng sa bàn ENGINEEROBOTS 2026" width={3270} height={3163} className="mt-4 h-auto w-full rounded-lg ring-1 ring-slate-200" />
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/arena-3d" className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white"><Box className="h-4 w-4" /> Xem sa bàn 3D</Link>
            <a href="/models/ban-ve-sa-ban-2026.pdf" className="inline-flex h-10 items-center gap-2 rounded-md bg-ice px-4 font-bold text-navy"><Download className="h-4 w-4" /> Bản vẽ kỹ thuật (PDF)</a>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Khung bảo vệ cao 100 mm bao quanh sân.</li>
            <li><b>Chặng 1:</b> 2 làn biên 4800 × 900 mm (Đỏ trái, Xanh phải); ô xuất phát ở đỉnh làn; vạch đen trên nền trắng gồm đoạn thẳng 1800 mm và đoạn ziczac, kết thúc bằng vạch chữ T 300 mm; cổng thoát 550 mm ở chân vách ngăn.</li>
            <li><b>Chặng 2:</b> khu 3000 × 1850 mm; 2 Ô tập kết 250 × 250 mm (họa tiết lưới); 2 Ô Retry (gạch chéo 45°); 6 khối lập phương 60 mm (3 Đỏ, 3 Xanh xếp sole); bục dốc đáy 400 × 400, đỉnh 300 × 300, cao 80 mm với Khối Vàng 80 mm trên đỉnh.</li>
            <li><b>Chặng 3:</b> khu 3000 × 2400 mm; tường ngăn kiên cố ở giữa, 2 cửa thông nét đứt cyan hai bên; 2 Ô Retry sát vách biên; 4 Cứ điểm góc 200 × 200 mm (cánh lật nửa Đỏ / nửa Xanh, trục vàng); Master Tower đáy 700 × 700, đỉnh 600 × 600 mm với Cứ điểm Tối cao 200 × 200 mm.</li>
          </ul>
        </section>

        <section id="the-thuc" className={card}>
          <h2 className={h2}>IV. Thể thức thi đấu</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>Mỗi trận <b>03:00</b>; 01 phút chuẩn bị trước trận. Đồng hồ chạy liên tục, chỉ dừng khi Trọng tài chính ra lệnh dừng khẩn cấp (sa bàn hư hỏng, chập điện).</li>
            <li><b>Vòng bảng:</b> bảng 3–4 đội, vòng tròn một lượt (Thắng 3 · Hòa 1 · Thua 0); Nhất, Nhì mỗi bảng đi tiếp.</li>
            <li><b>Tứ kết, Bán kết:</b> đối kháng 1 vs 1 loại trực tiếp. <b>Chung kết:</b> Best of 3.</li>
          </ul>
        </section>

        <section id="chang" className={card}>
          <h2 className={h2}>V. Luật từng chặng</h2>
          <h3 className="mt-4 font-bold text-team-red">Chặng 1 · Thích nghi (dò line tự động)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Robot nằm trọn trong ô xuất phát 30 × 30 cm. Khi còi “BẮT ĐẦU”, 01 thành viên bấm nút rồi lùi về khu kỹ thuật.</li>
            <li>Hoàn thành khi ≥ 2 bánh dẫn động cắt vạch chữ T và thoát qua cổng 55 cm: <b>+20 điểm</b>. Thời gian hoàn thành là chỉ số phụ khi hòa.</li>
            <li>Mất line (cả 4 bánh văng khỏi line quá 05 giây) hoặc đâm vách không tự phục hồi → mất quyền tự hành; đội có thể Retry về ô xuất phát.</li>
          </ul>
          <h3 className="mt-4 font-bold text-navy">Chặng 2 · Tích lũy (thu thập cấu kiện)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Qua cổng thoát Chặng 1 và vào cổng đáy sân thì được cầm tay điều khiển.</li>
            <li>Đội Đỏ gắp khối Đỏ, đội Xanh gắp khối Xanh. <b>Mỗi lần chỉ kẹp tối đa 01 khối</b> (hoặc 01 Khối Vàng).</li>
            <li>Khối hợp lệ khi ≥ 50% đáy nằm trong Ô tập kết của đội lúc hết giờ: <b>+15 điểm/khối</b>. Khối rơi ra ngoài không tính.</li>
            <li>Khối Vàng trên đỉnh bục dốc cao 8 cm, trung lập: <b>+40 điểm</b> và được ưu tiên khi xét hòa.</li>
          </ul>
          <h3 className="mt-4 font-bold text-team-blue">Chặng 3 · Bản lĩnh (cứ điểm & Master Tower)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Chỉ lên Chặng 3 qua 01 trong 02 cửa thông cyan; vượt cửa: <b>+10 điểm</b>. Kẹt tại cửa quá 10 giây được yêu cầu Retry.</li>
            <li>4 Cứ điểm góc: lật mặt màu đội mình ngửa lên, nghiêng &lt; 45°: <b>+20 điểm/điểm</b>. Được lật qua lại không giới hạn; điểm chốt tại 03:00.</li>
            <li>Leo Master Tower, lật Cứ điểm Tối cao thành màu đội mình: <b>+50 điểm</b> nếu giữ được khi hết giờ.</li>
            <li><b>KNOCK-OUT:</b> giữ Cứ điểm Tối cao + ≥ 3/4 Cứ điểm góc liên tục 10 giây → trận kết thúc ngay, thắng tuyệt đối bất kể tỉ số.</li>
          </ul>
        </section>

        <section id="diem" className={card}>
          <h2 className={h2}>VI. Barem điểm</h2>
          <Table head={["Chặng", "Nhiệm vụ", "Điểm", "Điều kiện công nhận"]} rows={SCORING.map((s) => [s.stage, s.task, <b key="p" className="whitespace-nowrap text-navy">{s.pts}</b>, s.cond])} />
          <p className="mt-2 text-xs text-slate-500">Điểm tối đa không tính Knock-out: 20 + 45 + 40 + 10 + 80 + 50 = 245 điểm.</p>
        </section>

        <section id="retry" className={card}>
          <h2 className={h2}>VII. Retry</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Tối đa <b>03 lần Retry</b> mỗi trận; chỉ Đội trưởng / người điều khiển chính hô “RETRY [TÊN ĐỘI]”. Đồng hồ vẫn chạy.</li>
            <li>Retry tại Ô Retry của chặng đang gặp sự cố hoặc lùi về chặng trước — <b>không nhảy cóc lên chặng sau</b>.</li>
            <li>Chặng 1: về ô xuất phát, xóa kết quả Chặng 1, chạy lại tự hành. Chặng 2: Ô Retry Chặng 2 sát cổng đáy sân. Chặng 3: Ô Retry Chặng 3 sát vách biên.</li>
            <li>Khối đang kẹp khi Retry bị thu hồi về vị trí xuất phát cấu kiện. Cứ điểm đã lật giữ nguyên hiện trạng.</li>
          </ul>
        </section>

        <section id="phat" className={card}>
          <h2 className={h2}>VIII. Lỗi & xử phạt</h2>
          <Table head={["Lỗi", "Phạt"]} rows={PENALTIES.map((p) => [p.name, <b key="p" className="whitespace-nowrap text-mech-red">{p.pts}</b>])} />
          <h3 className="mt-4 font-bold text-navy">Xử thua trận hiện tại</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Cố ý đâm húc phá hủy robot đối phương; làm hư hỏng nặng sa bàn (đổ tường 210 cm, sập tháp, rách sàn).</li>
            <li>Sử dụng thiết bị cấm; nhận <b>03 cảnh cáo</b> hành vi trong cùng một trận.</li>
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
            <li>Khiếu nại <b>trong vòng 03 phút</b> sau còi kết thúc và trước khi ký biên bản; quá hạn bị bác. Gửi qua <Link href="/team/dashboard" className="font-semibold text-navy-600 underline">trang đội thi</Link>.</li>
            <li>Chỉ Đội trưởng được phát ngôn và nộp khiếu nại. Bằng chứng là camera kỹ thuật của BTC; video điện thoại chỉ để tham khảo.</li>
            <li>Quyết định của Trưởng Ban Trọng tài và Trưởng BTC là chung cuộc.</li>
          </ul>
        </section>

        <section id="giai" className={card}>
          <h2 className={h2}>X. Giải thưởng & hỗ trợ</h2>
          <Table head={["Giải", "Tiền thưởng", "Kèm theo"]} rows={PRIZES.map((p) => [<b key="r" className="text-navy">{p.rank}</b>, p.reward, p.extra])} />
          <p className="mt-3 text-sm text-slate-700">100% thành viên thi đấu được cấp Giấy chứng nhận và đề xuất cộng điểm rèn luyện HK I năm học 2026–2027.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {WORKSHOPS.map((w) => <li key={w.title}><b>{w.title}:</b> {w.desc}</li>)}
            <li><b>Open Field Test:</b> chạy thử trên sa bàn thật tại Maker Space trước ngày thi 02 tuần — <Link href="/team/dashboard" className="font-semibold text-navy-600 underline">đặt slot</Link>.</li>
          </ul>
        </section>
      </div>
    </PortalShell>
  );
}
