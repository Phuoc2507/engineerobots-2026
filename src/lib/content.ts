// Nội dung & giao diện trang mà BTC tự sửa ở /admin/content.
// Mặc định lấy từ site.ts; bản BTC đã sửa lưu ở bảng site_content (mỗi mục 1 dòng, ghi đè từng trường).
import { CONTACT, JOIN_STEPS, NAV_LINKS, PRIZES, ROBOT_SPECS, SITE, STUDENT_DOMAIN, TIMELINE, WORKSHOPS } from "@/lib/site";
import { HOME_RULE_TABS, HOME_SPECS_TAB, PRIVACY_DOC, PRIVACY_FOOTER, RULES_SECTIONS } from "@/lib/content-docs";
import { DOC_HINT } from "@/components/content/Doc";

export const DEFAULT_CONTENT = {
  brand: {
    markLogo: "/brand/bo-logo.png",
    logoMain: "/brand/fme.png",
    logoMainAlt: "Khoa Cơ khí – HCMUTE",
    logoMainShort: "FME",
    markTitle: "FME JOURNEY",
    markSubtitle: "Khoa Cơ khí",
    metaTitle: "FME JOURNEY 2026 – Cuộc thi Robot Tân sinh viên HCMUTE",
    metaDescription: "Cuộc thi chế tạo robot dành cho tân sinh viên khóa 2026 HCM-UTE: Chặng 1 dò line tự hành, Chặng 2 tích lũy cấu kiện, Chặng 3 bảo vệ Đồ án và nhấn sáng Đèn Vinh Quang.",
    shareImage: "",
    favicon: "",
    heroBackground: "",
    heroVisual: "",
    headerBackground: "",
  },
  nav: {
    links: NAV_LINKS.map((l) => ({ ...l })),
    loginLabel: "Đăng nhập",
    studentLogin: "Sinh viên K26",
    studentHint: `Email @${STUDENT_DOMAIN}`,
    staffLogin: "Trọng tài / BTC",
    staffHint: "Tài khoản do BTC cấp",
    registerButton: "Đăng ký",
    mobileCta: "Đăng ký đội thi",
    backHome: "Trang chủ",
  },
  home: {
    organizerPrefix: "Tổ chức bởi",
    stepsButton: "Bắt đầu đăng ký",
    countdownBefore: "Cổng đăng ký mở sau",
    countdownDuring: "Cổng đăng ký đóng sau",
    countdownAfter: "Cổng đăng ký đã đóng",
    rulesKicker: "Thể lệ thi đấu",
    rulesTitle: "Ba chặng – 180 / 300 giây – Một hành trình kỹ sư",
    rulesTabs: HOME_RULE_TABS.map((t) => ({ ...t })),
    specsLabel: HOME_SPECS_TAB.label,
    specsTitle: HOME_SPECS_TAB.title,
    specsBody: HOME_SPECS_TAB.body,
    rulesImageCaption: "Sơ đồ sa bàn 4800 × 4800 mm",
    rulesImageLink: "Thể lệ chi tiết →",
    liveOn: true,
    liveTitle: "Bảng điểm trực tiếp",
    liveText: "Mở khi giải khởi tranh – điểm số và tiến độ Chặng 3 của từng trận cập nhật theo thời gian thực.",
    liveButton: "Xem bảng điểm",
    liveHref: "/lich-thi",
    arenaButton: "Khám phá sa bàn 3D",
    timelineBadge: "Đang mở",
    timelineLink: "Xem lịch thi đấu chi tiết",
  },
  footer: {
    linksTitle: "Liên kết nhanh",
    links: [
      ...NAV_LINKS.map((l) => ({ label: l.label, href: `/${l.href}` })),
      { label: "Thể lệ chi tiết", href: "/rules" },
      { label: "Lịch thi & bảng xếp hạng", href: "/lich-thi" },
      { label: "Bình chọn khán giả", href: "/vote" },
    ],
    facultyTitle: "Đơn vị chỉ đạo",
    facultyUnits: [{ name: SITE.faculty, fanpage: "", email: "" }],
    organizerTitle: "Đơn vị tổ chức",
    organizerUnits: [
      { name: "Đoàn – Hội Khoa Cơ khí", fanpage: "", email: "" },
      { name: "CLB NCKH Cơ khí (FMES)", fanpage: "", email: "" },
    ],
    contactTitle: "Liên hệ",
    contactLinks: [
      { label: `Mọi thắc mắc xin liên hệ: ${CONTACT.person}`, url: `SĐT: ${CONTACT.phone}` },
      ...(CONTACT.email ? [{ label: "", url: CONTACT.email }] : []),
      ...(CONTACT.fanpage ? [{ label: "Fanpage", url: CONTACT.fanpage }] : []),
    ],
    copyright: `© 2026 ${SITE.name} · ${SITE.faculty}`,
    owner: "",
    privacyLabel: "Chính sách quyền riêng tư",
  },
  pages: {
    rulesTitle: "Thể lệ chính thức",
    rulesSubtitle: "Cuộc thi “FME JOURNEY 2026” dành cho Tân sinh viên khóa 2026 · BCH Đoàn – Hội Khoa Cơ khí · tháng 11/2026.",
    rulesPdfTitle: "Văn bản thể lệ chính thức (PDF)",
    rulesPdfText: "Các đội tải về để đọc kỹ và lưu lại khi chuẩn bị robot.",
    rulesPdfButton: "Tải thể lệ (PDF)",
    rulesPdfView: "Xem trực tuyến",
    rulesTocTitle: "Mục lục",
    arenaTitle: "Sa bàn 3D",
    arenaSubtitle: "Kéo để xoay, cuộn / chụm hai ngón để phóng to, chọn góc nhìn từng chặng. Mô hình dựng theo bản vẽ thể lệ FME JOURNEY 2026 (đơn vị thật, tỉ lệ 1:1).",
    arenaNotes: "- **Chặng 1** · 2 làn dò line hai bên biên\n- **Chặng 2** · 6 Cấu kiện Kiến thức + Bục Cơ hội\n- **Chặng 3** · Cầu Bản lĩnh, Địa hình + Bục Vinh Quang",
    arenaPreview: "/images/sa-ban-3d.webp",
    arenaModel: "/models/sa-ban-2026.glb",
    arenaVideoTitle: "Video mô phỏng một lượt thi",
    arenaVideoText: "Robot đỏ và xanh dò line Chặng 1, đưa Cấu kiện Kiến thức về Trạm thành tựu, tranh Cơ hội vàng, vượt Cầu Bản lĩnh rồi leo Bục Vinh Quang nhấn đèn ở Chặng 3. Chỉ minh hoạ, không phải chiến thuật bắt buộc.",
    scheduleTitle: "Lịch thi",
    scheduleSubtitle: `Các mốc của ${SITE.name} và lịch từng trận, cập nhật trực tiếp từ BTC.`,
    drawTitle: "Kết quả bốc thăm",
    drawSubtitle: "Vị trí của các đội trong bảng đấu, cập nhật trực tiếp trong lúc bốc thăm.",
    drawEmpty: "BTC chưa tổ chức bốc thăm.",
    voteTitle: "Bình chọn khán giả",
    voteSubtitle: `Chọn đội bạn yêu thích nhất tại ${SITE.name}.`,
    registerTitle: "Đăng ký đội thi",
    registerSubtitle: "Đội tối đa 5 tân sinh viên K26 HCM-UTE. Đội trưởng đăng nhập bằng email trường và khai báo cho cả đội.",
    teamTitle: "Đội của tôi",
    teamSubtitleLeader: "Quản lý hồ sơ, thành viên và theo dõi trạng thái duyệt của đội.",
    teamSubtitleMember: "Bạn đã được đội trưởng thêm vào đội. Theo dõi hồ sơ và lịch thi đấu tại đây.",
    practiceTitle: "Đăng ký lịch chạy thử",
    practiceSubtitle: "Chạy thử trên sa bàn thật trước ngày thi 1 tuần. Mỗi khung giờ chỉ dành cho 1 đội, đặt trước để không trùng lịch.",
    staffTitle: "BTC / Trọng tài",
    staffSubtitle: "Khu vực dành cho Ban tổ chức và trọng tài. Đăng nhập bằng tài khoản Google đã được BTC cấp quyền.",
    staffNote: "Dùng được cả Gmail cá nhân, miễn là email đã được thêm vào danh sách nhân sự.",
    privacyTitle: "Chính sách quyền riêng tư",
    privacySubtitle: `Áp dụng cho website ${SITE.name} do ${SITE.organizer} vận hành.`,
  },
  rules_doc: {
    sections: RULES_SECTIONS.map((s) => ({ ...s })),
  },
  privacy: {
    body: PRIVACY_DOC,
    footer: PRIVACY_FOOTER,
  },
  minutes: {
    logo: "",
    orgLine1: SITE.organizer,
    orgLine2: `Ban tổ chức ${SITE.name}`,
    rightHeader: "",
    place: "",
    title: "Biên bản chỉnh điểm số trận đấu",
    intro: "",
    s1: "I. Nội dung",
    s2: "II. Các thay đổi điểm",
    s3: "III. Kết quả sau chỉnh",
    s4: "IV. Xác nhận của các bên",
    closing: "",
    footer: "",
    showCreator: true,
    showSignTime: true,
    font: "sans",
    fontSize: "13",
    signColumns: "3",
    accent: "#000000",
    tableHead: "#F1F5F9",
    labelHeadReferee: "Trọng tài chính",
    labelSecretaryRed: "Thư ký phe Đỏ",
    labelSecretaryBlue: "Thư ký phe Xanh",
    labelTeamRed: "Đại diện đội Đỏ",
    labelTeamBlue: "Đại diện đội Xanh",
    labelBtc: "Đại diện Ban tổ chức",
  },
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
    poster: "/images/an-pham/kv-ngang.webp",
    slides: [{ image: "/images/an-pham/kv-ngang.webp" }, { image: "/images/an-pham/kv-vuong.webp" }],
    slideSeconds: "10",
    showSchedule: true,
    scheduleTitle: "Lịch thi đấu",
    scheduleCount: "6",
    showNext: true,
    nextLabel: "Trận tiếp theo",
    resultSeconds: "120",
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
    partHeader: "",
    partHero: "",
    partPage: "",
    partAdmin: "",
    partIntro: "",
    partRules: "",
    partArena: "",
    partPrizes: "",
    partTimeline: "",
    partCta: "",
    partFooter: "",
    partStage: "",
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
  partHeader: "--p-header", partHero: "--p-hero", partPage: "--p-page", partAdmin: "--p-admin", partIntro: "--p-intro", partRules: "--p-rules", partArena: "--p-arena", partPrizes: "--p-prizes", partTimeline: "--p-timeline", partCta: "--p-cta", partFooter: "--p-footer", partStage: "--p-stage",
};
// "#RRGGBB" hoặc "#RRGGBBAA" (AA = độ đậm, FF = đặc, 00 = trong suốt hẳn)
export const parseColor = (hex: string) => {
  const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
  return { rgb: `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`, alpha: Math.round(a * 1000) / 1000 };
};
export function themeCss(theme: Content["theme"]) {
  const vars = (Object.keys(THEME_VARS) as (keyof Content["theme"])[])
    .filter((k) => theme[k] !== DEFAULT_CONTENT.theme[k])
    .map((k) => {
      const v = parseColor(theme[k]);
      if (!v) return "";
      const name = THEME_VARS[k];
      const alphaVar = name.startsWith("--p-") ? name.replace("--p-", "--pa-") : name.replace("--c-", "--a-");
      return `${name}:${v.rgb};${v.alpha < 1 ? `${alphaVar}:${v.alpha};` : ""}`;
    })
    .join("");
  return vars ? `:root{${vars}}` : "";
}

