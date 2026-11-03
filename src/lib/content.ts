// Nội dung & giao diện trang mà BTC tự sửa ở /admin/content.
// Mặc định lấy từ site.ts; bản BTC đã sửa lưu ở bảng site_content (mỗi mục 1 dòng, ghi đè từng trường).
import { CONTACT, JOIN_STEPS, PRIZES, ROBOT_SPECS, SITE, TIMELINE, WORKSHOPS } from "@/lib/site";

export const DEFAULT_CONTENT = {
  site: {
    name: SITE.name,
    theme: SITE.theme,
    faculty: SITE.faculty,
    organizer: SITE.organizer,
    registrationStart: SITE.registrationStart,
    registrationDeadline: SITE.registrationDeadline,
    countdownNote: "Thời gian đăng ký: 02/11 – hết ngày 11/11/2026",
  },
  announce: {
    publicOn: false,
    publicText: "",
    publicLink: "",
    publicLinkLabel: "Xem chi tiết",
    publicTone: "info",
    staffOn: false,
    staffText: "",
  },
  hero: {
    kicker: `${SITE.faculty} · Tân sinh viên K26`,
    title1: "FME Journey",
    title2: "2026",
    intro: `Chủ đề **“${SITE.theme}”**. Thiết kế, chế tạo và lập trình robot tự hành **dò line**, tích lũy **Cấu kiện tri thức** rồi vượt địa hình, bảo vệ **Đồ án** và nhấn sáng **Đèn Vinh Quang**.`,
    chips: [{ text: "Đội tối đa 5 người" }, { text: "Chỉ dành cho K26" }, { text: "Miễn phí 100%" }],
    ctaPrimary: "Đăng ký đội thi",
    ctaSecondary: "Xem sa bàn 3D",
  },
  intro: {
    kicker: "Giới thiệu",
    title: "Sân chơi đầu tiên của kỹ sư K26",
    body: "FME JOURNEY 2026 là một đấu trường robot mô phỏng “Hành trình trưởng thành của một kỹ sư Cơ khí”. Nơi mỗi thử thách là một cột mốc quan trọng, giúp những tân binh Cơ khí phát triển tư duy, kỹ năng và bản lĩnh để chinh phục những giới hạn mới.",
    stats: [
      { value: "32–64", label: "Đội thi dự kiến" },
      { value: "≤ 5", label: "Thành viên / đội" },
      { value: "3", label: "Chặng thi đấu" },
      { value: "0đ", label: "Lệ phí tham dự" },
    ],
    stepsTitle: "Tham gia chỉ với",
    stepsHighlight: "3 bước",
    steps: JOIN_STEPS.map((s) => ({ ...s })),
  },
  arena: {
    kicker: "Sa bàn thi đấu",
    title: "Sa bàn 4800 × 4800 mm",
    text: "Một sa bàn chung, ba vùng thi đấu nối tiếp nhau. Xoay, phóng to mô hình 3D để xem kích thước từng chi tiết.",
    video: "/videos/mo-phong-tran-dau.mp4",
    poster: "/images/mo-phong-tran-dau.jpg",
    videoLabel: "Mô phỏng trận đấu",
    zones: [
      { tag: "Chặng 1", title: "Hai làn dò line", desc: "Làn 900 mm dọc hai mép, line đen 20 mm: Đường Danh vọng thẳng 1800 mm tới Checkpoint, Đường Thách thức ziczac 45°, vạch đích chữ T." },
      { tag: "Chặng 2", title: "Cấu kiện & Bục Cơ hội", desc: "4 bóng pickleball Kiến thức Ø74 mm (2 Đỏ, 2 Xanh), Bục Cơ hội 400 × 400 mm cao 50 mm mang bóng Cơ hội vàng, 2 Trạm thành tựu 300 × 300 mm có gờ chặn ở hai cánh sân." },
      { tag: "Chặng 3", title: "Cầu Bản lĩnh & Bục Vinh Quang", desc: "Cầu gỗ 600 × 550 mm, 2 sân độc lập: Đường Thử thách 5 thanh gờ, Trạm Thực nghiệm, Dốc Kiên trì 10° lên Đài Bảo vệ 100 mm, Dốc Thăng hoa lên Đỉnh 200 mm có Đèn Vinh Quang." },
    ],
  },
  prizes: {
    kicker: "Giải thưởng & hỗ trợ",
    title: "Giải thưởng hấp dẫn",
    items: PRIZES.map((p) => ({ ...p })),
    notes: "Tất cả thành viên của 16 đội lọt vào Chung kết xếp hạng được nhận Giấy chứng nhận.\nTất cả thành viên của đội thi tham gia từ vòng loại sẽ được cộng điểm rèn luyện theo quy định của nhà trường.",
    workshops: WORKSHOPS.map((w) => ({ ...w })),
  },
  timeline: {
    kicker: "Lịch trình",
    title: "Các mốc quan trọng",
    items: TIMELINE.map((t) => ({ title: t.title, date: t.date, desc: t.desc, status: t.status as string, href: "href" in t ? t.href : "", cta: "cta" in t ? t.cta : "" })),
  },
  cta: {
    title: "Sẵn sàng chế tạo robot?",
    text: "Đăng ký bằng tài khoản Google email trường **@student.hcmute.edu.vn**. 100% thành viên phải là sinh viên K26 – hệ thống tự xác thực qua MSSV.",
    button: "Đăng ký ngay",
  },
  contact: {
    person: CONTACT.person,
    phone: CONTACT.phone,
    email: CONTACT.email,
    fanpage: CONTACT.fanpage,
    zaloGroup: CONTACT.zaloGroup,
    zaloQr: CONTACT.zaloQr,
  },
  rules: {
    pdf: "/docs/the-le-fme-journey-2026.pdf",
    drawingPdf: "/models/ban-ve-sa-ban-2026.pdf",
    arenaImage: "/images/sa-ban-2026.png",
    robotSpecs: ROBOT_SPECS.map((s) => ({ ...s })),
  },
  stage: {
    idleTitle: SITE.name,
    idleText: "Trận đấu sẽ bắt đầu trong ít phút",
  },
  theme: {
    navy: "#06305E",
    navy600: "#0070B8",
    navy900: "#031D3A",
    red: "#D7262F",
    gold: "#FFC20E",
    fmes: "#20A8E0",
    ice: "#F2F7FC",
    teamRed: "#E53935",
    teamBlue: "#1E88E5",
  },
};

