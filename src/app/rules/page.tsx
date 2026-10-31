import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Box, Download } from "lucide-react";
import { PRIZES, ROBOT_SPECS, WORKSHOPS } from "@/lib/site";
import PortalShell from "@/components/register/PortalShell";

export const metadata: Metadata = {
  title: "Thể lệ · FME JOURNEY 2026",
  description: "Thể lệ chính thức cuộc thi FME JOURNEY 2026 – Hành trình Kỹ sư Cơ khí: chủ đề, quy chuẩn robot, sa bàn, vòng đấu, luật 3 chặng, retry, lỗi vi phạm, khiếu nại và tập huấn.",
};

const card = "rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7";
const h2 = "font-display text-2xl uppercase tracking-wide text-navy";
const h3 = "mt-4 font-bold text-navy";
const ul = "mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700";

const TERMS = [
  ["Trạm khởi hành", "1.1 – 1.2", "Vị trí đặt robot trước khi trận đấu bắt đầu"],
  ["Chặng 1", "Chặng 1", "Khu vực thực hiện nhiệm vụ “Thích nghi”"],
  ["Chặng 2", "Chặng 2", "Khu vực thực hiện nhiệm vụ “Bứt phá”"],
  ["Chặng 3", "Chặng 3", "Khu vực thực hiện nhiệm vụ “Thành công”"],
  ["Vạch giới hạn", "Đường kẻ màu đen bao quanh các khu vực trong sân thi đấu", "Vạch giới hạn phạm vi của robot hoạt động trong sân thi đấu"],
  ["Vị trí Checkpoint", "Khung được ký hiệu “Checkpoint”", "Vị trí đánh dấu trên đoạn đường dò line; robot đi qua vạch sẽ được lưu vị trí retry tại đó ở Chặng 1"],
  ["Khu vực retry", "2.1 – 2.2 – 3.1 – 3.2", "Khu vực robot được đưa về khi đội thi yêu cầu quyền retry"],
  ["Trạm thành tựu", "2.3 – 2.4", "Khu vực ghi điểm bằng cấu kiện Kiến thức"],
  ["Cấu kiện Cơ hội vàng", "2.5", "Quả bóng pickleball (đường kính 74 mm) màu vàng đặt trên đỉnh Bục Cơ hội"],
  ["Bục Cơ hội", "2.5", "Khu vực đặt cấu kiện Cơ hội vàng"],
  ["Cấu kiện Kiến thức", "2.6", "Quả bóng pickleball (đường kính 74 mm) gồm 02 quả Đỏ ở cụm bên sân đội Đỏ và 02 quả Xanh ở cụm bên sân đội Xanh"],
  ["Đường Thử thách", "3.3 – 3.4", "Dải địa hình gồ ghề của đội Đỏ (3.3) và đội Xanh (3.4)"],
  ["Cấu kiện Đồ án", "3.5 – 3.6", "Quả bóng pickleball (đường kính 74 mm)"],
  ["Trạm Thực nghiệm", "3.5 – 3.6", "Khu vực đặt cấu kiện Đồ án (3.5 đội Đỏ, 3.6 đội Xanh)"],
  ["Bục Vinh Quang", "3.7", "Khu vực để 2 robot nhấn nút thắp sáng Đèn Vinh Quang"],
  ["Đèn Vinh Quang", "3.7", "Khi robot nhấn nút, ngọn đèn sẽ sáng rực rỡ"],
  ["Cầu Bản lĩnh", "3.8", "Cầu gỗ với hệ thống dây treo nối giữa Chặng 2 và Chặng 3"],
  ["Ô Bảo vệ Đồ án & Đế đặt cấu kiện", "3.9 – 3.10", "Khu vực đặt cấu kiện Đồ án để ghi điểm"],
];

const SCORING = [
  { stage: "Chặng 1 · Thích nghi", task: "Dò line tự động qua vị trí Checkpoint", pts: "+10", cond: "Toàn bộ xe đi qua hoàn toàn vị trí Checkpoint" },
  { stage: "Chặng 1 · Thích nghi", task: "Dò line tự động hoàn thành quãng đường", pts: "+20", cond: "2 bánh xe cắt ngang vạch chữ T ở cuối đường line" },
  { stage: "Chặng 2 · Bứt phá", task: "Thu thập 1 cấu kiện Kiến thức (màu đội mình) vào Trạm thành tựu", pts: "+15 / khối", cond: "Quả bóng được đưa vào nằm trọn trong Trạm thành tựu" },
  { stage: "Chặng 2 · Bứt phá", task: "Tranh chấp và đưa cấu kiện Cơ hội vàng vào Trạm thành tựu", pts: "+30 · chỉ số ưu tiên khi hòa điểm", cond: "Quả bóng vàng được đưa vào nằm trọn trong Trạm thành tựu (chỉ Vòng Chung kết xếp hạng)" },
  { stage: "Chặng 3 · Thành công", task: "Vượt Cầu Bản lĩnh", pts: "+10", cond: "Toàn bộ thân xe đi qua được cầu (khi đã có 02 cấu kiện hợp lệ tại Chặng 2)" },
  { stage: "Chặng 3 · Thành công", task: "Vượt Đường Thử thách", pts: "+20", cond: "Toàn bộ thân xe và bánh xe vượt qua hoàn toàn 5 thanh gờ của Đường Thử thách thuộc phần sân đội mình" },
  { stage: "Chặng 3 · Thành công", task: "Đưa cấu kiện Đồ án vượt Dốc Kiên trì đặt lên đế nhỏ trong Ô Bảo vệ Đồ án trên Đài Bảo vệ (dùng càng đẩy, cuộn bóng, tay gắp…)", pts: "+25", cond: "Bóng Đồ án được đưa từ Trạm Thực nghiệm vượt qua Dốc Kiên trì lên Đài Bảo vệ và được đặt vững chắc lên chiếc đế nhỏ của Ô Bảo vệ Đồ án (3.9 Đỏ – 3.10 Xanh) tại góc trên của bậc" },
  { stage: "Chặng 3 · Thành công", task: "Leo Dốc Thăng hoa lên Bục Vinh Quang và thắp sáng Đèn Vinh Quang", pts: "+40 (nhấn trước) / +25 (nhấn sau)", cond: "Cấu kiện Đồ án đã được đặt thành công lên đế nhỏ trong Ô Bảo vệ Đồ án; robot di chuyển từ Đài Bảo vệ leo Dốc Thăng hoa tiến vào Bục Vinh Quang ở trung tâm và nhấn vào nút trên vách ngăn làm Đèn Vinh Quang phát sáng" },
  { stage: "Chặng 3 · Thành công", task: "Chiến thắng tuyệt đối (Tốt nghiệp Xuất sắc)", pts: "Thắng ngay lập tức (theo đủ điều kiện tại Mục VI.3.2)", cond: "Hoàn thành theo trình tự ở Mục VI.3.2 (nếu nhấn đèn trước mà chưa đủ điều kiện theo trình tự thì không đủ điều kiện để tạo ra chiến thắng tuyệt đối)" },
];

