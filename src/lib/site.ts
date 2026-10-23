// Cấu hình nội dung Landing Page. Các mốc thời gian là DỰ KIẾN — chỉnh tại đây khi BTC chốt.

export const SITE = {
  name: "ENGINEEROBOTS 2026",
  theme: "Hành trình Kỹ sư Cơ khí",
  faculty: "Khoa Cơ khí – HCMUTE",
  organizer: "Đoàn – Hội Khoa Cơ khí & CLB Robot Cơ khí (FMES)",
  // TODO(BTC): chốt hạn đóng cổng đăng ký
  registrationDeadline: "2026-11-15T23:59:59+07:00",
};

export const NAV_LINKS = [
  { href: "#gioi-thieu", label: "Giới thiệu" },
  { href: "#the-le", label: "Thể lệ" },
  { href: "#sa-ban-3d", label: "Sa bàn" },
  { href: "#lich-trinh", label: "Lịch trình" },
  { href: "#hoi-dap", label: "Hỏi đáp" },
];

export const JOIN_STEPS = [
  { title: "Lập đội 3–5 người", desc: "Tất cả là tân sinh viên K26 Khoa Cơ khí, khác ngành vẫn được ghép chung." },
  { title: "Đăng ký bằng email trường", desc: "Đội trưởng đăng nhập Google @student.hcmute.edu.vn và điền MSSV các thành viên." },
  { title: "Nhận kit & tập huấn", desc: "BTC duyệt hồ sơ, phát bộ linh kiện cơ bản và mở lịch thử sa bàn." },
];

// status: done | current | upcoming
export const TIMELINE = [
  { title: "Mở cổng đăng ký", date: "Tháng 10/2026", desc: "Đăng ký đội 3–5 thành viên K26 bằng email trường.", status: "current" },
  { title: "Họp kỹ thuật & Phát kit", date: "Dự kiến", desc: "Phổ biến thể lệ, phát bộ linh kiện cơ bản cho các đội.", status: "upcoming" },
  { title: "Tập huấn Chặng 1 & 2", date: "Dự kiến", desc: "Đặt lịch thử sa bàn theo slot 15–20 phút qua hệ thống.", status: "upcoming" },
  { title: "Vòng loại 32 đội", date: "Dự kiến", desc: "Thi đấu vòng bảng, phân hạng bằng chỉ số phụ tự động.", status: "upcoming" },
  { title: "Chung kết đối kháng", date: "Dự kiến", desc: "Knock-out Đỏ vs Xanh, trao giải & bình chọn khán giả.", status: "upcoming" },
] as const;

export const ROBOT_SPECS = [
  { label: "Kích thước", value: "≤ 200 × 200 × 200 mm" },
  { label: "Khối lượng", value: "≤ 2 kg" },
  { label: "Nguồn điện", value: "≤ 12 V" },
  { label: "Động cơ", value: "DC / Servo tiêu chuẩn" },
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
    a: "Có, miễn là tất cả thành viên đều là sinh viên K26 thuộc Khoa Cơ khí (Cơ điện tử, Chế tạo máy, Ô tô, Robot & AI, Tự động hóa…).",
  },
  {
    q: "Linh kiện lấy ở đâu? Có được dùng linh kiện tự mua không?",
    a: "BTC phát bộ kit cơ bản sau buổi họp kỹ thuật. Đội được tự bổ sung linh kiện miễn là robot đạt quy chuẩn kích thước, khối lượng và điện áp.",
  },
  {
    q: "Làm sao để thử robot trên sa bàn thật?",
    a: "Sau khi được duyệt, đội trưởng đặt lịch thử sa bàn theo slot 15–20 phút trong trang quản lý đội.",
  },
];

export const STUDENT_DOMAIN = "student.hcmute.edu.vn";
export const MAJORS = ["Cơ điện tử", "Chế tạo máy", "Kỹ thuật Ô tô", "Robot & Trí tuệ nhân tạo", "Tự động hóa", "Khác (Khoa Cơ khí)"];

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
