// Cấu hình nội dung Landing Page. Các mốc thời gian là DỰ KIẾN — chỉnh tại đây khi BTC chốt.

export const SITE = {
  name: "ENGINEERING PATH 2026",
  theme: "Hành trình Kỹ sư Cơ khí",
  faculty: "Khoa Cơ khí – HCM-UTE",
  organizer: "Đoàn – Hội Khoa Cơ khí & CLB NCKH CK (FMES)",
  // TODO(BTC): chốt hạn đóng cổng đăng ký
  registrationDeadline: "2026-11-15T23:59:59+07:00",
};

export const NAV_LINKS = [
  { href: "#gioi-thieu", label: "Giới thiệu" },
  { href: "#the-le", label: "Thể lệ" },
  { href: "#sa-ban-3d", label: "Sa bàn" },
  { href: "#giai-thuong", label: "Giải thưởng" },
  { href: "#lich-trinh", label: "Lịch trình" },
  { href: "#hoi-dap", label: "Hỏi đáp" },
];

export const JOIN_STEPS = [
  { title: "Lập đội tối đa 5 người", desc: "Tân sinh viên khóa 2026 hệ chính quy HCM-UTE. Mỗi đội bắt buộc có 1 đội trưởng; mỗi bạn chỉ thuộc 1 đội." },
  { title: "Đăng ký bằng email trường", desc: "Đội trưởng đăng nhập Google @student.hcmute.edu.vn và điền MSSV các thành viên." },
  { title: "Workshop & chạy thử", desc: "Dự 2 buổi tập huấn kỹ thuật (mỗi đội ít nhất 1 bạn), đặt lịch chạy thử trên sa bàn thật 4,8 × 4,8 m." },
];

// status: done | current | upcoming
export const TIMELINE = [
  { title: "Mở cổng đăng ký", date: "Tháng 10/2026", desc: "Đăng ký đội tối đa 5 thành viên K26 bằng email trường.", status: "current" },
  { title: "2 buổi tập huấn kỹ thuật", date: "Dự kiến 8:00", desc: "Buổi 1 cơ khí & điện tử cơ bản, Buổi 2 lập trình PID & điều khiển không dây.", status: "upcoming" },
  { title: "Open Field Test", date: "Trước 2 tuần", desc: "Chạy thử trên sa bàn thật tại Maker Space, đặt slot qua hệ thống.", status: "upcoming" },
  { title: "Vòng loại", date: "Dự kiến", desc: "Mỗi đội 1 trận 180 giây, xếp hạng theo điểm số: Chặng 1 và 2 cấu kiện Kiến thức. Top 16 đi tiếp.", status: "upcoming" },
  { title: "Chung kết xếp hạng", date: "Dự kiến", desc: "300 giây/trận, 16 đội bốc thăm cặp đấu, đối kháng 1 vs 1 loại trực tiếp; tranh hạng ba 1 trận, chung kết Bo3. Trao giải & bình chọn khán giả.", status: "upcoming" },
] as const;

export const ROBOT_SPECS = [
  { label: "Kích thước xuất phát", value: "≤ 300 × 250 × 200 mm (+10)" },
  { label: "Khi bung cơ cấu", value: "≤ 400 × 350 × 250 mm (+10)" },
  { label: "Nguồn DC", value: "12 V (+0,6 V)" },
  { label: "Cơ cấu", value: "Tự do: càng đẩy, con lăn, tay gắp…" },
  { label: "Khối lượng", value: "≤ 2,5 kg (cả pin, +100 g)" },
  { label: "Điều khiển", value: "C1 tự hành · C2–3 từ xa" },
];