const PENALTIES = [
  { stage: "Chặng 1 · Thích nghi", name: "Mất line", pts: "−5 / lần", cond: "Tất cả bánh xe của robot hoàn toàn ra khỏi đường line đen mà không thể tự phục hồi lộ trình" },
  { stage: "Chặng 1 · Thích nghi", name: "Đâm rào", pts: "−5 / lần", cond: "Robot di chuyển chạm / đâm vào rào chắn trên sân thi đấu" },
  { stage: "Chặng 2 · Bứt phá", name: "Đâm húc phá hoại / Ép khóa cứng robot đối phương", pts: "−10 / lần", cond: "Cố ý lấy đà đâm húc tốc độ cao gây hư hại hoặc dùng cơ chế ép khóa cứng robot đối phương vào vách sân quá 05 giây khi không tranh chấp cấu kiện" },
  { stage: "Chặng 2 · Bứt phá", name: "Rời khỏi khu vực", pts: "−10 / lần", cond: "Robot hoàn toàn ra khỏi khu vực thi đấu của Chặng 2" },
  { stage: "Chặng 2 · Bứt phá", name: "Húc văng cấu kiện Kiến thức của đối phương ra ngoài sân", pts: "−10 / lần (đặt lại cấu kiện cho đối phương)", cond: "Cố ý đẩy / húc hoặc làm văng cấu kiện Kiến thức của đối phương ra ngoài biên Chặng 2" },
  { stage: "Chặng 2 · Bứt phá", name: "Tự làm văng cấu kiện", pts: "−5 / lần (cấu kiện được đặt lại vị trí ban đầu)", cond: "Tự làm văng cấu kiện đội mình ra ngoài biên" },
  { stage: "Chặng 2 · Bứt phá", name: "Cố ý tác động cấu kiện trong Trạm thành tựu đối phương", pts: "−20 / lần (phục hồi nguyên trạng cho đối phương)", cond: "Cố ý tác động cấu kiện trong Trạm thành tựu đối phương" },
  { stage: "Chặng 2 · Bứt phá", name: "Cố ý thu thập cấu kiện Cơ hội vàng khi chưa đủ 2 Kiến thức (Chung kết)", pts: "−10 / lần (đặt lại cấu kiện về Bục Cơ hội)", cond: "Chỉ được tranh chấp Cơ hội vàng sau khi có đủ 2 cấu kiện Kiến thức trong Trạm thành tựu" },
  { stage: "Chặng 2 · Bứt phá", name: "Giữ cấu kiện Kiến thức của đối phương", pts: "−10 / lần (đặt lại cấu kiện về vị trí ban đầu)", cond: "Cầm, giữ hoặc mang cấu kiện Kiến thức của đối phương" },
  { stage: "Chặng 2 · Bứt phá", name: "Sang nửa sân đối phương (Vòng loại)", pts: "−15 / lần (bắt buộc retry)", cond: "Ở vòng loại, robot sang nửa sân của đối phương hoặc cản phá đối phương tại Chặng 2" },
  { stage: "Chặng 3 · Thành công", name: "Chạm vạch giới hạn đoạn đường (Nhiệm vụ 1)", pts: "−5 / lần", cond: "Robot di chuyển chạm vào cạnh giới hạn của đoạn Đường Thử thách" },
  { stage: "Chặng 3 · Thành công", name: "Làm rơi cấu kiện Đồ án (Nhiệm vụ 2)", pts: "−5 / lần (cấu kiện Đồ án được đưa về vị trí ban đầu)", cond: "Mỗi lần làm rơi cấu kiện Đồ án khỏi dốc hoặc khỏi Đài Bảo vệ" },
  { stage: "Chặng 3 · Thành công", name: "Rời khỏi khu vực", pts: "−10 / lần", cond: "Robot ra khỏi khu vực Chặng 3" },
  { stage: "Chặng 3 · Thành công", name: "Lấn sang sân đối phương", pts: "−15 / lần (bắt buộc retry)", cond: "Robot di chuyển sang phần sân của đối phương tại Chặng 3" },
];

const TIEBREAK_QUAL = [
  "Ưu tiên 1: Tổng điểm thi đấu cao hơn (cộng tất cả các chặng và trừ điểm phạt).",
  "Ưu tiên 2: Thời gian hoàn thành Chặng 1 nhanh hơn (chỉ so 2 đội hoàn thành hợp lệ Chặng 1; đội bị TIMEOUT không được xét tiêu chí này).",
  "Ưu tiên 3: Thời gian hoàn thành toàn bộ nội dung vòng loại nhanh hơn.",
  "Ưu tiên 4: Số lần retry ít hơn.",
  "Biện pháp cuối cùng: nếu tất cả 4 tiêu chí trên hoàn toàn trùng khớp, hai đội bốc thăm trước sự chứng kiến của BTC.",
];