// ───────── Mô tả form cho trang sửa nội dung ─────────
export type FieldType = "heading" | "text" | "textarea" | "doc" | "datetime" | "url" | "file" | "bool" | "select" | "color";
export type Field = {
  k: string; label: string; type: FieldType; hint?: string;
  options?: { value: string; label: string }[];
  accept?: string;
};
export type ListField = { k: string; label: string; type: "list"; item: Field[]; hint?: string };
export type Group = "Chung" | "Trang chủ" | "Các trang" | "Biên bản";
export type Section = { key: ContentKey; group: Group; title: string; desc: string; where: string; fields: (Field | ListField)[] };
export const GROUPS: Group[] = ["Chung", "Trang chủ", "Các trang", "Biên bản"];

const IMG = "image/png,image/jpeg,image/webp,image/gif";
const RICH = "Bao chữ trong **hai dấu sao** để in đậm.";

export const CONTENT_SECTIONS: Section[] = [
  {
    key: "brand", group: "Chung", title: "Logo & ấn phẩm nhận diện", where: "Mọi trang (web chung và khu BTC)", desc: "Logo, tên hiển thị cạnh logo, ảnh nền đầu trang, ảnh khi chia sẻ link lên mạng xã hội và biểu tượng tab trình duyệt.",
    fields: [
      { k: "markLogo", label: "Bộ logo cạnh chữ tên giải (thanh trên cùng mọi trang)", type: "file", accept: IMG, hint: "Ảnh ngang ghép các logo (ĐTN – HSV – FME – FMES). Để trống = dùng logo chính dạng tròn." },
      { k: "logoMain", label: "Logo tròn dự phòng", type: "file", accept: IMG, hint: "Chỉ hiện khi ô Bộ logo để trống." },
      { k: "logoMainAlt", label: "Tên đơn vị của logo chính", type: "text" },
      { k: "logoMainShort", label: "Tên viết tắt logo chính", type: "text" },
      { k: "markTitle", label: "Chữ lớn cạnh logo", type: "text" },
      { k: "markSubtitle", label: "Chữ nhỏ (vàng) cạnh logo", type: "text" },
      { k: "heroBackground", label: "Ảnh nền đầu trang chủ", type: "file", accept: IMG, hint: "Để trống = nền lưới xanh navy. Ảnh được phủ lớp navy mờ để chữ dễ đọc." },
      { k: "heroVisual", label: "Ảnh / poster bên phải đầu trang chủ", type: "file", accept: IMG, hint: "Để trống = hình sa bàn động có sẵn." },
      { k: "headerBackground", label: "Ảnh nền đầu các trang con (Thể lệ, Lịch thi, Đăng ký…)", type: "file", accept: IMG },
      { k: "metaTitle", label: "Tiêu đề trang khi tìm kiếm / chia sẻ link", type: "text" },
      { k: "metaDescription", label: "Mô tả khi tìm kiếm / chia sẻ link", type: "textarea" },
      { k: "shareImage", label: "Ảnh hiện khi chia sẻ link (Facebook, Zalo…)", type: "file", accept: IMG, hint: "Khuyên dùng 1200 × 630 px." },
      { k: "favicon", label: "Biểu tượng tab trình duyệt", type: "file", accept: "image/png", hint: "Ảnh PNG vuông. Để trống = biểu tượng mặc định." },
    ],
  },
  {
    key: "nav", group: "Chung", title: "Menu & nút đăng nhập", where: "Thanh điều hướng trang chủ, các trang con", desc: "Các mục menu trên cùng trang chủ, menu đăng nhập và nút Đăng ký.",
    fields: [
      { k: "links", label: "Mục menu", type: "list", hint: "Đường dẫn bắt đầu bằng # để cuộn tới mục trên trang chủ (#gioi-thieu, #the-le, #sa-ban-3d, #giai-thuong, #lich-trinh) hoặc / để mở trang khác (/rules, /lich-thi…).", item: [{ k: "label", label: "Chữ", type: "text" }, { k: "href", label: "Đường dẫn", type: "url" }] },
      { k: "loginLabel", label: "Nút đăng nhập", type: "text" },
      { k: "studentLogin", label: "Dòng đăng nhập sinh viên", type: "text" },
      { k: "studentHint", label: "Chú thích đăng nhập sinh viên", type: "text" },
      { k: "staffLogin", label: "Dòng đăng nhập BTC / trọng tài", type: "text" },
      { k: "staffHint", label: "Chú thích đăng nhập BTC / trọng tài", type: "text" },
      { k: "registerButton", label: "Nút Đăng ký (góc phải)", type: "text" },
      { k: "mobileCta", label: "Nút đăng ký nổi trên điện thoại", type: "text" },
      { k: "backHome", label: "Nút quay về trang chủ (các trang con)", type: "text" },
    ],
  },
  {
    key: "footer", group: "Chung", title: "Chân trang", where: "Cuối trang chủ", desc: "Tiêu đề các cột, liên kết nhanh và dòng bản quyền. Thông tin liên hệ sửa ở mục Liên hệ & nhóm Zalo.",
    fields: [
      { k: "linksTitle", label: "Tiêu đề cột liên kết", type: "text" },
      { k: "links", label: "Liên kết nhanh", type: "list", item: [{ k: "label", label: "Chữ", type: "text" }, { k: "href", label: "Đường dẫn", type: "url" }] },
      { k: "facultyTitle", label: "Tiêu đề Đơn vị chỉ đạo", type: "text" },
      { k: "facultyUnits", label: "Các đơn vị chỉ đạo", type: "list", hint: "Ô fanpage và email để trống sẽ tự ẩn.", item: [{ k: "name", label: "Tên đơn vị", type: "text" }, { k: "fanpage", label: "Link fanpage", type: "url" }, { k: "email", label: "Gmail / email", type: "text" }] },
      { k: "organizerTitle", label: "Tiêu đề Đơn vị tổ chức", type: "text" },
      { k: "organizerUnits", label: "Các đơn vị tổ chức", type: "list", hint: "Ô fanpage và email để trống sẽ tự ẩn.", item: [{ k: "name", label: "Tên đơn vị", type: "text" }, { k: "fanpage", label: "Link fanpage", type: "url" }, { k: "email", label: "Gmail / email", type: "text" }] },
      { k: "contactTitle", label: "Tiêu đề cột liên hệ", type: "text" },
      { k: "contactLinks", label: "Các dòng liên hệ", type: "list", hint: "Toàn bộ cột Liên hệ lấy từ danh sách này, xóa dòng nào là mất dòng đó. Ô Nội dung là chữ hiện ra (bao **hai dấu sao** để in đậm). Ô Liên hệ: để trống nếu chỉ là chữ; gõ SĐT (vd SĐT: 0822678499) hoặc email thì hiện bên dưới và bấm vào để gọi / gửi thư; dán link (fanpage, website, Zalo) thì cả dòng thành nút bấm.", item: [{ k: "label", label: "Nội dung", type: "text" }, { k: "url", label: "Liên hệ: SĐT / email / link (không bắt buộc)", type: "text" }] },
      { k: "copyright", label: "Dòng bản quyền", type: "text" },
      { k: "owner", label: "Dòng ghi đơn vị giữ bản quyền (không bắt buộc)", type: "text", hint: "Ví dụ: Bản quyền thuộc Đoàn – Hội Khoa Cơ khí & CLB NCKH CK (FMES)." },
      { k: "privacyLabel", label: "Chữ liên kết tới trang Chính sách quyền riêng tư", type: "text" },
    ],
  },
  {
    key: "site", group: "Chung", title: "Thông tin chung", where: "Mọi trang", desc: "Tên cuộc thi, đơn vị tổ chức và thời gian đăng ký (đồng hồ đếm ngược + hạn khóa đăng ký trong hệ thống).",
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
    key: "announce", group: "Chung", title: "Thông báo nổi bật", where: "Trang chủ, trang sinh viên, khu BTC", desc: "Dải thông báo hiện trên cùng trang công khai, và dải riêng cho khu vực BTC / trọng tài.",
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
    key: "hero", group: "Trang chủ", title: "Đầu trang chủ", where: "Trang chủ", desc: "Khối giới thiệu lớn trên cùng trang chủ.",
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
    key: "home", group: "Trang chủ", title: "Thể lệ tóm tắt & chữ khác", where: "Trang chủ", desc: "Các tab thể lệ tóm tắt, khối bảng điểm trực tiếp, đồng hồ đếm ngược và chữ trên các nút còn lại của trang chủ.",
    fields: [
      { k: "rulesKicker", label: "Nhãn mục Thể lệ", type: "text" },
      { k: "rulesTitle", label: "Tiêu đề mục Thể lệ", type: "text" },
      { k: "rulesTabs", label: "Các tab chặng thi", type: "list", item: [
        { k: "label", label: "Tên tab", type: "text" },
        { k: "title", label: "Tiêu đề", type: "text" },
        { k: "body", label: "Nội dung", type: "doc", hint: DOC_HINT },
        { k: "facts", label: "Ô điểm nổi bật (mỗi dòng: Nhãn | Giá trị)", type: "textarea" },
      ] },
      { k: "specsLabel", label: "Tên tab Quy chuẩn robot", type: "text" },
      { k: "specsTitle", label: "Tiêu đề tab Quy chuẩn robot", type: "text" },
      { k: "specsBody", label: "Nội dung tab Quy chuẩn robot", type: "doc", hint: "Các ô thông số lấy từ mục Thể lệ & tài liệu → Quy chuẩn robot. " + DOC_HINT },
      { k: "rulesImageCaption", label: "Chú thích ảnh sơ đồ sa bàn", type: "text" },
      { k: "rulesImageLink", label: "Chữ liên kết dưới ảnh", type: "text" },
      { k: "liveOn", label: "Hiện khối Bảng điểm trực tiếp", type: "bool" },
      { k: "liveTitle", label: "Tiêu đề khối bảng điểm", type: "text" },
      { k: "liveText", label: "Mô tả khối bảng điểm", type: "textarea" },
      { k: "liveButton", label: "Chữ trên nút", type: "text" },
      { k: "liveHref", label: "Đường dẫn nút", type: "url" },
      { k: "countdownBefore", label: "Đồng hồ: trước khi mở đăng ký", type: "text" },
      { k: "countdownDuring", label: "Đồng hồ: đang mở đăng ký", type: "text" },
      { k: "countdownAfter", label: "Đồng hồ: đã đóng đăng ký", type: "text" },
      { k: "organizerPrefix", label: "Chữ trước tên đơn vị tổ chức (mục Giới thiệu)", type: "text" },
      { k: "stepsButton", label: "Nút ở khối các bước tham gia", type: "text" },
      { k: "arenaButton", label: "Nút ở mục Sa bàn", type: "text" },
      { k: "timelineBadge", label: "Nhãn mốc đang diễn ra", type: "text" },
      { k: "timelineLink", label: "Liên kết dưới Lịch trình", type: "text" },
    ],
  },
  {
    key: "intro", group: "Trang chủ", title: "Giới thiệu & cách tham gia", where: "Trang chủ", desc: "Mục Giới thiệu, các con số và các bước tham gia.",
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
    key: "arena", group: "Trang chủ", title: "Sa bàn & video", where: "Trang chủ, trang Sa bàn 3D", desc: "Mục Sa bàn thi đấu: video mô phỏng, ảnh bìa video và mô tả từng chặng.",
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
    key: "prizes", group: "Trang chủ", title: "Giải thưởng & tập huấn", where: "Trang chủ, trang Thể lệ", desc: "Cơ cấu giải thưởng, ghi chú và các buổi tập huấn.",
    fields: [
      { k: "kicker", label: "Nhãn mục", type: "text" },
      { k: "title", label: "Tiêu đề", type: "text" },
      { k: "items", label: "Các giải", type: "list", hint: "Phần thưởng có dấu “ + ” sẽ được tách 2 dòng.", item: [{ k: "rank", label: "Giải", type: "text" }, { k: "reward", label: "Phần thưởng", type: "text" }, { k: "extra", label: "Ghi chú", type: "text" }] },
      { k: "notes", label: "Ghi chú dưới bảng giải (mỗi dòng một ý)", type: "textarea" },
      { k: "workshops", label: "Các buổi tập huấn", type: "list", item: [{ k: "title", label: "Buổi", type: "text" }, { k: "desc", label: "Nội dung / thời gian", type: "textarea" }] },
    ],
  },
  {
    key: "timeline", group: "Trang chủ", title: "Lịch trình", where: "Trang chủ, trang Lịch thi", desc: "Các mốc thời gian. Mốc “Đang diễn ra” được tô đỏ.",
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
    key: "cta", group: "Trang chủ", title: "Kêu gọi đăng ký", where: "Trang chủ", desc: "Dải đỏ cuối trang chủ.",
    fields: [
      { k: "title", label: "Tiêu đề", type: "text" },
      { k: "text", label: "Nội dung", type: "textarea", hint: RICH },
      { k: "button", label: "Chữ trên nút", type: "text" },
    ],
  },
  {
    key: "contact", group: "Chung", title: "Liên hệ & nhóm Zalo", where: "Trang đội thi, email gửi đội, đăng nhập BTC", desc: "Người liên hệ, SĐT, email dùng ở trang đội thi và email gửi đội. Cột Liên hệ ở chân trang sửa riêng ở mục Chân trang.",
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
    key: "rules", group: "Các trang", title: "Thể lệ & tài liệu", where: "Trang Thể lệ, trang chủ", desc: "File thể lệ, bản vẽ sa bàn, sơ đồ sa bàn và bảng quy chuẩn robot.",
    fields: [
      { k: "pdf", label: "File thể lệ chính thức (PDF)", type: "file", accept: "application/pdf" },
      { k: "drawingPdf", label: "Bản vẽ kỹ thuật sa bàn (PDF)", type: "file", accept: "application/pdf" },
      { k: "arenaImage", label: "Sơ đồ sa bàn (ảnh)", type: "file", accept: IMG },
      { k: "robotSpecs", label: "Quy chuẩn robot (ô tóm tắt)", type: "list", item: [{ k: "label", label: "Hạng mục", type: "text" }, { k: "value", label: "Giá trị", type: "text" }] },
    ],
  },
  {
    key: "stage", group: "Các trang", title: "Màn hình chiếu", where: "Màn hình chiếu sân khấu", desc: "Màn chờ (bộ ấn phẩm trình chiếu + lịch thi đấu), dòng Trận tiếp theo dưới bảng điểm. Mở /stage trên máy chiếu; di chuột để hiện nút chuyển Tự động / Lịch thi đấu / Ấn phẩm / Toàn màn hình.",
    fields: [
      { k: "slides", label: "Bộ ấn phẩm trình chiếu", type: "list", hint: "Ảnh lần lượt chuyển trên màn chờ và chế độ Ấn phẩm. Ảnh ngang 16:9 hoặc 2:1 lấp đầy đẹp nhất; ảnh vuông / dọc tự có nền mờ hai bên.", item: [{ k: "image", label: "Ảnh", type: "file", accept: IMG }] },
      { k: "slideSeconds", label: "Số giây mỗi ảnh", type: "select", options: ["5", "8", "10", "15", "20", "30"].map((v) => ({ value: v, label: `${v} giây` })) },
      { k: "poster", label: "Ảnh dự phòng (khi bộ ấn phẩm trống)", type: "file", accept: IMG },
      { k: "idleTitle", label: "Tiêu đề dưới ấn phẩm", type: "text", hint: "Để trống nếu ấn phẩm đã có tên giải." },
      { k: "idleText", label: "Dòng chữ phụ dưới ấn phẩm", type: "text" },
      { k: "showSchedule", label: "Hiện lịch thi đấu bên phải màn chờ", type: "bool" },
      { k: "scheduleTitle", label: "Tiêu đề khung lịch thi đấu", type: "text" },
      { k: "scheduleCount", label: "Số trận hiện trên màn chờ", type: "select", options: ["3", "4", "5", "6", "8"].map((v) => ({ value: v, label: `${v} trận` })) },
      { k: "showNext", label: "Hiện dòng Trận tiếp theo dưới bảng điểm", type: "bool" },
      { k: "nextLabel", label: "Nhãn dòng Trận tiếp theo", type: "text" },
      { k: "resultSeconds", label: "Giữ kết quả trận vừa xong trên màn hình", type: "select", hint: "Hết thời gian này màn hình tự về màn chờ.", options: [["60", "1 phút"], ["120", "2 phút"], ["300", "5 phút"], ["600", "10 phút"], ["86400", "Đến khi trận sau bắt đầu"]].map(([value, label]) => ({ value, label })) },
    ],
  },
  {
    key: "theme", group: "Chung", title: "Màu sắc giao diện", where: "Toàn bộ web công khai và web BTC", desc: "Phần trên: bảng màu chung, đổi sẽ áp dụng cho mọi trang. Phần dưới: màu nền riêng của từng phần (thanh menu, đầu trang, từng mục trang chủ, chân trang, màn hình chiếu) – để trống thì phần đó theo màu chung.",
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
      { k: "partsNote", label: "Màu nền từng phần", type: "heading", hint: "Để trống ô nào thì phần đó dùng màu chung ở trên." },
      { k: "partHeader", label: "Thanh menu trên cùng (khi cuộn trang)", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
      { k: "partHero", label: "Nền đầu trang chủ", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
      { k: "partPage", label: "Nền đầu các trang con (Thể lệ, Lịch thi, Đăng ký…)", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
      { k: "partAdmin", label: "Nền đầu khu BTC / trọng tài", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
      { k: "partIntro", label: "Nền mục Giới thiệu", type: "color", hint: "Chữ trên phần này màu tối – nên chọn màu sáng. Để trống = theo màu chung." },
      { k: "partRules", label: "Nền mục Thể lệ & bảng điểm trực tiếp", type: "color", hint: "Chữ trên phần này màu tối – nên chọn màu sáng. Để trống = theo màu chung." },
      { k: "partArena", label: "Nền mục Sa bàn & video", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
      { k: "partPrizes", label: "Nền mục Giải thưởng", type: "color", hint: "Chữ trên phần này màu tối – nên chọn màu sáng. Để trống = theo màu chung." },
      { k: "partTimeline", label: "Nền mục Lịch trình", type: "color", hint: "Chữ trên phần này màu tối – nên chọn màu sáng. Để trống = theo màu chung." },
      { k: "partCta", label: "Nền dải Kêu gọi đăng ký", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
      { k: "partFooter", label: "Nền chân trang", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
      { k: "partStage", label: "Nền màn hình chiếu", type: "color", hint: "Chữ trên phần này màu trắng – nên chọn màu đậm. Để trống = theo màu chung." },
    ],
  },
  {
    key: "rules_doc", group: "Các trang", title: "Nội dung thể lệ chi tiết", where: "Trang Thể lệ (/rules)", desc: "Toàn bộ các mục của trang Thể lệ. Mục lục tự tạo theo tên các mục.",
    fields: [
      { k: "sections", label: "Các mục", type: "list", hint: "Chèn khối có sẵn bằng một dòng riêng: [[thong-so-robot]] ô thông số robot, [[so-do-sa-ban]] sơ đồ sa bàn + nút tải bản vẽ, [[bang-giai-thuong]] bảng giải thưởng, [[tap-huan]] danh sách buổi tập huấn.", item: [
        { k: "title", label: "Tên mục", type: "text" },
        { k: "id", label: "Mã neo (không dấu, để liên kết /rules#ma)", type: "text" },
        { k: "body", label: "Nội dung", type: "doc", hint: DOC_HINT },
      ] },
    ],
  },
  {
    key: "pages", group: "Các trang", title: "Tiêu đề & chữ các trang", where: "Thể lệ, Sa bàn 3D, Lịch thi, Bốc thăm, Bình chọn, Đăng ký, Đội của tôi, Đăng nhập BTC, Quyền riêng tư", desc: "Tiêu đề lớn, dòng giới thiệu và các chữ cố định trên từng trang con.",
    fields: [
      { k: "rulesTitle", label: "Thể lệ · Tiêu đề", type: "text" },
      { k: "rulesSubtitle", label: "Thể lệ · Dòng giới thiệu", type: "textarea" },
      { k: "rulesPdfTitle", label: "Thể lệ · Tiêu đề khung tải PDF", type: "text" },
      { k: "rulesPdfText", label: "Thể lệ · Mô tả khung tải PDF", type: "text" },
      { k: "rulesPdfButton", label: "Thể lệ · Nút tải PDF", type: "text" },
      { k: "rulesPdfView", label: "Thể lệ · Nút xem trực tuyến", type: "text" },
      { k: "rulesTocTitle", label: "Thể lệ · Tiêu đề mục lục", type: "text" },
      { k: "arenaTitle", label: "Sa bàn 3D · Tiêu đề", type: "text" },
      { k: "arenaSubtitle", label: "Sa bàn 3D · Dòng giới thiệu", type: "textarea" },
      { k: "arenaNotes", label: "Sa bàn 3D · Ghi chú dưới mô hình", type: "doc", hint: DOC_HINT },
      { k: "arenaPreview", label: "Sa bàn 3D · Ảnh xem trước mô hình", type: "file", accept: IMG },
      { k: "arenaModel", label: "Sa bàn 3D · Đường dẫn file mô hình (.glb)", type: "url", hint: "File .glb cần đặt ở nơi công khai (ví dụ trong mã nguồn web) rồi dán đường dẫn." },
      { k: "arenaVideoTitle", label: "Sa bàn 3D · Tiêu đề video", type: "text" },
      { k: "arenaVideoText", label: "Sa bàn 3D · Mô tả video", type: "textarea" },
      { k: "scheduleTitle", label: "Lịch thi · Tiêu đề", type: "text" },
      { k: "scheduleSubtitle", label: "Lịch thi · Dòng giới thiệu", type: "textarea" },
      { k: "drawTitle", label: "Bốc thăm · Tiêu đề", type: "text" },
      { k: "drawSubtitle", label: "Bốc thăm · Dòng giới thiệu", type: "textarea" },
      { k: "drawEmpty", label: "Bốc thăm · Khi chưa bốc thăm", type: "text" },
      { k: "voteTitle", label: "Bình chọn · Tiêu đề", type: "text" },
      { k: "voteSubtitle", label: "Bình chọn · Dòng giới thiệu", type: "textarea" },
      { k: "registerTitle", label: "Đăng ký · Tiêu đề", type: "text" },
      { k: "registerSubtitle", label: "Đăng ký · Dòng giới thiệu", type: "textarea" },
      { k: "teamTitle", label: "Đội của tôi · Tiêu đề", type: "text" },
      { k: "teamSubtitleLeader", label: "Đội của tôi · Giới thiệu (đội trưởng)", type: "textarea" },
      { k: "teamSubtitleMember", label: "Đội của tôi · Giới thiệu (thành viên)", type: "textarea" },
      { k: "practiceTitle", label: "Chạy thử sa bàn · Tiêu đề", type: "text" },
      { k: "practiceSubtitle", label: "Chạy thử sa bàn · Dòng giới thiệu", type: "textarea" },
      { k: "staffTitle", label: "Đăng nhập BTC · Tiêu đề", type: "text" },
      { k: "staffSubtitle", label: "Đăng nhập BTC · Dòng giới thiệu", type: "textarea" },
      { k: "staffNote", label: "Đăng nhập BTC · Ghi chú dưới nút", type: "text" },
      { k: "privacyTitle", label: "Quyền riêng tư · Tiêu đề", type: "text" },
      { k: "privacySubtitle", label: "Quyền riêng tư · Dòng giới thiệu", type: "textarea" },
    ],
  },
  {
    key: "privacy", group: "Các trang", title: "Chính sách quyền riêng tư", where: "Trang /privacy (bắt buộc cho đăng nhập Google)", desc: "Nội dung chính sách quyền riêng tư.",
    fields: [
      { k: "body", label: "Nội dung", type: "doc", hint: DOC_HINT },
      { k: "footer", label: "Dòng cuối (ngày cập nhật)", type: "text" },
    ],
  },
  {
    key: "minutes", group: "Biên bản", title: "Mẫu biên bản chỉnh điểm", where: "Biên bản in (khu BTC → Biên bản)", desc: "Tiêu đề, quốc hiệu, logo, các đề mục, phông chữ, màu và tên các bên ký trên biên bản. Áp dụng cho mọi biên bản, kể cả biên bản đã lập. Bản xem trước bên dưới cập nhật ngay khi sửa.",
    fields: [
      { k: "logo", label: "Logo trên biên bản", type: "file", accept: IMG, hint: "Để trống nếu không cần logo." },
      { k: "orgLine1", label: "Tên cơ quan (góc trái, in hoa)", type: "text" },
      { k: "orgLine2", label: "Dòng dưới tên cơ quan", type: "text" },
      { k: "rightHeader", label: "Góc phải (ví dụ quốc hiệu, tiêu ngữ)", type: "textarea", hint: "Mỗi dòng một dòng; dòng đầu in đậm. Ví dụ: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM ↵ Độc lập – Tự do – Hạnh phúc." },
      { k: "place", label: "Địa danh trước ngày lập", type: "text", hint: "Ví dụ: TP. Hồ Chí Minh → “TP. Hồ Chí Minh, ngày 15 tháng 11 năm 2026”. Để trống = không hiện." },
      { k: "title", label: "Tên biên bản", type: "text" },
      { k: "intro", label: "Đoạn mở đầu", type: "textarea", hint: "Hiện trước mục nội dung. Để trống nếu không cần." },
      { k: "s1", label: "Đề mục nội dung", type: "text" },
      { k: "s2", label: "Đề mục bảng thay đổi", type: "text" },
      { k: "s3", label: "Đề mục kết quả", type: "text" },
      { k: "s4", label: "Đề mục chữ ký", type: "text" },
      { k: "closing", label: "Đoạn kết (trước phần ký)", type: "textarea" },
      { k: "footer", label: "Chú thích cuối trang", type: "text" },
      { k: "showCreator", label: "Hiện tài khoản người lập trên hệ thống", type: "bool" },
      { k: "showSignTime", label: "Hiện thời điểm ký dưới chữ ký", type: "bool" },
      { k: "font", label: "Phông chữ", type: "select", options: [{ value: "sans", label: "Không chân (giống web)" }, { value: "serif", label: "Có chân – Times New Roman (văn bản hành chính)" }] },
      { k: "fontSize", label: "Cỡ chữ", type: "select", options: [{ value: "12", label: "12 px" }, { value: "13", label: "13 px" }, { value: "14", label: "14 px" }, { value: "15", label: "15 px" }] },
      { k: "signColumns", label: "Số cột chữ ký mỗi hàng", type: "select", options: [{ value: "2", label: "2 cột" }, { value: "3", label: "3 cột" }] },
      { k: "accent", label: "Màu tên biên bản và đề mục", type: "color" },
      { k: "tableHead", label: "Màu nền dòng tiêu đề bảng", type: "color" },
      { k: "labelHeadReferee", label: "Tên bên ký: Trọng tài chính", type: "text" },
      { k: "labelSecretaryRed", label: "Tên bên ký: Thư ký phe Đỏ", type: "text" },
      { k: "labelSecretaryBlue", label: "Tên bên ký: Thư ký phe Xanh", type: "text" },
      { k: "labelTeamRed", label: "Tên bên ký: Đại diện đội Đỏ", type: "text" },
      { k: "labelTeamBlue", label: "Tên bên ký: Đại diện đội Xanh", type: "text" },
      { k: "labelBtc", label: "Tên bên ký: Ban tổ chức", type: "text" },
    ],
  },
];