export type Content = typeof DEFAULT_CONTENT;
export type ContentKey = keyof Content;

// Ghép bản BTC đã sửa lên mặc định theo từng trường (danh sách thay nguyên khối); bỏ qua trường sai kiểu
export function mergeContent(rows: { key: string; value: unknown }[]): Content {
  const out = structuredClone(DEFAULT_CONTENT) as Record<string, Record<string, unknown>>;
  for (const { key, value } of rows) {
    const base = out[key];
    if (!base || !value || typeof value !== "object") continue;
    for (const [f, v] of Object.entries(value as Record<string, unknown>)) {
      if (!(f in base) || v == null) continue;
      if (Array.isArray(base[f]) !== Array.isArray(v) || typeof base[f] !== typeof v) continue;
      base[f] = v;
    }
  }
  return out as unknown as Content;
}

// Biến màu CSS cho Tailwind (rgb không dấu phẩy để dùng được độ mờ bg-navy/30)
export const THEME_VARS: Record<keyof Content["theme"], string> = {
  navy: "--c-navy", navy600: "--c-navy-600", navy900: "--c-navy-900", red: "--c-red", gold: "--c-gold",
  fmes: "--c-fmes", ice: "--c-ice", teamRed: "--c-team-red", teamBlue: "--c-team-blue",
};
const rgb = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
export function themeCss(theme: Content["theme"]) {
  const vars = (Object.keys(THEME_VARS) as (keyof Content["theme"])[])
    .filter((k) => theme[k] !== DEFAULT_CONTENT.theme[k])
    .map((k) => { const v = rgb(theme[k]); return v ? `${THEME_VARS[k]}:${v};` : ""; })
    .join("");
  return vars ? `:root{${vars}}` : "";
}

// ───────── Mô tả form cho trang sửa nội dung ─────────
export type FieldType = "text" | "textarea" | "datetime" | "url" | "file" | "bool" | "select" | "color";
export type Field = {
  k: string; label: string; type: FieldType; hint?: string;
  options?: { value: string; label: string }[];
  accept?: string;
};
export type ListField = { k: string; label: string; type: "list"; item: Field[]; hint?: string };
export type Section = { key: ContentKey; title: string; desc: string; where: string; fields: (Field | ListField)[] };

const IMG = "image/png,image/jpeg,image/webp,image/gif";
const RICH = "Bao chữ trong **hai dấu sao** để in đậm.";

