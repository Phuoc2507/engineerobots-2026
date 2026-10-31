// Cấu hình nội dung Landing Page. Các mốc thời gian là DỰ KIẾN — chỉnh tại đây khi BTC chốt.

export const SITE = {
  name: "FME JOURNEY 2026",
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
];

export const JOIN_STEPS = [
  { title: "Lập đội tối đa 5 người", desc: "Tân sinh viên khóa 2026 hệ chính quy HCM-UTE. Mỗi đội bắt buộc có 1 đội trưởng; mỗi bạn chỉ thuộc 1 đội." },
  { title: "Đăng ký bằng email trường", desc: "Đội trưởng đăng nhập Google @student.hcmute.edu.vn và điền MSSV các thành viên." },
  { title: "Workshop & chạy thử", desc: "Dự 2 buổi tập huấn kỹ thuật (mỗi đội ít nhất 1 bạn), đăng ký lịch chạy thử trên sa bàn thật 4800 × 4800 mm (mở trước ngày thi 1 tuần)." },
];

// status: done | current | upcoming
export const TIMELINE = [
  { title: "Mở cổng đăng ký", date: "Tháng 10/2026", desc: "Đăng ký đội tối đa 5 thành viên K26 bằng email trường.", status: "current" },
  { title: "2 buổi tập huấn kỹ thuật", date: "BTC thông báo sau", desc: "Buổi 1 cơ khí & điện tử cơ bản, Buổi 2 lập trình PID & điều khiển không dây.", status: "upcoming" },
  { title: "Open Field Test", date: "Trước 1 tuần", desc: "Chạy thử trên sa bàn thật tại Maker Space, đăng ký khung giờ trên web để không trùng lịch.", status: "upcoming", href: "/team/practice", cta: "Đặt lịch thử" },
  { title: "Vòng loại", date: "Dự kiến", desc: "Mỗi đội 1 trận 180 giây, xếp hạng theo điểm số: Chặng 1 và 2 cấu kiện Kiến thức. Top 16 đi tiếp.", status: "upcoming" },
  { title: "Chung kết xếp hạng", date: "Dự kiến", desc: "300 giây/trận, 16 đội bốc thăm cặp đấu, đối kháng 1 vs 1 loại trực tiếp; tranh hạng ba 1 trận, chung kết Bo3. Trao giải & bình chọn khán giả.", status: "upcoming" },
] as const;

export const ROBOT_SPECS = [
  { label: "Kích thước tối đa (khi bung)", value: "≤ 400 × 350 × 250 mm (+10)" },
  { label: "Nguồn DC", value: "12 V (+0,6 V)" },
  { label: "Cơ cấu", value: "Tự do: càng đẩy, con lăn, tay gắp…" },
  { label: "Khối lượng", value: "≤ 2,5 kg (cả pin, +100 g)" },
  { label: "Điều khiển", value: "C1 tự hành · C2–3 từ xa" },
];

export const PRIZES = [
  { rank: "Giải Nhất", reward: "Hiện kim + Giấy chứng nhận", extra: "" },
  { rank: "Giải Nhì", reward: "Hiện kim + Giấy chứng nhận", extra: "" },
  { rank: "Giải Ba", reward: "Hiện kim + Giấy chứng nhận", extra: "" },
  { rank: "Khuyến khích", reward: "Hiện kim + Giấy chứng nhận", extra: "" },
  { rank: "Được yêu thích nhất", reward: "Hiện kim + Giấy chứng nhận", extra: "Bình chọn qua Fanpage" },
];

// TODO(BTC): điền ngày 2 buổi tập huấn (thể lệ để trống "ngày … tháng … năm 2026")
export const WORKSHOPS = [
  { title: "Buổi 1 · Cơ khí & Điện tử cơ bản", desc: "Thời gian BTC thông báo sau. Nền tảng thiết kế cơ khí, điện tử cơ bản, cách dùng cảm biến dò line; hỏi đáp kỹ thuật và thể lệ." },
  { title: "Buổi 2 · Lập trình", desc: "Thời gian BTC thông báo sau. Điều khiển động cơ, thuật toán dò line PID, tích hợp điều khiển không dây; hỏi đáp trực tiếp." },
];

export const STUDENT_DOMAIN = "student.hcmute.edu.vn";

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