const TIEBREAK_FINAL = [
  "Ưu tiên 1: Đội giành chiến thắng tuyệt đối (theo điều kiện ở Mục VI.3.2).",
  "Ưu tiên 2: Tổng điểm thi đấu cao hơn (cộng tất cả các chặng và trừ điểm phạt).",
  "Ưu tiên 3: Thời gian hoàn thành Chặng 1 nhanh hơn (chỉ so 2 đội hoàn thành hợp lệ Chặng 1; đội bị TIMEOUT không được xét tiêu chí này).",
  "Ưu tiên 4: Tiến độ hoàn thành thử thách tại Chặng 3 cao hơn (Đèn Vinh Quang > Dốc Thăng hoa > hoàn thành Bảo vệ Đồ án > Dốc Kiên trì > Trạm Thực nghiệm > Đường Thử thách > Cầu Bản lĩnh).",
  "Ưu tiên 5: Đội lấy được cấu kiện Cơ hội vàng về Trạm thành tựu.",
  "Ưu tiên 6: Số lần retry ít hơn trong trận đấu.",
  "Biện pháp cuối cùng: nếu tất cả 6 tiêu chí trên hoàn toàn trùng khớp, hai đội bốc thăm trước sự chứng kiến của BTC.",
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
    <PortalShell title="Thể lệ chính thức" subtitle="Cuộc thi “FME JOURNEY 2026” dành cho Tân sinh viên khóa 2026 · BCH Đoàn – Hội Khoa Cơ khí · tháng 11/2026.">
      <div className="space-y-6">
        <nav aria-label="Mục lục" className={`${card} text-sm`}>
          <p className="font-bold text-navy">Mục lục</p>
          <ol className="mt-2 grid list-[upper-roman] gap-1 pl-6 text-navy-600 sm:grid-cols-2">
            {[["doi-tuong", "Đối tượng tham gia"], ["chu-de", "Chủ đề cuộc thi"], ["robot", "Quy chuẩn kỹ thuật robot"], ["sa-ban", "Sa bàn & chi tiết sân"], ["vong-dau", "Các vòng đấu"], ["luat", "Luật thi đấu & bảng điểm"], ["retry", "Retry"], ["phat", "Các lỗi vi phạm khác"], ["ket-qua", "Kết quả & khiếu nại"], ["tap-huan", "Tập huấn kỹ thuật"]].map(([id, l]) => (
              <li key={id}><a href={`#${id}`} className="hover:text-mech-red">{l}</a></li>
            ))}
          </ol>
          <p className="mt-2 text-navy-600"><a href="#giai" className="hover:text-mech-red">Giải thưởng & chạy thử sa bàn</a></p>
        </nav>

        <section id="doi-tuong" className={card}>
          <h2 className={h2}>I. Đối tượng tham gia</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            <li>Tân sinh viên khóa 2026 hệ chính quy <b>đang theo học tại khoa Cơ khí</b>, Trường Đại học Công nghệ Kỹ thuật TP. Hồ Chí Minh (HCM-UTE).</li>
            <li>Tham gia theo đội thi, mỗi đội gồm <b>tối đa 05 thành viên</b>.</li>
            <li>Mỗi đội bắt buộc cử 01 Đội trưởng đại diện để liên hệ, bốc thăm và xác nhận các biên bản kết quả với Ban tổ chức.</li>
            <li>Mỗi sinh viên chỉ được đăng ký trong danh sách của đúng 01 đội thi duy nhất.</li>
          </ul>
        </section>

        <section id="chu-de" className={card}>
          <h2 className={h2}>II. Chủ đề “Hành trình Kỹ sư Cơ khí”</h2>
          <p className="mt-3 text-sm text-slate-700">Đấu trường được tái hiện như “Hành trình trưởng thành của một người Kỹ sư Cơ khí”: mỗi robot là hiện thân cho tâm huyết, bản lĩnh, sự sáng tạo và trí tuệ của người điều khiển; mỗi chặng thi là một cột mốc của kỹ sư tương lai. Các thử thách tăng dần từ dễ đến khó:</p>
          <h3 className="mt-4 font-bold text-team-red">Chặng 1 – “Thích nghi”</h3>
          <p className="mt-1 text-sm text-slate-700">Làm quen môi trường đại học. Robot tự động hoàn toàn (dò line, không can thiệp điều khiển): xuất phát từ Trạm khởi hành, qua Đường Danh vọng, vượt Checkpoint và xử lý các khúc cua của Đường Thách thức để về đích tại vạch ngang chữ T.</p>
          <h3 className={h3}>Chặng 2 – “Bứt phá”</h3>
          <p className="mt-1 text-sm text-slate-700">Học tập, tích lũy kiến thức và nắm bắt cơ hội. Đội điều khiển robot bằng tay cầm, dùng bất cứ cơ chế nào đưa các cấu kiện Kiến thức về Trạm thành tựu để mở khóa quyền tranh chấp cấu kiện Cơ hội vàng tại bục trung tâm.</p>
          <h3 className="mt-4 font-bold text-team-blue">Chặng 3 – “Thành công”</h3>
          <p className="mt-1 text-sm text-slate-700">Thực hiện và bảo vệ Đồ án tốt nghiệp. Hai robot thi đấu độc lập trên sân của đội mình: vượt Cầu Bản lĩnh, vượt Đường Thử thách, đưa cấu kiện Đồ án từ Trạm Thực nghiệm vượt Dốc Kiên trì vào Ô Bảo vệ Đồ án trên Đài Bảo vệ, rồi leo Dốc Thăng hoa vào Bục Vinh Quang nhấn nút thắp sáng Đèn Vinh Quang của đội mình.</p>
        </section>

        <section id="robot" className={card}>
          <h2 className={h2}>III. Quy chuẩn kỹ thuật robot</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ROBOT_SPECS.map((s) => (
              <div key={s.label} className="rounded-lg bg-ice p-3"><dt className="text-xs text-slate-500">{s.label}</dt><dd className="font-bold text-navy">{s.value}</dd></div>
            ))}
          </dl>
          <h3 className={h3}>1. Kích thước</h3>
          <ul className={ul}>
            <li>Toàn bộ thân robot khi đã bung toàn bộ cơ cấu phải nằm gọn trong <b>400 (Dài) × 350 (Rộng) × 250 (Cao) mm</b> suốt trận đấu, dung sai +10 mm; không chi tiết nào được tràn ra ngoài.</li>
            <li><b>Cơ chế tự do:</b> càng đẩy, trục cuộn bóng / con lăn cuốn, tay gắp, ngàm kẹp… để thu thập, dẫn hướng hoặc đưa bóng về vị trí quy định (Trạm thành tựu, Ô Bảo vệ Đồ án) và nhấn nút Đèn Vinh Quang.</li>
          </ul>
          <h3 className={h3}>2. Khối lượng</h3>
          <ul className={ul}><li>Tổng khối lượng (tính cả pin) tối đa <b>2,5 kg</b>, dung sai +100 g. Được dùng khung xe, kit robot mua sẵn.</li></ul>
          <h3 className={h3}>3. Nguồn điện</h3>
          <ul className={ul}><li>Pin DC (Lithium-Polymer, Li-Ion, Ni-MH, 18650), tối đa <b>12 V DC</b>, dung sai +0,6 V. Nghiêm cấm điện lưới AC.</li></ul>
          <h3 className={h3}>4. Kiểm định</h3>
          <ul className={ul}>
            <li>Kiểm tra kích thước, khối lượng, điện áp tại bàn kỹ thuật trước <b>mỗi trận đấu</b>, không tính vào thời gian chuẩn bị (trận Bo3 chỉ kiểm định trước ván đầu). Không đạt bị <b>xử thua trận đó</b> (vòng loại tính 0 điểm), không có thời gian sửa chữa.</li>
            <li>Được dùng robot dự phòng; robot dự phòng phải qua kiểm định trước trận đấu sử dụng.</li>
          </ul>
          <h3 className={h3}>5. Chế độ điều khiển & tự hành</h3>
          <ul className={ul}>
            <li><b>Chặng 1:</b> chạy hoàn toàn tự động (dò line), chỉ ấn nút khởi động một lần duy nhất. <b>Nghiêm cấm mọi can thiệp sóng không dây, tay cầm điều khiển hoặc tác động cơ học</b> trong Chặng 1.</li>
            <li><b>Chặng 2 và 3:</b> điều khiển từ xa (RF, Bluetooth, Wifi, Gamepad không dây…).</li>
            <li><b>Chuyển chế độ:</b> sau khi về đích Chặng 1, robot phải tự chuyển sang điều khiển từ xa; không chạm tay để đổi chế độ. Chỉ chạm tay khi Trọng tài chấp nhận retry hoặc khi đưa robot lên khu vực đích Chặng 1 sau 60 giây (TIMEOUT).</li>
            <li><b>Thiết bị điều khiển:</b> tay cầm được kết nối sẵn nhưng phải đặt xuống đất suốt Chặng 1; <b>chỉ được cầm lên khi robot đã về đích Chặng 1 hoặc đã hết 60 giây</b>.</li>
            <li><b>Khu vực điều khiển:</b> tối đa 02 thành viên mỗi đội.</li>
          </ul>
          <h3 className={h3}>6. Quy định an toàn</h3>
          <ul className={ul}>
            <li>Cấm vũ khí hủy diệt, vật sắc nhọn, mũi khoan, lưỡi cắt kim loại, keo dán dính sàn, nam châm điện cường độ lớn gây kẹt sàn, chất lỏng, khói, lửa, chất ăn mòn.</li>
            <li>Cấm thiết bị gây nhiễu sóng vô tuyến nhằm vô hiệu hóa tay điều khiển của đối phương: <b>truất quyền thi đấu ngay lập tức và hủy bỏ toàn bộ kết quả</b> trong cuộc thi.</li>
            <li>Bề mặt chi tiết tiếp xúc với bóng cấu kiện (Kiến thức, Cơ hội vàng, Đồ án) và nút Đèn Vinh Quang phải phẳng, nhẵn hoặc bọc mút xốp, cao su, silicon, vật liệu mềm; không có cạnh sắc làm móp, trầy, thủng hay biến dạng bóng và thiết bị của BTC.</li>
          </ul>
        </section>

        <section id="sa-ban" className={card}>
          <h2 className={h2}>IV. Sa bàn và chi tiết sân thi đấu</h2>
          <p className="mt-3 text-sm text-slate-700">Sa bàn 4800 × 4800 mm gia công theo bộ bản vẽ kỹ thuật 2D/3D chính thức của BTC, bao quanh bởi dây giăng cảnh báo. <b>Bản vẽ chi tiết sa bàn và đường line được công bố bên dưới</b> để các đội tự làm sa bàn tập luyện.</p>
          <Image src="/images/sa-ban-2026.png" alt="Sơ đồ sa bàn FME JOURNEY 2026 theo thể lệ, đánh số 1.1–3.10" width={1319} height={1866} className="mt-4 h-auto w-full rounded-lg ring-1 ring-slate-200" />
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/arena-3d" className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white"><Box className="h-4 w-4" /> Xem sa bàn 3D</Link>
            <a href="/models/ban-ve-sa-ban-2026.pdf" className="inline-flex h-10 items-center gap-2 rounded-md bg-ice px-4 font-bold text-navy"><Download className="h-4 w-4" /> Bản vẽ kỹ thuật (PDF)</a>
          </div>
          <h3 className="mt-4 font-bold text-team-red">1. Chặng 1 · Thích nghi</h3>
          <ul className={ul}>
            <li>Nền trắng, line đen. 2 làn biên độc lập 4800 (Dài) × 900 (Rộng) mm: Đội Đỏ cánh trái, Đội Xanh cánh phải.</li>
            <li><b>Trạm khởi hành (1.1 – 1.2):</b> ô 410 × 360 mm ở góc trên cùng mỗi làn; ô màu Đỏ (1.1) cho đội Đỏ, ô màu Xanh (1.2) cho đội Xanh.</li>
            <li>Vạch dẫn hướng màu đen rộng 20 mm. <b>Đường Danh vọng:</b> đoạn thẳng 1800 mm nối từ Trạm khởi hành. <b>Đường Thách thức:</b> ziczac dài 1940 mm, khúc cua 45°, kết thúc ở vạch ngang chữ T dài 300 mm.</li>
            <li><b>Checkpoint:</b> cuối Đường Danh vọng (mốc 1800 mm, trước khi vào Đường Thách thức).</li>
          </ul>
          <h3 className={h3}>2. Chặng 2 · Bứt phá</h3>
          <ul className={ul}>
            <li>Khu vực rộng 3000 mm, dài 1850 mm.</li>
            <li><b>Khu vực retry (2.1 – 2.2):</b> 410 × 360 mm ở 2 góc dưới (2.1 trái cho Đỏ, 2.2 phải cho Xanh), họa tiết gạch chéo 45°.</li>
            <li><b>Trạm thành tựu (2.3 – 2.4):</b> 300 × 300 mm phía trên sân (Đỏ trái, Xanh phải), họa tiết lưới ô vuông màu đội; gờ chặn hãm bóng cao 10 mm quanh chu vi.</li>
            <li><b>Bục Cơ hội (2.5):</b> bục dốc nghiêng 4 mặt đối xứng ở tâm Chặng 2, đáy 400 × 400 mm, đỉnh phẳng 300 × 300 mm, cao 50 mm; trên tâm đặt 01 bóng pickleball Ø74 mm màu vàng (Cơ hội vàng). <b>Chỉ xuất hiện ở Vòng Chung kết xếp hạng.</b></li>
            <li><b>Cấu kiện Kiến thức (2.6):</b> 04 bóng pickleball Ø74 mm (02 Đỏ ở cụm bên sân Đỏ, 02 Xanh ở cụm bên sân Xanh), ở hai bên phía dưới sân.</li>
          </ul>
          <h3 className="mt-4 font-bold text-team-blue">3. Chặng 3 · Thành công</h3>
          <ul className={ul}>
            <li>Khu vực rộng 3000 mm, dài 2400 mm, chia 2 sân độc lập đối xứng (Đỏ trái, Xanh phải) bởi <b>đường nét đứt màu xanh dương</b> ở giữa.</li>
            <li><b>Khu vực retry (3.1 – 3.2):</b> 410 × 360 mm sát hai mép vách biên ngoài, họa tiết gạch chéo 45°.</li>
            <li><b>Đường Thử thách (3.3 – 3.4):</b> mỗi khu 600 (Dài) × 400 (Rộng) mm, gồm 05 thanh gờ ống PVC cao 15 mm đặt ngang liên tiếp, <b>mỗi thanh cách nhau 100 mm</b>.</li>
            <li><b>Trạm Thực nghiệm (3.5 – 3.6):</b> ngay sau Đường Thử thách; tâm trạm đặt 01 bóng Đồ án Ø74 mm (Đỏ bên sân Đỏ, Xanh bên sân Xanh).</li>
            <li><b>Tổ hợp Bục Vinh Quang (3.7)</b>, 2 bậc liên hoàn: <i>Dốc Kiên trì</i> 550 × 450 mm, nghiêng 10°, thẳng hàng phía trên Trạm Thực nghiệm, lên <i>Đài Bảo vệ</i> (Bậc 1, cao 100 mm, sát mép trên sa bàn); 02 <i>Dốc Thăng hoa</i> 500 × 450 mm, nghiêng 10°, đặt ngang hai bên (Đỏ leo trái sang phải, Xanh leo phải sang trái) lên <i>Bục Vinh Quang</i> (Bậc 2) 400 × 450 mm, cao 200 mm ở trung tâm; vách ngăn giữa bục gắn 02 nút nhấn Đèn Vinh Quang độc lập, vuông góc với hướng robot leo tới.</li>
            <li><b>Cầu Bản lĩnh (3.8):</b> cầu gỗ có dây treo nối Chặng 2 sang Chặng 3, 600 (Dài) × 550 (Rộng) × 100 (Cao) mm.</li>
            <li><b>Ô Bảo vệ Đồ án & Đế (3.9 – 3.10):</b> ô vuông 120 × 120 mm ở góc trên phía ngoài Đài Bảo vệ (3.9 Đỏ, 3.10 Xanh), <b>viền ô có gờ chặn hãm bóng cao 10 mm</b>; bên trong có 01 đế nhỏ để đặt cấu kiện Đồ án.</li>
          </ul>
          <h3 className={h3}>4. Thuật ngữ và định nghĩa</h3>
          <Table head={["STT", "Thuật ngữ", "Ký hiệu trên sa bàn", "Định nghĩa"]} rows={TERMS.map((t, i) => [i + 1, <b key="t" className="text-navy">{t[0]}</b>, t[1], t[2]])} />
        </section>

        <section id="vong-dau" className={card}>
          <h2 className={h2}>V. Các vòng đấu</h2>
          <h3 className={h3}>1. Vòng loại – xếp hạng theo điểm số</h3>
          <ul className={ul}>
            <li>Mỗi trận <b>03:00</b> (180 giây); <b>01 phút chuẩn bị</b> để đưa robot vào vị trí và xác nhận sẵn sàng với Trọng tài chính.</li>
            <li>Đội được gọi tên <b>03 lần</b> mà không có mặt bị xử thua trận đó (vòng loại tính 0 điểm); áp dụng cả Vòng Chung kết xếp hạng.</li>
            <li>Đồng hồ chạy liên tục, chỉ dừng khi Trọng tài chính ra lệnh dừng khẩn cấp do sự cố bất khả kháng (sa bàn hư hỏng cơ khí, chập điện nguy hiểm).</li>
            <li>2 robot chạy cùng lúc nhưng thực hiện nhiệm vụ độc lập. Nội dung: hoàn thành Chặng 1 và 2 cấu kiện Kiến thức ở Chặng 2.</li>
            <li>Mỗi đội thi <b>01 trận</b>, xếp hạng theo tổng điểm trận đó. Trận chỉ kết thúc sớm khi cả hai đội hoàn thành toàn bộ nội dung trước 180 giây.</li>
            <li><b>16 đội</b> xếp hạng cao nhất vào Vòng Chung kết xếp hạng.</li>
          </ul>
          <h3 className={h3}>2. Vòng Chung kết xếp hạng – đối kháng loại trực tiếp</h3>
          <ul className={ul}>
            <li>Mỗi trận <b>05:00</b> (300 giây); <b>02 phút chuẩn bị</b>.</li>
            <li>2 robot đối kháng 1 vs 1 trên toàn bộ sa bàn; đội thắng vào vòng sau. Tranh Hạng 3 thi đấu 1 trận; <b>trận Chung kết Best of 3</b> (thắng 2 trận trước là Quán quân).</li>
            <li>Cặp đấu xác định bằng bốc thăm. Màu sân (Đỏ/Xanh) bốc thăm ở trận/ván đầu; trận Bo3 đổi màu sân sau mỗi ván.</li>
            <li>Giữa các ván Bo3 trận chung kết, mỗi đội có <b>02 phút nghỉ</b> để thay pin, sửa robot.</li>
          </ul>
        </section>

        <section id="luat" className={card}>
          <h2 className={h2}>VI. Luật thi đấu</h2>
          <h3 className="mt-4 font-bold text-team-red">1. Chặng 1 · Thích nghi</h3>
          <ul className={ul}>
            <li>Khi có hiệu lệnh “BẮT ĐẦU”, thành viên điều khiển chỉ được ấn duy nhất 01 nút trên thân robot để kích hoạt dò line, rồi <b>lập tức lùi về vị trí quy định</b> cho người điều khiển và không can thiệp thêm.</li>
            <li>Robot tự động hoàn toàn, bám line đen 20 mm qua Đường Danh vọng, Checkpoint và các khúc cua của Đường Thách thức. Bắt buộc bám line suốt Chặng 1; đi tắt hoặc rời line rồi bắt lại line ở vị trí khác bị xử như mất line (−5 điểm/lần và retry).</li>
            <li>Hoàn thành Chặng 1 khi <b>ít nhất 02 bánh xe</b> cán ngang vạch chữ T cuối đường line, mở khóa Chặng 2.</li>
            <li>Tối đa <b>60 giây</b> tính từ lúc bắt đầu trận. Quá 60 giây chưa hoàn thành (TIMEOUT): chỉ 01 thành viên được nhấc robot đưa lên khu vực đích Chặng 1 để thi Chặng 2; không được điểm về đích, <b>điểm Checkpoint giữ nguyên</b>. Khi xét hòa, thời gian Chặng 1 của đội chưa về đích tính là 60 giây.</li>
            <li><b>Điểm:</b> qua hoàn toàn Checkpoint <b>+10</b>; cán đích vạch chữ T <b>+20</b>; tối đa 30 điểm. Thời gian hoàn thành Chặng 1 được bấm giờ làm chỉ số phụ khi hòa.</li>
            <li><b>Mất line:</b> tất cả bánh xe ra khỏi line mà không tự phục hồi trong 05 giây: <b>−5 điểm/lần</b>. Khi đội yêu cầu retry (tính 01 lần): chưa qua Checkpoint thì về khu vực xuất phát; đã qua thì đặt lại tại Checkpoint.</li>
            <li><b>Va chạm vách biên:</b> chạm hoặc đâm rào chắn / vách biên làn đua: <b>−5 điểm/lần</b>.</li>
          </ul>
          <h3 className={h3}>2. Chặng 2 · Bứt phá</h3>
          <ul className={ul}>
            <li>Vượt qua Chặng 1, đội dùng tay cầm điều khiển thủ công vào Chặng 2. Gặp sự cố chuyển chế độ điều khiển: được retry (tính 01 lần) ngay tại vạch đích Chặng 1.</li>
            <li>Dùng bất cứ cơ chế nào đưa bóng Kiến thức màu đội mình lên Trạm thành tựu (2.3 – 2.4): <b>+15 điểm/cấu kiện</b>. Được bắn hoặc ném bóng vào trạm, miễn nằm trọn trong trạm; không giới hạn số bóng mang cùng lúc.</li>
            <li>Khi bóng (Kiến thức, Cơ hội vàng) còn ngoài trạm, hai robot <b>được phép</b> tì đè chiến thuật, che chắn và tranh chấp trực tiếp. Bóng chỉ được công nhận và bất khả xâm phạm khi đã vượt gờ chặn, nằm trọn trong Trạm thành tựu.</li>
            <li><b>Vòng Chung kết:</b> phải tích lũy đủ 02 Kiến thức trong trạm để mở khóa quyền thu thập Cơ hội vàng <b>và</b> quyền đi qua Cầu Bản lĩnh lên Chặng 3. Đưa Cơ hội vàng nằm trọn trong trạm: <b>+30 điểm</b>, đồng thời là chỉ số phụ ưu tiên khi hòa điểm.</li>
            <li>Robot gặp sự cố trước khi được xác nhận vào Chặng 3 phải retry tại ô Chặng 2; không được đặt vào ô retry Chặng 3 để thay nhiệm vụ vượt cầu.</li>
            <li>Cố ý lấy đà đâm húc tốc độ cao phá hủy xe đối phương, hoặc ép khóa cứng robot đối phương <b>vào vách sân quá 05 giây khi không tranh chấp cấu kiện</b>: <b>−10 điểm/lần</b>.</li>
            <li>Robot hoàn toàn ra khỏi khu vực Chặng 2: <b>−10 điểm/lần</b> (Cầu Bản lĩnh là vùng chuyển tiếp: đi qua cầu khi đã đủ điều kiện mở khóa Chặng 3 không bị tính lỗi).</li>
            <li>Cố ý đẩy / húc văng bóng Kiến thức của đối phương ra ngoài biên Chặng 2: <b>−10 điểm/lần</b>, Trọng tài đặt lại bóng về vị trí ban đầu. Tự làm văng bóng của đội mình: <b>−5 điểm/lần</b>, bóng đặt lại vị trí ban đầu.</li>
            <li>Cố ý tác động cấu kiện trong Trạm thành tựu của đối phương: <b>−20 điểm/lần</b>, phục hồi nguyên trạng.</li>
            <li><b>Vòng loại:</b> hai robot thi đấu độc lập, không được sang nửa sân đối phương (<b>tính từ trục giữa sa bàn</b>) hoặc cản phá nhau: <b>−15 điểm/lần</b> và buộc retry về ô 2.1 – 2.2.</li>
            <li><b>Vòng Chung kết:</b> chưa đủ 2 Kiến thức trong trạm mà chạm vào Cơ hội vàng: <b>−10 điểm/lần</b>, Trọng tài đặt lại về Bục Cơ hội. Bị đối phương đẩy vào bóng vàng không bị phạt (Trọng tài xem xét). Bóng vàng văng ra ngoài biên được đặt lại trên Bục Cơ hội.</li>
            <li>Được chặn đường đối phương nhưng không được cầm, giữ hoặc mang bóng Kiến thức của đối phương: <b>−10 điểm/lần</b>, Trọng tài đặt lại bóng về vị trí ban đầu.</li>
          </ul>
          <h3 className="mt-4 font-bold text-team-blue">3. Chặng 3 · Thành công</h3>
          <ul className={ul}>
            <li>Robot được xác nhận vào Chặng 3 khi đã đủ điều kiện ở Chặng 2, đi qua Cầu Bản lĩnh theo lộ trình và toàn bộ robot vượt qua vạch hết cầu phía Chặng 3. Hai robot thi đấu độc lập trên sân của đội mình; nghiêm cấm sang sân đối phương hoặc cản phá nhau.</li>
            <li>Vượt Cầu Bản lĩnh (3.8): <b>+10 điểm</b>.</li>
            <li><b>Nhiệm vụ 1 – Đường Thử thách (3.3 / 3.4):</b> toàn bộ thân xe và bánh xe đi qua khỏi thanh gờ thứ 5, không đi vòng ra ngoài: <b>+20 điểm</b>. Chạm vạch giới hạn đoạn Đường Thử thách: <b>−5 điểm/lần</b>.</li>
            <li><b>Nhiệm vụ 2 – Bảo vệ Đồ án:</b> chỉ sau khi vượt hoàn toàn Đường Thử thách, robot vào Trạm Thực nghiệm (3.5 / 3.6), dùng cơ chế của mình đưa cấu kiện Đồ án vượt Dốc Kiên trì lên Đài Bảo vệ, đặt nằm vững trên đế nhỏ trong Ô Bảo vệ Đồ án (3.9 / 3.10): <b>+25 điểm</b>. Làm rơi khỏi dốc hoặc Đài: <b>−5 điểm/lần</b>, bóng về Trạm Thực nghiệm và robot phải đưa lại.</li>
            <li><b>Nhiệm vụ 3 – Đèn Vinh Quang (3.7):</b> chỉ sau khi Đồ án đã nằm vững trên đế, robot di chuyển trên Đài Bảo vệ, leo Dốc Thăng hoa vào Bục Vinh Quang và ấn trực diện nút của đội mình trên vách ngăn làm đèn sáng: đội nhấn trước <b>+40 điểm</b>, đội nhấn sau <b>+25 điểm</b>.</li>
            <li>Lộ trình bắt buộc: Cầu Bản lĩnh (3.8) ➔ Đường Thử thách (3.3 – 3.4) ➔ Trạm Thực nghiệm, đưa Đồ án vượt Dốc Kiên trì đặt lên đế trong Ô Bảo vệ Đồ án ➔ leo Dốc Thăng hoa vào Bục Vinh Quang nhấn nút Đèn Vinh Quang. Chưa đặt Đồ án lên đúng đế mà đã nhấn đèn thì kết quả nhấn không được công nhận.</li>
            <li><b>CHIẾN THẮNG TUYỆT ĐỐI (Chung kết):</b> hoàn thành theo trình tự đủ điều kiện Chặng 2 (02 Kiến thức và 01 Cơ hội vàng) ➔ vượt Cầu Bản lĩnh ➔ vượt Đường Thử thách ➔ đưa Đồ án vượt Dốc Kiên trì đặt lên đế trong Ô Bảo vệ Đồ án ➔ leo Dốc Thăng hoa vào Bục Vinh Quang ➔ nhấn sáng Đèn Vinh Quang của đội mình: trận đấu kết thúc ngay với chiến thắng tuyệt đối cho đội đó, bất chấp điểm số. Nhấn đèn trước mà chưa đủ trình tự thì không tạo ra chiến thắng tuyệt đối.</li>
            <li>Ra khỏi khu vực thi đấu Chặng 3: <b>−10 điểm/lần</b>. Lấn sang sân đối phương: <b>−15 điểm/lần</b> và buộc retry về ô 3.1 – 3.2.</li>
          </ul>

          <h3 id="diem" className={h3}>4. Bảng tổng hợp cơ cấu điểm số</h3>
          <p className="mt-3 text-sm font-bold text-navy">Điểm cộng</p>
          <Table head={["Chặng", "Nhiệm vụ thực hiện", "Điểm số / lợi thế", "Điều kiện công nhận"]} rows={SCORING.map((s) => [s.stage, s.task, <b key="p" className="text-navy">{s.pts}</b>, s.cond])} />
          <p className="mt-4 text-sm font-bold text-navy">Điểm trừ</p>
          <Table head={["Chặng", "Lỗi", "Điểm trừ", "Điều kiện tính lỗi"]} rows={PENALTIES.map((p) => [p.stage, p.name, <b key="p" className="text-mech-red">{p.pts}</b>, p.cond])} />
          <p className="mt-2 text-xs text-slate-500">Điểm tối đa không tính Chiến thắng tuyệt đối: Chặng 1 30 + Chặng 2 (2 Kiến thức 30 + Cơ hội vàng 30) + Chặng 3 (10 + 20 + 25 + 40 nếu nhấn đèn trước, 25 nếu nhấn sau) = 185 điểm. Vòng loại tối đa 30 + 30 = 60 điểm. Tổng điểm có thể âm.</p>
        </section>

        <section id="retry" className={card}>
          <h2 className={h2}>VII. Quy chế khởi động lại robot (Retry)</h2>
          <h3 className={h3}>1. Số lần và người gọi retry</h3>
          <ul className={ul}>
            <li><b>Không giới hạn</b> số lần retry trong trận.</li>
            <li>Chỉ người điều khiển chính được hô “RETRY”; <b>Trọng tài bàn giơ cờ xác nhận</b> và ghi nhận số lần retry.</li>
            <li>Đồng hồ vẫn chạy khi retry; trong thời gian retry đội được sửa chữa robot.</li>
          </ul>
          <h3 className={h3}>2. Vị trí đặt lại robot</h3>
          <ul className={ul}>
            <li>Gặp sự cố ở chặng nào chỉ được retry ở ô retry của chặng đó hoặc lùi về chặng trước.</li>
            <li>Chặng 1: về khu vực xuất phát, hoặc Checkpoint nếu đã qua. Chặng 2: ô retry Chặng 2 của đội hoặc lùi về Trạm khởi hành chạy lại Chặng 1. Chặng 3: ô retry Chặng 3 của đội.</li>
            <li>Khi retry phải đặt robot đúng vào vị trí ô retry.</li>
          </ul>
          <h3 className={h3}>3. Xử lý cấu kiện và tiến độ</h3>
          <ul className={ul}>
            <li>Chặng 2: bóng đang được giữ hoặc thao tác khi gọi retry bị coi là chưa hoàn thành, Trọng tài đặt lại vị trí ban đầu; <b>không được mang bóng về ô retry</b>.</li>
            <li>Chặng 3: đã được ghi điểm Đường Thử thách (+20) rồi gặp sự cố khi đang đẩy Đồ án lên Dốc Kiên trì, retry về ô 3.1 – 3.2 thì điểm Đường Thử thách giữ nguyên; Đồ án đặt lại tại Trạm Thực nghiệm và robot phải vượt lại Đường Thử thách để tiếp tục. Retry khi đang mang Đồ án không bị phạt.</li>
            <li>Mỗi mục điểm cộng chỉ tính <b>01 lần</b> trong trận (Kiến thức tính theo từng cấu kiện); đi lại lộ trình sau retry không được cộng thêm.</li>
          </ul>
        </section>

        <section id="phat" className={card}>
          <h2 className={h2}>VIII. Các lỗi vi phạm khác</h2>
          <h3 className={h3}>1. Lỗi khác trong thi đấu</h3>
          <Table head={["Lỗi", "Phạt"]} rows={[
            ["Chạm tay trái phép vào robot khi chưa có hiệu lệnh đồng ý retry của Trọng tài (trừ khi đưa robot lên khu vực đích Chặng 1 sau TIMEOUT)", "−10 / lần"],
            ["Xuất phát sớm: bật robot trước hiệu lệnh “Bắt đầu” (dừng robot, trả về vị trí ban đầu)", "−5"],
            ["Cản trở bất hợp pháp tại Cầu Bản lĩnh: cố tình dừng đỗ chiếm giữ cầu quá 10 giây mà không thực hiện thao tác nào, nhằm câu giờ / ngăn chặn đối phương (Trọng tài cưỡng chế lùi xe)", "−15"],
            ["Xâm phạm Trạm thành tựu: tác động đến cấu kiện bên trong Trạm thành tựu của đối phương (phục hồi nguyên trạng)", "−20"],
            ["Cố ý đẩy / húc văng cấu kiện Kiến thức của đối phương ra ngoài biên Chặng 2 (Trọng tài đặt lại về vị trí ban đầu)", "−10 / lần"],
          ].map(([n, p]) => [n, <b key="p" className="whitespace-nowrap text-mech-red">{p}</b>])} />
          <h3 className={h3}>2. Tước quyền thi đấu trận</h3>
          <ul className={ul}>
            <li><b>Cố ý đâm húc phá hủy robot đối phương:</b> dùng tốc độ cao đâm trực diện làm gãy vỡ linh kiện, đứt dây điện hoặc cháy nổ robot đối phương.</li>
            <li><b>Làm hư hỏng nặng kết cấu sa bàn:</b> đứt gãy rào chắn, sập các bục hoặc xé rách sàn thi đấu.</li>
            <li><b>Sử dụng thiết bị cấm:</b> vũ khí sắc nhọn, keo dính, thiết bị phá sóng vô tuyến.</li>
            <li>Có những hành vi trên nhận <b>01 lần cảnh cáo</b> lỗi hành vi; tiếp tục vi phạm sẽ bị Tước quyền thi đấu. Tùy lỗi và mức độ, BTC có thể Tước quyền thi đấu trực tiếp mà không cảnh cáo.</li>
          </ul>
        </section>

        <section id="ket-qua" className={card}>
          <h2 className={h2}>IX. Kết quả trận đấu & khiếu nại</h2>
          <p className="mt-3 text-sm font-bold text-navy">Tiêu chí xác định đội thắng · Vòng loại</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">{TIEBREAK_QUAL.map((t) => <li key={t}>{t}</li>)}</ol>
          <p className="mt-3 text-sm font-bold text-navy">Tiêu chí xác định đội thắng · Vòng Chung kết xếp hạng</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-700">{TIEBREAK_FINAL.map((t) => <li key={t}>{t}</li>)}</ol>
          <p className="mt-1 text-xs text-slate-500">Tổng điểm của đội trong trận đấu có thể là số âm.</p>
          <h3 className={h3}>Điều khoản khiếu nại</h3>
          <ul className={ul}>
            <li>Chỉ tiếp nhận <b>trong vòng 03 phút</b> kể từ khi có kết quả và trước khi ký biên bản; sau đó mọi khiếu nại vô giá trị. Gửi qua <Link href="/team/dashboard" className="font-semibold text-navy-600 underline">trang đội thi</Link>.</li>
            <li>Chỉ 01 người đại diện được khiếu nại với Tổ trọng tài; thành viên khác, phụ huynh, khóa trên, cổ động viên không được can thiệp. Gây áp lực tập thể bị xử thua ngay.</li>
            <li>BTC chỉ dùng camera giám sát sa bàn do BTC đặt; video điện thoại của khán giả chỉ để tham khảo.</li>
            <li>Quyết định cuối cùng thuộc về BTC và Tổ trọng tài; các đội bắt buộc chấp hành.</li>
          </ul>
        </section>

        <section id="tap-huan" className={card}>
          <h2 className={h2}>X. Tập huấn kỹ thuật</h2>
          <p className="mt-3 text-sm text-slate-700">Giúp Tân sinh viên chưa nhiều kinh nghiệm lập trình và chế tạo tự tin hoàn thiện robot đạt chuẩn. Đối tượng: <b>tất cả sinh viên đã đăng ký tham dự cuộc thi</b>.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {WORKSHOPS.map((w) => <li key={w.title}><b>{w.title}:</b> {w.desc}</li>)}
          </ul>
          <p className="mt-3 text-sm font-bold text-navy">Quyền lợi khi tham gia</p>
          <ul className={ul}>
            <li>Được BTC hỗ trợ kỹ thuật xuyên suốt quá trình làm robot.</li>
            <li>Được gặp gỡ và giải đáp thắc mắc trực tiếp từ BTC.</li>
          </ul>
          <p className="mt-3 text-sm font-bold text-mech-red">Lưu ý: mỗi đội có ít nhất 01 sinh viên tham gia tập huấn.</p>
        </section>

        <section id="giai" className={card}>
          <h2 className={h2}>Giải thưởng & chạy thử sa bàn</h2>
          <Table head={["Giải", "Giải thưởng", "Kèm theo"]} rows={PRIZES.map((p) => [<b key="r" className="text-navy">{p.rank}</b>, p.reward, p.extra || "—"])} />
          <p className="mt-3 text-sm text-slate-700">Tất cả thành viên của 16 đội lọt vào Chung kết xếp hạng được cấp Giấy chứng nhận.</p>
          <p className="mt-3 text-sm text-slate-700"><b>Chạy thử sa bàn:</b> trên sa bàn thật trước ngày thi 1 tuần; mỗi khung giờ chỉ 1 đội — <Link href="/team/practice" className="font-semibold text-navy-600 underline">đăng ký lịch chạy thử</Link>.</p>
        </section>
      </div>
    </PortalShell>
  );
}
