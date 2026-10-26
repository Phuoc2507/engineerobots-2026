import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Box, Download } from "lucide-react";
import { PRIZES, ROBOT_SPECS, WORKSHOPS } from "@/lib/site";
import PortalShell from "@/components/register/PortalShell";

export const metadata: Metadata = {
  title: "Thể lệ · ENGINEERING PATH 2026",
  description: "Thể lệ chính thức cuộc thi ENGINEERING PATH 2026 – Hành trình Kỹ sư Cơ khí: quy chuẩn robot, sa bàn, 3 chặng thi, barem điểm, retry, xử phạt và khiếu nại.",
};

const card = "rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7";
const h2 = "font-display text-2xl uppercase tracking-wide text-navy";

const SCORING = [
  { stage: "Chặng 1 · Thích nghi", task: "Qua Checkpoint (cuối Đường Danh vọng)", pts: "+10", cond: "Toàn bộ xe đi qua vạch Checkpoint; robot được lưu vị trí Retry tại đó" },
  { stage: "Chặng 1 · Thích nghi", task: "Về đích (hết Đường Thách thức)", pts: "+20", cond: "≥ 2 bánh xe cắt vạch chữ T 300 mm; thời gian là chỉ số phụ khi hòa" },
  { stage: "Chặng 2 · Tích lũy", task: "Cấu kiện Kiến thức 60 mm vào Trạm thành tựu (màu đội mình, hoặc màu đối phương khi tích lũy liên ngành)", pts: "+15 / khối", cond: "Nằm hoàn toàn trên mặt sàn và trọn trong Trạm thành tựu 300 × 300 mm" },
  { stage: "Chặng 2 · Tích lũy", task: "Tranh chấp Cấu kiện Cơ hội vàng 80 mm về Trạm thành tựu", pts: "+25", cond: "Chỉ Vòng Chung kết; tính là 1 cấu kiện để mở khóa Chặng 3; chỉ số phụ khi hòa" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Vượt Cầu Bản lĩnh (3.8)", pts: "+10", cond: "Toàn bộ thân xe qua cầu, khi đã có ≥ 2 cấu kiện hợp lệ ở Chặng 2" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Vượt Địa hình Thử thách (3.3 / 3.4)", pts: "+20", cond: "Toàn bộ thân xe và 4 bánh vượt qua thanh gờ thứ 5, không đi vòng ra ngoài" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Leo Dốc Kiên trì, đưa Khối Đồ án vào Ô Bảo vệ Đồ án", pts: "+25", cond: "Khối 70 mm từ Trạm Thực nghiệm lên Đài Bảo vệ (cao 250 mm), nằm trọn trong ô 150 × 150 mm" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Leo Dốc Thăng hoa lên Đỉnh Bục Vinh Quang, nhấn sáng Đèn Vinh Quang", pts: "+40", cond: "Khối Đồ án đã nằm hợp lệ trong Ô Bảo vệ; robot lên đỉnh 500 mm và nhấn nút làm đèn sáng" },
  { stage: "Toàn trận", task: "CHIẾN THẮNG TUYỆT ĐỐI (Tốt nghiệp Xuất sắc)", pts: "Thắng ngay", cond: "Hoàn thành đủ lộ trình và nhấn sáng Đèn Vinh Quang trước đối phương → trận kết thúc ngay" },
];

const PENALTIES = [
  { name: "Chặng 1: mất line (được Retry, tính 1 lần Retry)", pts: "−5 / lần" },
  { name: "Chặng 1: chạm / đâm vào rào chắn", pts: "−5 / lần" },
  { name: "Xuất phát sớm (dừng robot, đưa về vị trí ban đầu)", pts: "−5" },
  { name: "Chạm tay vào robot khi chưa được Trọng tài cho Retry", pts: "−10 / lần" },
  { name: "Chặng 2: đâm húc phá hoại / kẹp khóa chết robot đối phương quá 5 giây khi không tranh chấp cấu kiện", pts: "−10 / lần" },
  { name: "Robot ra khỏi khu vực Chặng 2 / Chặng 3", pts: "−10 / lần" },
  { name: "Chặng 3: lấn sang phần sân đối phương (buộc Retry về ô 3.1 / 3.2)", pts: "−15 / lần" },
  { name: "Chiếm giữ Cầu Bản lĩnh quá 15 giây (Trọng tài cưỡng chế lùi xe)", pts: "−15" },
  { name: "Tác động cấu kiện trong Trạm thành tựu đối phương (phục hồi nguyên trạng)", pts: "−20" },
  { name: "Cấu kiện văng ra ngoài biên Chặng 2", pts: "Vô hiệu" },
];