export const CONTENT_SECTIONS: Section[] = [
  {
    key: "site", title: "Thông tin chung", where: "Mọi trang", desc: "Tên cuộc thi, đơn vị tổ chức và thời gian đăng ký (đồng hồ đếm ngược + hạn khóa đăng ký trong hệ thống).",
    fields: [
      { k: "name", label: "Tên cuộc thi", type: "text" },
      { k: "theme", label: "Chủ đề", type: "text" },
      { k: "faculty", label: "Đơn vị chỉ đạo", type: "text" },
      { k: "organizer", label: "Đơn vị tổ chức", type: "text" },
      { k: "registrationStart", label: "Mở đăng ký", type: "datetime" },
      { k: "registrationDeadline", label: "Đóng đăng ký", type: "datetime", hint: "Hệ thống tự khóa đăng ký sau thời điểm này." },
      { k: "countdownNote", label: "Dòng ghi chú dưới đồng hồ đếm ngược", type: "text" },
    ],
  },
  {
    key: "announce", title: "Thông báo nổi bật", where: "Trang chủ, trang sinh viên, khu BTC", desc: "Dải thông báo hiện trên cùng trang công khai, và dải riêng cho khu vực BTC / trọng tài.",
    fields: [
      { k: "publicOn", label: "Bật thông báo trên web công khai", type: "bool" },
      { k: "publicText", label: "Nội dung (web công khai)", type: "textarea", hint: RICH },
      { k: "publicLink", label: "Đường dẫn kèm theo (không bắt buộc)", type: "url" },
      { k: "publicLinkLabel", label: "Chữ trên nút đường dẫn", type: "text" },
      { k: "publicTone", label: "Màu", type: "select", options: [{ value: "info", label: "Xanh – thông tin" }, { value: "warn", label: "Vàng – lưu ý" }, { value: "urgent", label: "Đỏ – khẩn" }] },
      { k: "staffOn", label: "Bật thông báo nội bộ cho BTC / trọng tài / thư ký", type: "bool" },
      { k: "staffText", label: "Nội dung (nội bộ)", type: "textarea", hint: RICH },
    ],
  },
  {
    key: "hero", title: "Đầu trang chủ", where: "Trang chủ", desc: "Khối giới thiệu lớn trên cùng trang chủ.",
    fields: [
      { k: "kicker", label: "Dòng nhỏ phía trên", type: "text" },
      { k: "title1", label: "Tiêu đề dòng 1", type: "text" },
      { k: "title2", label: "Tiêu đề dòng 2 (chữ vàng)", type: "text" },
      { k: "intro", label: "Đoạn giới thiệu", type: "textarea", hint: RICH },
      { k: "chips", label: "Nhãn nổi bật", type: "list", item: [{ k: "text", label: "Nội dung", type: "text" }] },
      { k: "ctaPrimary", label: "Nút chính (tới trang đăng ký)", type: "text" },
      { k: "ctaSecondary", label: "Nút phụ (tới sa bàn 3D)", type: "text" },
    ],
  },
  {
    key: "intro", title: "Giới thiệu & cách tham gia", where: "Trang chủ", desc: "Mục Giới thiệu, các con số và các bước tham gia.",
    fields: [
      { k: "kicker", label: "Nhãn mục", type: "text" },
      { k: "title", label: "Tiêu đề", type: "text" },
      { k: "body", label: "Nội dung", type: "textarea", hint: RICH },
      { k: "stats", label: "Các con số", type: "list", item: [{ k: "value", label: "Số", type: "text" }, { k: "label", label: "Chú thích", type: "text" }] },
      { k: "stepsTitle", label: "Tiêu đề khối các bước", type: "text" },
      { k: "stepsHighlight", label: "Phần chữ vàng của tiêu đề", type: "text" },
      { k: "steps", label: "Các bước", type: "list", item: [{ k: "title", label: "Bước", type: "text" }, { k: "desc", label: "Mô tả", type: "textarea" }] },
    ],
  },
  {
    key: "arena", title: "Sa bàn & video", where: "Trang chủ, trang Sa bàn 3D", desc: "Mục Sa bàn thi đấu: video mô phỏng, ảnh bìa video và mô tả từng chặng.",
    fields: [
      { k: "kicker", label: "Nhãn mục", type: "text" },
      { k: "title", label: "Tiêu đề", type: "text" },
      { k: "text", label: "Mô tả", type: "textarea" },
      { k: "video", label: "Video (MP4, tối đa 50 MB)", type: "file", accept: "video/mp4,video/webm" },
      { k: "poster", label: "Ảnh bìa video", type: "file", accept: IMG },
      { k: "videoLabel", label: "Nhãn góc video", type: "text" },
      { k: "zones", label: "Các chặng", type: "list", item: [{ k: "tag", label: "Nhãn", type: "text" }, { k: "title", label: "Tên", type: "text" }, { k: "desc", label: "Mô tả", type: "textarea" }] },
    ],
  },
  {
    key: "prizes", title: "Giải thưởng & tập huấn", where: "Trang chủ, trang Thể lệ", desc: "Cơ cấu giải thưởng, ghi chú và các buổi tập huấn.",
    fields: [
      { k: "kicker", label: "Nhãn mục", type: "text" },
      { k: "title", label: "Tiêu đề", type: "text" },
      { k: "items", label: "Các giải", type: "list", hint: "Phần thưởng có dấu “ + ” sẽ được tách 2 dòng.", item: [{ k: "rank", label: "Giải", type: "text" }, { k: "reward", label: "Phần thưởng", type: "text" }, { k: "extra", label: "Ghi chú", type: "text" }] },
      { k: "notes", label: "Ghi chú dưới bảng giải (mỗi dòng một ý)", type: "textarea" },
      { k: "workshops", label: "Các buổi tập huấn", type: "list", item: [{ k: "title", label: "Buổi", type: "text" }, { k: "desc", label: "Nội dung / thời gian", type: "textarea" }] },
    ],
  },
  {
    key: "timeline", title: "Lịch trình", where: "Trang chủ, trang Lịch thi", desc: "Các mốc thời gian. Mốc “Đang diễn ra” được tô đỏ.",
    fields: [
      { k: "kicker", label: "Nhãn mục", type: "text" },
      { k: "title", label: "Tiêu đề", type: "text" },
      {
        k: "items", label: "Các mốc", type: "list", item: [
          { k: "title", label: "Tên mốc", type: "text" },
          { k: "date", label: "Thời gian", type: "text" },
          { k: "desc", label: "Mô tả", type: "textarea" },
          { k: "status", label: "Trạng thái", type: "select", options: [{ value: "done", label: "Đã xong" }, { value: "current", label: "Đang diễn ra" }, { value: "upcoming", label: "Sắp tới" }] },
          { k: "href", label: "Đường dẫn nút (không bắt buộc)", type: "url" },
          { k: "cta", label: "Chữ trên nút", type: "text" },
        ],
      },
    ],
  },
  {
    key: "cta", title: "Kêu gọi đăng ký", where: "Trang chủ", desc: "Dải đỏ cuối trang chủ.",
    fields: [
      { k: "title", label: "Tiêu đề", type: "text" },
      { k: "text", label: "Nội dung", type: "textarea", hint: RICH },
      { k: "button", label: "Chữ trên nút", type: "text" },
    ],
  },
  {
    key: "contact", title: "Liên hệ & nhóm Zalo", where: "Chân trang, trang đội thi, email gửi đội", desc: "Thông tin liên hệ. Mục để trống sẽ tự ẩn.",
    fields: [
      { k: "person", label: "Người liên hệ", type: "text" },
      { k: "phone", label: "Số điện thoại", type: "text" },
      { k: "email", label: "Email", type: "text" },
      { k: "fanpage", label: "Fanpage", type: "url" },
      { k: "zaloGroup", label: "Link nhóm Zalo (chỉ đội đã đăng ký thấy)", type: "url" },
      { k: "zaloQr", label: "Ảnh mã QR nhóm Zalo", type: "file", accept: IMG },
    ],
  },
  {
    key: "rules", title: "Thể lệ & tài liệu", where: "Trang Thể lệ, trang chủ", desc: "File thể lệ, bản vẽ sa bàn, sơ đồ sa bàn và bảng quy chuẩn robot.",
    fields: [
      { k: "pdf", label: "File thể lệ chính thức (PDF)", type: "file", accept: "application/pdf" },
      { k: "drawingPdf", label: "Bản vẽ kỹ thuật sa bàn (PDF)", type: "file", accept: "application/pdf" },
      { k: "arenaImage", label: "Sơ đồ sa bàn (ảnh)", type: "file", accept: IMG },
      { k: "robotSpecs", label: "Quy chuẩn robot (ô tóm tắt)", type: "list", item: [{ k: "label", label: "Hạng mục", type: "text" }, { k: "value", label: "Giá trị", type: "text" }] },
    ],
  },
  {
    key: "stage", title: "Màn hình chiếu", where: "Màn hình chiếu sân khấu", desc: "Chữ hiện trên màn hình chiếu khi chưa có trận nào diễn ra.",
    fields: [
      { k: "idleTitle", label: "Tiêu đề", type: "text" },
      { k: "idleText", label: "Dòng chữ phụ", type: "text" },
    ],
  },
  {
    key: "theme", title: "Màu sắc giao diện", where: "Toàn bộ web công khai và web BTC", desc: "Bảng màu nhận diện. Đổi màu sẽ áp dụng cho mọi trang.",
    fields: [
      { k: "navy", label: "Xanh navy (nền chính)", type: "color" },
      { k: "navy600", label: "Xanh nhấn (nút, liên kết)", type: "color" },
      { k: "navy900", label: "Navy đậm (chân trang)", type: "color" },
      { k: "red", label: "Đỏ (nút đăng ký, điểm nhấn)", type: "color" },
      { k: "gold", label: "Vàng (điểm nhấn)", type: "color" },
      { k: "fmes", label: "Xanh FMES", type: "color" },
      { k: "ice", label: "Nền sáng", type: "color" },
      { k: "teamRed", label: "Màu phe Đỏ", type: "color" },
      { k: "teamBlue", label: "Màu phe Xanh", type: "color" },
    ],
  },
];