export const FAQ = [
  {
    q: "Chưa biết lập trình hay cơ khí có tham gia được không?",
    a: "Được. Cuộc thi dành cho tân sinh viên nên BTC tổ chức buổi họp kỹ thuật và tập huấn trước khi thi. Chỉ cần kiến thức cơ bản về Arduino/vi điều khiển là đủ để bắt đầu.",
  },
  {
    q: "Có mất phí tham dự không?",
    a: "Không. Cuộc thi miễn phí 100%, được tài trợ bởi Khoa Cơ khí và doanh nghiệp đồng hành.",
  },
  {
    q: "Đội có thể ghép sinh viên khác ngành không?",
    a: "Có. Thể lệ chỉ yêu cầu tất cả thành viên là tân sinh viên khóa 2026 hệ chính quy của HCM-UTE, không giới hạn ngành hay khoa.",
  },
  {
    q: "Linh kiện lấy ở đâu? Có được dùng linh kiện tự mua không?",
    a: "BTC phát bộ kit cơ bản sau buổi họp kỹ thuật. Đội được tự bổ sung linh kiện miễn là robot đạt quy chuẩn kích thước (xuất phát ≤ 300 × 250 × 200 mm, bung cơ cấu tối đa 400 × 350 × 250 mm, dung sai +10 mm) và nguồn DC tối đa 12 V (dung sai +0,6 V). Cơ cấu thu thập bóng tùy chọn (càng đẩy, con lăn, tay gắp, ngàm kẹp…), bề mặt tiếp xúc phải mềm. Cấm nguồn AC.",
  },
  {
    q: "Làm sao để thử robot trên sa bàn thật?",
    a: "Sau khi được duyệt, đội trưởng đặt lịch Open Field Test (mở trước ngày thi 2 tuần tại Maker Space) theo slot 15–20 phút trong trang quản lý đội.",
  },
  {
    q: "Robot có được điều khiển từ xa không?",
    a: "Chặng 1 bắt buộc tự hành 100%, chỉ ấn nút khởi động một lần; tay cầm được kết nối sẵn nhưng phải đặt xuống đất suốt Chặng 1. Sau khi hoàn thành Chặng 1 được điều khiển từ xa (RF, Bluetooth, Wifi, gamepad không dây…). Cấm thiết bị gây nhiễu sóng.",
  },
];

export const PRIZES = [
  { rank: "Giải Nhất", reward: "1.500.000đ", extra: "Cúp Vô địch + Giấy khen BCN Khoa" },
  { rank: "Giải Nhì", reward: "1.200.000đ", extra: "Huy chương Bạc + Giấy khen BCN Khoa" },
  { rank: "Giải Ba", reward: "800.000đ", extra: "Huy chương Đồng + Giấy khen BCN Khoa" },
  { rank: "Khuyến khích", reward: "500.000đ", extra: "Giấy chứng nhận BTC" },
  { rank: "Được yêu thích nhất", reward: "500.000đ", extra: "Bình chọn qua Fanpage" },
];

// TODO(BTC): điền ngày 2 buổi tập huấn (thể lệ để trống "ngày … tháng … năm 2026")
export const WORKSHOPS = [
  { title: "Buổi 1 · Cơ khí & Điện tử cơ bản", desc: "8:00, ngày BTC thông báo sau. Nền tảng thiết kế cơ khí, điện tử cơ bản, cách dùng cảm biến dò line; hỏi đáp kỹ thuật và thể lệ." },
  { title: "Buổi 2 · Lập trình", desc: "8:00, ngày BTC thông báo sau. Điều khiển động cơ, thuật toán dò line PID, tích hợp điều khiển không dây; hỏi đáp trực tiếp." },
];

export const STUDENT_DOMAIN = "student.hcmute.edu.vn";
export const MAJORS = ["Cơ điện tử", "Chế tạo máy", "Kỹ thuật Ô tô", "Robot & Trí tuệ nhân tạo", "Tự động hóa", "Ngành khác"];

// TODO(BTC): điền thông tin liên hệ thật — hiện ở footer, trang đăng nhập BTC và email gửi đội
export const CONTACT = {
  email: "", // vd: engineerobots@hcmute.edu.vn
  phone: "", // vd: 0901 234 567 (Trưởng BTC)
  fanpage: "", // vd: https://facebook.com/...
  zaloGroup: "", // link nhóm Zalo các đội trưởng
  address: "Khoa Cơ khí – HCMUTE, 1 Võ Văn Ngân, Thủ Đức, TP.HCM",
};

export const STAFF_ROLES: Record<string, string> = { BTC: "Ban tổ chức", HEAD_REFEREE: "Trọng tài chính", REFEREE: "Trọng tài" };

// Hạng mục bình chọn khán giả (khớp CHECK trong cast_vote)
export const VOTE_CATEGORIES = [
  { key: "FAN_FAVORITE", label: "Đội được yêu thích nhất" },
  { key: "MOST_CREATIVE_ROBOT", label: "Robot sáng tạo nhất" },
  { key: "BEST_DESIGN", label: "Thiết kế đẹp nhất" },
];

export const MATCH_STATUS: Record<string, string> = {
  SCHEDULED: "Sắp đấu", READY: "Chuẩn bị", RUNNING: "Đang đấu", PAUSED: "Tạm dừng", FINISHED: "Kết thúc",
};