const TIEBREAK = [
  "Đội giành Chiến thắng tuyệt đối.",
  "Tổng điểm cao hơn (cộng các chặng, trừ điểm phạt).",
  "Thời gian hoàn thành Chặng 1 nhanh hơn (theo đồng hồ Tổ trọng tài).",
  "Tiến độ Chặng 3 cao hơn: đã đưa Khối Đồ án vào Ô Bảo vệ, rồi đến đã vượt Địa hình Thử thách.",
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
    <PortalShell title="Thể lệ chính thức" subtitle="Cuộc thi “ENGINEERING PATH 2026” · BCH Đoàn – Hội Khoa Cơ khí · tháng 10/2026 · Chủ đề “Hành trình Kỹ sư Cơ khí”.">
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
            <li>Cấm vũ khí, vật sắc nhọn, mũi khoan, lưỡi cắt kim loại, chất lỏng, khói, lửa; cấm keo dính sàn, nam châm điện cường độ lớn.</li>
            <li>Cấm thiết bị gây nhiễu sóng hoặc can thiệp tín hiệu đội khác — <b>truất quyền thi đấu</b>.</li>
            <li>Bề mặt cơ cấu đẩy, kẹp, gắp cấu kiện và nhấn nút Đèn Vinh Quang phải bọc cao su, silicon hoặc vật liệu mềm.</li>
          </ul>
        </section>

        <section id="sa-ban" className={card}>
          <h2 className={h2}>III. Sa bàn 4,8 × 4,8 m</h2>
          <Image src="/images/sa-ban-2026.png" alt="Sơ đồ sa bàn ENGINEERING PATH 2026 theo thể lệ, đánh số 1.1–3.8" width={1319} height={1866} className="mt-4 h-auto w-full rounded-lg ring-1 ring-slate-200" />
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/arena-3d" className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white"><Box className="h-4 w-4" /> Xem sa bàn 3D</Link>
            <a href="/models/ban-ve-sa-ban-2026.pdf" className="inline-flex h-10 items-center gap-2 rounded-md bg-ice px-4 font-bold text-navy"><Download className="h-4 w-4" /> Bản vẽ kỹ thuật (PDF)</a>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Sân bao quanh bởi dây giăng cảnh báo. Vạch dò line màu đen rộng 20 mm trên nền trắng.</li>
            <li><b>Chặng 1:</b> 2 làn biên 4800 × 900 mm (Đỏ trái, Xanh phải); Khu xuất phát 300 × 250 mm ở đỉnh làn; <i>Đường Danh vọng</i> thẳng 1800 mm kết thúc tại Checkpoint, tiếp nối <i>Đường Thách thức</i> ziczac góc 45° dài 2150 mm, về đích ở vạch chữ T 300 mm (cách vách đáy 550 mm).</li>
            <li><b>Chặng 2:</b> khu 3000 × 1850 mm; 2 Ô Retry 300 × 250 mm (gạch chéo 45°) sát lối vào; 2 Trạm thành tựu 300 × 300 mm (họa tiết lưới) đặt ở khoảng sân thoáng hai cánh, robot chạy vòng được cả 4 phía; 6 Cấu kiện Kiến thức lập phương 60 mm (3 Đỏ, 3 Xanh xếp xen kẽ dọc đường trung tâm); Bục Cơ hội ở tâm, đáy 400 × 400, đỉnh 300 × 300, cao 50 mm với Cấu kiện Cơ hội vàng 80 mm trên đỉnh.</li>
            <li><b>Cầu Bản lĩnh (3.8):</b> cầu gỗ có dây treo nối Chặng 2 sang Chặng 3, dài 600 × rộng 550 × cao 100 mm.</li>
            <li><b>Chặng 3:</b> khu 3000 × 2400 mm, chia 2 sân độc lập đối xứng (Đỏ trái, Xanh phải) bằng vạch trung tâm; 2 Ô Retry 300 × 250 mm sát biên ngoài; <i>Địa hình Thử thách</i> 400 × 600 mm gồm 5 thanh gờ cao 15 mm; <i>Trạm Thực nghiệm</i> 250 × 250 mm với Khối Đồ án lập phương 70 mm; <i>Tổ hợp Bục Vinh Quang</i> hình chữ L: Dốc Kiên trì (dài 400, rộng 450 mm) lên Đài Bảo vệ cao 250 mm (500 × 550 mm, có Ô Bảo vệ Đồ án 150 × 150 mm), rồi Dốc Thăng hoa (dài 350, rộng 500 mm) vuông góc lên Đỉnh Bục Vinh Quang cao 500 mm (700 × 550 mm, vách ngăn đôi, mỗi đội 350 × 550 mm) có nút nhấn tích hợp Đèn Vinh Quang.</li>
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
            <li>Về đích khi ≥ 2 bánh xe cắt vạch chữ T cuối Đường Thách thức: <b>+20 điểm</b>. Thời gian hoàn thành là chỉ số phụ khi hòa.</li>
            <li>Mất line: <b>−5 điểm/lần</b>, đội được Retry (tính 1 lần). Chạm / đâm vào rào chắn: <b>−5 điểm/lần</b>.</li>
          </ul>
          <h3 className="mt-4 font-bold text-navy">Chặng 2 · Tích lũy (thu thập & tranh chấp cấu kiện)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Hoàn thành Chặng 1 thì được điều khiển từ xa; đội về đích Chặng 1 sớm hơn được vào Chặng 2 sớm hơn.</li>
            <li>Đội Đỏ thu khối Đỏ, đội Xanh thu khối Xanh về Trạm thành tựu: <b>+15 điểm/khối</b>.</li>
            <li><b>Tích lũy liên ngành:</b> khi đã có ≥ 2 khối màu mình nằm trọn trong trạm, đội được thu cả khối Kiến thức của đối phương còn trên sân về trạm mình (cũng <b>+15 điểm/khối</b>).</li>
            <li>Khi cấu kiện còn ngoài trạm, hai robot <b>được phép</b> tì đè, che chắn và tranh chấp trực tiếp, kể cả trên Bục Cơ hội. Cấu kiện đã nằm trọn trong trạm là bất khả xâm phạm.</li>
            <li><b>Vòng Chung kết:</b> Cấu kiện Cơ hội vàng mở tranh chấp ngay từ đầu Chặng 2. Đưa được về trạm: <b>+25 điểm</b>, tính là 1 cấu kiện mở khóa Chặng 3 và là chỉ số phụ khi hòa.</li>
            <li><b>Điều kiện lên Chặng 3:</b> có ≥ 2 cấu kiện bất kỳ trong trạm (2 Kiến thức, hoặc 1 Kiến thức + Cơ hội vàng).</li>
            <li>Đâm húc phá hoại hoặc kẹp khóa chết robot đối phương quá 5 giây khi không tranh chấp cấu kiện: <b>−10 điểm/lần</b>. Ra khỏi khu vực Chặng 2: <b>−10 điểm/lần</b>. Cấu kiện văng ra ngoài biên bị vô hiệu.</li>
          </ul>
          <h3 className="mt-4 font-bold text-team-blue">Chặng 3 · Bản lĩnh (bảo vệ Đồ án tốt nghiệp)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Hai robot thi đấu độc lập trên sân của đội mình; cấm sang sân đối phương hoặc cản phá nhau. Lộ trình bắt buộc theo thứ tự dưới đây.</li>
            <li>Vượt Cầu Bản lĩnh (toàn bộ thân xe): <b>+10 điểm</b>. Đỗ chiếm cầu quá 15 giây: <b>−15 điểm</b>, Trọng tài cưỡng chế lùi xe.</li>
            <li><b>Nhiệm vụ 1:</b> vượt Địa hình Thử thách — toàn bộ thân xe và 4 bánh qua khỏi thanh gờ thứ 5, không đi vòng ra ngoài: <b>+20 điểm</b>.</li>
            <li><b>Nhiệm vụ 2:</b> lấy Khối Đồ án ở Trạm Thực nghiệm, leo Dốc Kiên trì lên Đài Bảo vệ (250 mm) và đặt khối nằm trọn trong Ô Bảo vệ Đồ án: <b>+25 điểm</b>. Làm rơi khối thì phải quay xuống lấy lại.</li>
            <li><b>Nhiệm vụ 3:</b> xoay 90°, leo Dốc Thăng hoa lên Đỉnh Bục Vinh Quang (500 mm) và nhấn nút sáng Đèn Vinh Quang: <b>+40 điểm</b>. Nhấn đèn khi chưa đặt Khối Đồ án vào ô thì không được công nhận.</li>
            <li><b>CHIẾN THẮNG TUYỆT ĐỐI:</b> đội hoàn thành cả lộ trình và nhấn sáng Đèn Vinh Quang <b>trước tiên</b> → trận kết thúc ngay, thắng bất kể tỉ số.</li>
            <li>Ra khỏi khu vực Chặng 3: <b>−10 điểm/lần</b>. Lấn sang sân đối phương: <b>−15 điểm/lần</b> và buộc Retry về ô 3.1 / 3.2.</li>
          </ul>
        </section>

        <section id="diem" className={card}>
          <h2 className={h2}>VI. Barem điểm</h2>
          <Table head={["Chặng", "Nhiệm vụ", "Điểm", "Điều kiện công nhận"]} rows={SCORING.map((s) => [s.stage, s.task, <b key="p" className="whitespace-nowrap text-navy">{s.pts}</b>, s.cond])} />
          <p className="mt-2 text-xs text-slate-500">Điểm tối đa không tính Chiến thắng tuyệt đối: Chặng 1 30 + Chặng 2 (6 khối Kiến thức 90 + Cơ hội vàng 25) + Chặng 3 (10 + 20 + 25 + 40) = 240 điểm.</p>
        </section>

        <section id="retry" className={card}>
          <h2 className={h2}>VII. Retry</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Tối đa <b>03 lần Retry</b> mỗi trận; chỉ người điều khiển chính hô “RETRY”. Đồng hồ vẫn chạy.</li>
            <li>Retry tại Ô Retry của chặng đang gặp sự cố hoặc lùi về chặng trước — <b>không nhảy cóc lên chặng sau</b>.</li>
            <li>Chặng 1: về khu xuất phát (hoặc Checkpoint nếu đã qua). Chặng 2: Ô Retry Chặng 2 của đội. Chặng 3: Ô Retry 3.1 / 3.2 của đội. Toàn bộ thân robot và bánh xe phải nằm trọn trong ô.</li>
            <li>Cấu kiện đang mang khi Retry được Trọng tài đặt lại vị trí ban đầu; không được giữ cấu kiện trên robot.</li>
            <li>Chặng 3: điểm Địa hình Thử thách đã ghi được giữ nguyên; Khối Đồ án trả về Trạm Thực nghiệm và robot phải vượt lại Địa hình để lấy khối.</li>
          </ul>
        </section>

        <section id="phat" className={card}>
          <h2 className={h2}>VIII. Lỗi & xử phạt</h2>
          <Table head={["Lỗi", "Phạt"]} rows={PENALTIES.map((p) => [p.name, <b key="p" className="whitespace-nowrap text-mech-red">{p.pts}</b>])} />
          <h3 className="mt-4 font-bold text-navy">Truất quyền thi đấu</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Cố ý đâm húc phá hủy robot đối phương; làm hư hỏng nặng sa bàn (gãy rào chắn, sập bục, rách sàn); sử dụng vũ khí sắc nhọn, keo dính, thiết bị phá sóng.</li>
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
            <li>Quyết định cuối cùng thuộc về BTC và Tổ trọng tài.</li>
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
