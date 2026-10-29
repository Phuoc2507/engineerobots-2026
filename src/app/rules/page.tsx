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
  { stage: "Chặng 2 · Tích lũy", task: "Bóng Kiến thức Ø74 mm màu đội mình vào Trạm thành tựu", pts: "+15 / bóng", cond: "Vượt gờ chặn, nằm trọn trong Trạm thành tựu 300 × 300 mm (tối đa 2 bóng)" },
  { stage: "Chặng 2 · Tích lũy", task: "Tranh chấp bóng Cơ hội vàng về Trạm thành tựu", pts: "+30", cond: "Chỉ Vòng Chung kết, sau khi đủ 2 Kiến thức; là chỉ số ưu tiên khi hòa điểm" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Vượt Cầu Bản lĩnh (3.8)", pts: "+10", cond: "Toàn bộ thân xe qua cầu, khi đã có 2 Kiến thức hợp lệ ở Chặng 2" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Vượt Địa hình Thử thách (3.3 / 3.4)", pts: "+20", cond: "Toàn bộ thân xe và 4 bánh vượt qua thanh gờ thứ 5, không đi vòng ra ngoài" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Đưa bóng Đồ án vượt Dốc Kiên trì, đặt lên đế nhỏ trong Ô Bảo vệ Đồ án (3.9 / 3.10)", pts: "+25", cond: "Bóng Ø74 mm từ Trạm Thực nghiệm lên Đài Bảo vệ (cao 100 mm), nằm vững trên đế trong ô 120 × 120 mm" },
  { stage: "Chặng 3 · Bản lĩnh", task: "Leo Dốc Thăng hoa lên Bục Vinh Quang, nhấn sáng Đèn Vinh Quang (3.7)", pts: "+40 / +10", cond: "Bóng Đồ án đã nằm vững trên đế; robot lên Bục 200 mm, nhấn nút của đội mình trên vách ngăn làm đèn sáng. Đội nhấn trước +40, đội nhấn sau +10" },
  { stage: "Toàn trận", task: "CHIẾN THẮNG TUYỆT ĐỐI (Tốt nghiệp Xuất sắc)", pts: "Thắng ngay", cond: "Đủ 2 Kiến thức + Cơ hội vàng, qua Cầu, Địa hình, đặt Đồ án lên đế và nhấn sáng Đèn Vinh Quang trước đối phương → trận kết thúc ngay" },
];

const PENALTIES = [
  { name: "Chặng 1: mất line (tất cả bánh ra khỏi line, không tự phục hồi trong 5 giây), đi tắt hoặc bắt lại line ở chỗ khác", pts: "−5 / lần" },
  { name: "Chặng 1: chạm / đâm vào rào chắn", pts: "−5 / lần" },
  { name: "Xuất phát sớm (dừng robot, đưa về vị trí ban đầu)", pts: "−5" },
  { name: "Chạm tay vào robot khi chưa được Trọng tài cho Retry", pts: "−10 / lần" },
  { name: "Chặng 2: đâm húc phá hoại, hoặc ép khóa cứng robot đối phương quá 5 giây", pts: "−10 / lần" },
  { name: "Chặng 2: cố ý húc văng bóng Kiến thức của đối phương ra ngoài sân (Trọng tài đặt lại bóng)", pts: "−10 / lần" },
  { name: "Chặng 2: tự làm văng bóng Kiến thức của đội mình ra ngoài sân (Trọng tài đặt lại bóng)", pts: "−5 / lần" },
  { name: "Chặng 2 (Chung kết): cố ý thu thập bóng Cơ hội vàng khi chưa đủ 2 bóng Kiến thức trong trạm (Trọng tài đặt lại về Bục Cơ hội)", pts: "−10 / lần" },
  { name: "Chặng 2: cầm, giữ hoặc mang bóng Kiến thức của đối phương (Trọng tài đặt bóng về vị trí ban đầu; được phép chặn đường)", pts: "−10 / lần" },
  { name: "Chặng 2 (Vòng loại): sang nửa sân đối phương hoặc cản phá đối phương (buộc Retry về Ô Retry Chặng 2)", pts: "−15 / lần" },
  { name: "Robot ra khỏi khu vực Chặng 2 / Chặng 3", pts: "−10 / lần" },
  { name: "Chặng 3: chạm vạch giới hạn đoạn đường Địa hình Thử thách (Nhiệm vụ 1)", pts: "−5 / lần" },
  { name: "Chặng 3: làm rơi bóng Đồ án khỏi dốc hoặc Đài Bảo vệ (đưa về Trạm Thực nghiệm)", pts: "−5 / lần" },
  { name: "Chặng 3: lấn sang phần sân đối phương (buộc Retry về ô 3.1 / 3.2)", pts: "−15 / lần" },
  { name: "Chiếm giữ Cầu Bản lĩnh quá 10 giây (Trọng tài cưỡng chế lùi xe)", pts: "−15" },
  { name: "Cố ý tác động bóng trong Trạm thành tựu đối phương (phục hồi nguyên trạng)", pts: "−20 / lần" },
];

