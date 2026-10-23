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
  { href: "#giai-thuong", label: "Giải thưởng" },
  { href: "#lich-trinh", label: "Lịch trình" },
  { href: "#hoi-dap", label: "Hỏi đáp" },
];

export const JOIN_STEPS = [
  { title: "Lập đội tối đa 5 người", desc: "Tân sinh viên K26 Khoa Cơ khí, khác ngành vẫn được ghép chung. Mỗi đội có 1 đội trưởng." },
  { title: "Đăng ký bằng email trường", desc: "Đội trưởng đăng nhập Google @student.hcmute.edu.vn và điền MSSV các thành viên." },
  { title: "Workshop & chạy thử", desc: "Tham gia 3 workshop kỹ thuật, đặt lịch Open Field Test trên sa bàn thật 4,8 × 4,8 m." },
];

// status: done | current | upcoming
export const TIMELINE = [
  { title: "Mở cổng đăng ký", date: "Tháng 10/2026", desc: "Đăng ký đội tối đa 5 thành viên K26 bằng email trường.", status: "current" },
  { title: "Chuỗi 3 Workshop kỹ thuật", date: "Dự kiến", desc: "CAD & gia công khung, mạch driver – cảm biến, thuật toán PID & điều khiển không dây.", status: "upcoming" },
  { title: "Open Field Test", date: "Trước 2 tuần", desc: "Chạy thử trên sa bàn thật tại Maker Space, đặt slot qua hệ thống.", status: "upcoming" },
  { title: "Vòng bảng", date: "Dự kiến", desc: "Bảng 3–4 đội đấu vòng tròn, chọn 2 đội đầu bảng đi tiếp.", status: "upcoming" },
  { title: "Loại trực tiếp & Chung kết", date: "Dự kiến", desc: "Tứ kết, bán kết loại trực tiếp; chung kết Bo3. Trao giải & bình chọn khán giả.", status: "upcoming" },
] as const;

export const ROBOT_SPECS = [
  { label: "Kích thước xuất phát", value: "≤ 300 × 250 × 200 mm" },
  { label: "Dung sai", value: "+10 mm" },
  { label: "Nguồn DC", value: "≤ 12,6 V" },
  { label: "Khối lượng", value: "Không giới hạn" },
  { label: "Chặng 1", value: "100% tự hành" },
  { label: "Chặng 2–3", value: "Remote 2,4 GHz" },
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
    a: "BTC phát bộ kit cơ bản sau buổi họp kỹ thuật. Đội được tự bổ sung linh kiện miễn là robot đạt quy chuẩn kích thước (≤ 300 × 250 × 200 mm, dung sai +10 mm) và nguồn DC ≤ 12,6 V. Cấm nguồn AC và pin trên 14,8 V.",
  },
  {
    q: "Làm sao để thử robot trên sa bàn thật?",
    a: "Sau khi được duyệt, đội trưởng đặt lịch Open Field Test (mở trước ngày thi 2 tuần tại Maker Space) theo slot 15–20 phút trong trang quản lý đội.",
  },
  {
    q: "Robot có được điều khiển từ xa không?",
    a: "Chặng 1 bắt buộc tự hành 100%, chỉ có một nút khởi động. Từ Chặng 2 được dùng tay điều khiển không dây 2,4 GHz. Cấm thiết bị gây nhiễu sóng.",
  },
];

export const PRIZES = [
  { rank: "Giải Nhất", reward: "1.500.000đ", extra: "Cúp Vô địch + Giấy khen BCN Khoa" },
  { rank: "Giải Nhì", reward: "1.200.000đ", extra: "Huy chương Bạc + Giấy khen BCN Khoa" },
  { rank: "Giải Ba", reward: "800.000đ", extra: "Huy chương Đồng + Giấy khen BCN Khoa" },
  { rank: "Khuyến khích", reward: "500.000đ", extra: "Giấy chứng nhận BTC" },
  { rank: "Được yêu thích nhất", reward: "500.000đ", extra: "Bình chọn qua Fanpage" },
];

export const WORKSHOPS = [
  { title: "Workshop 1 · Cơ khí", desc: "Thiết kế khung vỏ 3D CAD, cắt laser mica/nhôm, in 3D FDM; chọn động cơ DC giảm tốc và bánh xe." },
  { title: "Workshop 2 · Điện tử", desc: "Mạch driver H-Bridge L298N/TB6612, cảm biến dò line hồng ngoại, Arduino/ESP32." },
  { title: "Workshop 3 · Lập trình", desc: "Thuật toán dò line PID thích nghi và điều khiển không dây an toàn." },
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