const TIEBREAK = [
  "Đội giành Chiến thắng tuyệt đối.",
  "Tổng điểm cao hơn (cộng các chặng, trừ điểm phạt).",
  "Thời gian hoàn thành Chặng 1 nhanh hơn (theo đồng hồ Tổ trọng tài).",
  "Tiến độ Chặng 3 cao hơn: đã đặt Đồ án lên đế trong Ô Bảo vệ, rồi đến đã vượt Địa hình Thử thách.",
  "Có bóng Cơ hội vàng trong Trạm thành tựu.",
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
            <li>Kiểm định kỹ thuật (kích thước, khối lượng, điện áp) tại bàn kỹ thuật trước <b>mỗi trận đấu</b>, không tính vào thời gian chuẩn bị (trận Bo3 chỉ kiểm định trước ván đầu); robot không đạt bị <b>xử thua trận đó</b> (vòng loại tính 0 điểm), không có thời gian sửa. Kích thước khi bắt đầu thi đấu tối đa 300 (D) × 250 (R) × 200 (C) mm. Khi bung cơ cấu (càng, tay gắp…) trong trận, tối đa <b>400 × 350 × 250 mm</b>. Dung sai +10 mm. Được dùng <b>robot dự phòng</b>, nhưng robot dự phòng cũng phải qua kiểm định.</li>
            <li><b>Cơ cấu tự do:</b> robot được dùng bất kỳ cơ chế nào để thu thập và đưa bóng (càng đẩy, con lăn cuốn bóng, tay gắp, ngàm kẹp…), miễn là nằm trong giới hạn kích thước. Khối lượng tối đa <b>2,5 kg</b> (tính cả pin, dung sai +100 g); được dùng khung xe, kit robot mua sẵn.</li>
            <li>Pin DC (LiPo, Li-Ion, Ni-MH, 18650) tối đa <b>12 V</b>, dung sai +0,6 V. Cấm điện lưới AC.</li>
            <li>Chặng 1 tự hành 100%, chỉ bấm nút Start một lần. Sau khi về đích Chặng 1, robot <b>tự chuyển</b> sang điều khiển từ xa (RF, Bluetooth, Wifi, gamepad không dây…); không được chạm tay vào robot để đổi chế độ, chỉ chạm tay khi Trọng tài chấp nhận Retry hoặc khi đưa robot lên đích Chặng 1 sau 60 giây. Tay cầm được kết nối sẵn nhưng phải <b>đặt xuống đất suốt Chặng 1</b>. Tối đa <b>02 thành viên</b> ở khu vực điều khiển.</li>
            <li>Cấm vũ khí, vật sắc nhọn, mũi khoan, lưỡi cắt kim loại, chất lỏng, khói, lửa; cấm keo dính sàn, nam châm điện cường độ lớn.</li>
            <li>Cấm thiết bị gây nhiễu sóng hoặc can thiệp tín hiệu đội khác — <b>truất quyền thi đấu</b>.</li>
            <li>Bề mặt cơ cấu tiếp xúc với bóng và nút Đèn Vinh Quang phải phẳng hoặc bọc cao su, silicon, vật liệu mềm.</li>
          </ul>
        </section>

        <section id="sa-ban" className={card}>
          <h2 className={h2}>III. Sa bàn 4,8 × 4,8 m</h2>
          <Image src="/images/sa-ban-2026.png" alt="Sơ đồ sa bàn ENGINEERING PATH 2026 theo thể lệ, đánh số 1.1–3.10" width={1319} height={1866} className="mt-4 h-auto w-full rounded-lg ring-1 ring-slate-200" />
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/arena-3d" className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white"><Box className="h-4 w-4" /> Xem sa bàn 3D</Link>
            <a href="/models/ban-ve-sa-ban-2026.pdf" className="inline-flex h-10 items-center gap-2 rounded-md bg-ice px-4 font-bold text-navy"><Download className="h-4 w-4" /> Bản vẽ kỹ thuật (PDF)</a>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Sân bao quanh bởi dây giăng cảnh báo. Vạch dò line màu đen rộng 20 mm trên nền trắng.</li>
            <li><b>Chặng 1:</b> 2 làn biên 4800 × 900 mm (Đỏ trái, Xanh phải); Trạm khởi hành 310 × 260 mm ở đỉnh làn; <i>Đường Danh vọng</i> thẳng 1800 mm kết thúc tại Checkpoint, tiếp nối <i>Đường Thách thức</i> ziczac góc 45° dài 2150 mm, về đích ở vạch chữ T 300 mm (cách vách đáy 550 mm).</li>
            <li><b>Chặng 2:</b> khu 3000 × 1850 mm; 2 Ô Retry 310 × 260 mm (gạch chéo 45°) sát lối vào; 2 Trạm thành tựu 300 × 300 mm (họa tiết lưới) phía trên hai cánh sân, có gờ chặn bóng cao 10 mm quanh chu vi; 4 Cấu kiện Kiến thức là bóng pickleball Ø74 mm (2 Đỏ ở cụm bên sân Đỏ, 2 Xanh ở cụm bên sân Xanh, phía dưới sân); Bục Cơ hội ở tâm, đáy 400 × 400, đỉnh 300 × 300, cao 50 mm với bóng Cơ hội vàng Ø74 mm trên đỉnh (chỉ đặt ở Vòng Chung kết xếp hạng).</li>
            <li><b>Cầu Bản lĩnh (3.8):</b> cầu gỗ có dây treo nối Chặng 2 sang Chặng 3, dài 600 × rộng 550 × cao 100 mm.</li>
            <li><b>Chặng 3:</b> khu 3000 × 2400 mm, chia 2 sân độc lập đối xứng (Đỏ trái, Xanh phải) bằng vạch trung tâm; 2 Ô Retry 310 × 260 mm sát biên ngoài; <i>Địa hình Thử thách</i> 400 × 600 mm gồm 5 thanh gờ ống PVC cao 15 mm; <i>Trạm Thực nghiệm</i> (3.5 / 3.6) ngay sau Địa hình, tâm trạm đặt bóng Đồ án Ø74 mm màu đội; <i>Tổ hợp Bục Vinh Quang</i> 2 bậc, dốc nghiêng 10°: Dốc Kiên trì (550 × 450 mm) thẳng phía trên Trạm Thực nghiệm lên Đài Bảo vệ cao 100 mm sát mép trên sa bàn; <i>Ô Bảo vệ Đồ án</i> (3.9 / 3.10) 120 × 120 mm ở góc trên phía ngoài Đài, bên trong có đế nhỏ đặt bóng; 2 Dốc Thăng hoa (500 × 450 mm) nằm ngang hai bên, dẫn lên Bục Vinh Quang (3.7) cao 200 mm (400 × 450 mm) ở trung tâm, vách ngăn giữa bục gắn 2 nút nhấn Đèn Vinh Quang cho hai đội.</li>
          </ul>
        </section>

        <section id="the-thuc" className={card}>
          <h2 className={h2}>IV. Thể thức thi đấu</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>Đồng hồ chạy liên tục, chỉ dừng khi Trọng tài chính ra lệnh dừng khẩn cấp (sa bàn hư hỏng, chập điện).</li>
            <li><b>Vòng loại (03:00/trận, 01 phút chuẩn bị):</b> 2 robot chạy cùng lúc nhưng độc lập; nội dung là Chặng 1 và đưa 2 bóng Kiến thức vào Trạm thành tựu, mỗi đội thi <b>01 trận</b>, <b>xếp hạng theo điểm số</b>; trận chỉ kết thúc sớm khi cả hai đội hoàn thành hết trước 180 giây. Ở Chặng 2 vòng loại, robot không được sang nửa sân đối phương hoặc cản phá nhau. <b>16 đội</b> cao nhất vào Vòng Chung kết xếp hạng.</li>
            <li><b>Vòng Chung kết xếp hạng (05:00/trận, 02 phút chuẩn bị):</b> đối kháng 1 vs 1 loại trực tiếp trên toàn bộ sa bàn; cặp đấu xác định bằng <b>bốc thăm</b>; tranh Hạng 3 thi đấu 1 trận; <b>trận Chung kết</b> thi đấu Best of 3. Màu sân bốc thăm ở ván đầu, đổi màu sau mỗi ván; nghỉ <b>02 phút</b> giữa các ván để thay pin, sửa robot.</li>
            <li>Đội được gọi tên <b>03 lần</b> mà không có mặt bị xử thua trận đó (vòng loại tính 0 điểm), áp dụng cả hai vòng.</li>
            <li>Nền sa bàn màu trắng, line đen. Sau vạch chữ T, robot đi thẳng vào khu vực Chặng 2 của đội mình.</li>
          </ul>
        </section>

        <section id="chang" className={card}>
          <h2 className={h2}>V. Luật từng chặng</h2>
          <h3 className="mt-4 font-bold text-team-red">Chặng 1 · Thích nghi (dò line tự động)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Robot nằm trọn trong Trạm khởi hành 310 × 260 mm. Khi có hiệu lệnh, 01 thành viên ấn nút khởi động một lần duy nhất.</li>
            <li>Robot <b>bắt buộc chạy bám theo đường line trong suốt Chặng 1</b>.</li>
            <li>Qua Checkpoint cuối Đường Danh vọng (toàn bộ xe đi qua): <b>+10 điểm</b>, robot được lưu vị trí Retry tại Checkpoint.</li>
            <li>Về đích khi ≥ 2 bánh xe cắt vạch chữ T cuối Đường Thách thức: <b>+20 điểm</b>. Thời gian hoàn thành là chỉ số phụ khi hòa.</li>
            <li>Giới hạn Chặng 1 là <b>60 giây</b>: quá thời gian mà chưa về đích, đội đưa robot lên khu vực đích Chặng 1 để thi Chặng 2; mất điểm về đích (+20) nhưng <b>giữ +10 Checkpoint</b> nếu đã qua. Khi xét hòa, thời gian Chặng 1 của đội chưa về đích tính là 60 giây.</li>
            <li>Mất line (tất cả bánh ra khỏi line, không tự phục hồi trong 5 giây): <b>−5 điểm/lần</b>, đội được Retry (tính 1 lần): chưa qua Checkpoint thì về Trạm khởi hành, đã qua thì đặt lại tại Checkpoint. Chạm / đâm vào rào chắn: <b>−5 điểm/lần</b>. Đi tắt hoặc rời line rồi bắt lại line ở chỗ khác bị xử như mất line.</li>
          </ul>
          <h3 className="mt-4 font-bold text-navy">Chặng 2 · Tích lũy (thu thập & tranh chấp cấu kiện)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Hoàn thành Chặng 1 thì được điều khiển từ xa; đội về đích Chặng 1 sớm hơn được vào Chặng 2 sớm hơn.</li>
            <li>Robot dùng bất kỳ cơ chế nào đưa 2 bóng Kiến thức màu đội mình vượt gờ chặn vào Trạm thành tựu: <b>+15 điểm/bóng</b>.</li>
            <li>Khi bóng còn ngoài trạm, hai robot <b>được phép</b> tì đè, che chắn và tranh chấp trực tiếp, kể cả trên Bục Cơ hội. Bóng đã nằm trọn trong trạm là bất khả xâm phạm.</li>
            <li>Được chặn đường di chuyển của đối phương, nhưng <b>không được cầm, giữ hoặc mang bóng Kiến thức của đối phương</b>: <b>−10 điểm/lần</b>, Trọng tài đặt bóng về vị trí ban đầu.</li>
            <li><b>Vòng loại:</b> hai robot thi đấu độc lập, không được sang nửa sân đối phương hoặc cản phá nhau: <b>−15 điểm/lần</b> và buộc Retry về Ô Retry Chặng 2.</li>
            <li><b>Vòng Chung kết:</b> sau khi đủ 2 bóng Kiến thức, đội được tranh chấp bóng Cơ hội vàng trên Bục Cơ hội. Đưa được về trạm: <b>+30 điểm</b>, đồng thời là chỉ số ưu tiên khi hòa điểm. Cố ý thu thập bóng vàng khi chưa đủ 2 Kiến thức: <b>−10 điểm/lần</b>, Trọng tài đặt lại; bị đối phương đẩy vào bóng vàng thì không phạt (Trọng tài xem xét); bóng vàng văng ra ngoài biên được đặt lại trên Bục Cơ hội.</li>
            <li>Được bắn hoặc ném bóng vào trạm, miễn bóng nằm trọn trong trạm; không giới hạn số bóng robot mang cùng lúc.</li>
            <li><b>Điều kiện lên Chặng 3:</b> có tối thiểu 2 bóng Kiến thức hợp lệ trong trạm.</li>
            <li>Đâm húc phá hoại, hoặc ép khóa cứng robot đối phương quá 5 giây: <b>−10 điểm/lần</b>. Ra khỏi khu vực Chặng 2: <b>−10 điểm/lần</b>.</li>
            <li>Cố ý húc văng bóng Kiến thức của đối phương ra ngoài biên Chặng 2: <b>−10 điểm/lần</b>, Trọng tài đặt lại bóng. Tự làm văng bóng của đội mình: <b>−5 điểm/lần</b>, Trọng tài đặt lại bóng về vị trí ban đầu.</li>
            <li>Cố ý tác động vào bóng đã nằm trong Trạm thành tựu của đối phương: <b>−20 điểm/lần</b>, phục hồi nguyên trạng.</li>
          </ul>
          <h3 className="mt-4 font-bold text-team-blue">Chặng 3 · Bản lĩnh (bảo vệ Đồ án tốt nghiệp)</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Hai robot thi đấu độc lập trên sân của đội mình; cấm sang sân đối phương hoặc cản phá nhau. Lộ trình bắt buộc theo thứ tự dưới đây.</li>
            <li>Vượt Cầu Bản lĩnh (toàn bộ thân xe): <b>+10 điểm</b>. Đỗ chiếm cầu quá 10 giây: <b>−15 điểm</b>, Trọng tài cưỡng chế lùi xe.</li>
            <li><b>Nhiệm vụ 1:</b> vượt Địa hình Thử thách — toàn bộ thân xe và 4 bánh qua khỏi thanh gờ thứ 5, không đi vòng ra ngoài: <b>+20 điểm</b>. Chạm vạch giới hạn đoạn đường: <b>−5 điểm/lần</b>.</li>
            <li><b>Nhiệm vụ 2:</b> dùng cơ chế của robot đưa bóng Đồ án từ Trạm Thực nghiệm vượt Dốc Kiên trì lên Đài Bảo vệ (100 mm), đặt nằm vững trên đế nhỏ trong Ô Bảo vệ Đồ án 120 × 120 mm: <b>+25 điểm</b>. Làm rơi bóng khỏi dốc hoặc Đài: <b>−5 điểm/lần</b>, bóng đưa về Trạm Thực nghiệm.</li>
            <li><b>Nhiệm vụ 3:</b> di chuyển trên Đài Bảo vệ, leo Dốc Thăng hoa lên Bục Vinh Quang (200 mm) và nhấn nút của đội mình trên vách ngăn làm sáng Đèn Vinh Quang: đội nhấn trước <b>+40 điểm</b>, đội nhấn sau <b>+10 điểm</b>. Nhấn đèn khi chưa đặt bóng Đồ án lên đế thì không được công nhận.</li>
            <li><b>CHIẾN THẮNG TUYỆT ĐỐI:</b> đội có đủ 2 Kiến thức và Cơ hội vàng, hoàn thành cả lộ trình Chặng 3 và nhấn sáng Đèn Vinh Quang <b>trước tiên</b> → trận kết thúc ngay, thắng bất kể tỉ số.</li>
            <li>Ra khỏi khu vực Chặng 3: <b>−10 điểm/lần</b>. Lấn sang sân đối phương: <b>−15 điểm/lần</b> và buộc Retry về ô 3.1 / 3.2.</li>
          </ul>
        </section>

        <section id="diem" className={card}>
          <h2 className={h2}>VI. Barem điểm</h2>
          <Table head={["Chặng", "Nhiệm vụ", "Điểm", "Điều kiện công nhận"]} rows={SCORING.map((s) => [s.stage, s.task, <b key="p" className="whitespace-nowrap text-navy">{s.pts}</b>, s.cond])} />
          <p className="mt-2 text-xs text-slate-500">Điểm tối đa không tính Chiến thắng tuyệt đối: Chặng 1 30 + Chặng 2 (2 Kiến thức 30 + Cơ hội vàng 30) + Chặng 3 (10 + 20 + 25 + 40 nếu nhấn đèn trước) = 185 điểm. Vòng loại tối đa 30 + 30 = 60 điểm. Tổng điểm có thể âm.</p>
        </section>

        <section id="retry" className={card}>
          <h2 className={h2}>VII. Retry</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li><b>Không giới hạn</b> số lần Retry; chỉ người điều khiển chính hô “RETRY”, Trọng tài bàn ghi nhận số lần (là chỉ số phụ khi hòa). Đồng hồ vẫn chạy; đội được sửa robot trong lúc Retry.</li>
            <li>Retry tại Ô Retry của chặng đang gặp sự cố hoặc lùi về chặng trước — <b>không nhảy cóc lên chặng sau</b>.</li>
            <li>Chặng 1: về Trạm khởi hành (hoặc Checkpoint nếu đã qua). Chặng 2: Ô Retry Chặng 2 của đội hoặc lùi về Trạm khởi hành chạy lại Chặng 1. Chặng 3: Ô Retry 3.1 / 3.2 của đội. Toàn bộ thân robot và bánh xe phải nằm trọn trong ô.</li>
            <li>Mỗi mục điểm chỉ được tính <b>01 lần</b> trong trận (Kiến thức tính theo từng bóng); đi lại lộ trình sau Retry không được cộng thêm.</li>
            <li>Bóng đang được robot giữ hoặc thao tác khi Retry bị coi là chưa hoàn thành, Trọng tài đặt lại vị trí ban đầu; không được mang bóng về Ô Retry.</li>
            <li>Chặng 3: điểm Địa hình Thử thách đã ghi được giữ nguyên; Retry khi đang mang bóng Đồ án không bị phạt, bóng trả về Trạm Thực nghiệm và robot phải vượt lại Địa hình để tiếp tục đưa bóng lên Dốc Kiên trì.</li>
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
          <p className="mt-1 text-xs text-slate-500">Vòng loại không xét tiêu chí 4 và 5; sau tiêu chí 3, vòng loại xét thêm thời gian hoàn thành toàn bộ nội dung (Chặng 1 + 02 bóng Kiến thức) nhanh hơn.</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Khiếu nại <b>trong vòng 03 phút</b> sau khi có kết quả và trước khi ký biên bản; quá hạn bị bác. Gửi qua <Link href="/team/dashboard" className="font-semibold text-navy-600 underline">trang đội thi</Link>.</li>
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
