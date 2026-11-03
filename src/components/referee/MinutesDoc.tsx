/* eslint-disable @next/next/no-img-element -- chữ ký là ảnh data URL, logo có thể từ kho ấn phẩm */
import type { Content } from "@/lib/content";

type Tpl = Content["minutes"];
export type MinutesRow = { act: string; side: string; item: string; points: string };
export type MinutesData = {
  code: string; reason: string; reasonLabel: string; createdAt: string; createdBy: string;
  matchCode: string; stage: string; red: string; blue: string;
  rows: MinutesRow[];
  redBefore: number; redAfter: number; blueBefore: number; blueAfter: number; winnerBefore: string; winnerAfter: string;
  signatures: { role: string; name: string; image: string; signedAt: string }[];
};

const TZ = "Asia/Ho_Chi_Minh";
const fmt = (s: string) => new Date(s).toLocaleString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
const dateLine = (place: string, s: string) => {
  const [d, m, y] = new Date(s).toLocaleDateString("en-GB", { timeZone: TZ }).split("/");
  return `${place}, ngày ${d} tháng ${m} năm ${y}`;
};

export const signerName = (t: Tpl, role: string) => ({
  HEAD_REFEREE: t.labelHeadReferee, SECRETARY_RED: t.labelSecretaryRed, SECRETARY_BLUE: t.labelSecretaryBlue,
  TEAM_RED: t.labelTeamRed, TEAM_BLUE: t.labelTeamBlue, BTC: t.labelBtc,
} as Record<string, string>)[role] ?? role;

// Biên bản chỉnh điểm khổ A4 theo mẫu BTC đặt ở /admin/content → Mẫu biên bản (dùng cho trang in và bản xem trước)
export default function MinutesDoc({ t, d }: { t: Tpl; d: MinutesData }) {
  const cell = "border border-slate-400 px-2 py-1.5 align-top";
  const head = { backgroundColor: t.tableHead };
  const accent = { color: t.accent };
  const [rh1, ...rhRest] = t.rightHeader.split("\n").filter((l) => l.trim());
  return (
    <article
      className="mx-auto max-w-[210mm] bg-white px-[15mm] py-[12mm] leading-relaxed text-black shadow print:shadow-none"
      style={{ fontSize: `${Number(t.fontSize) || 13}px`, fontFamily: t.font === "serif" ? '"Times New Roman", Times, serif' : undefined }}
    >
      <header className="flex items-start justify-between gap-4 text-center">
        <div className="flex items-start gap-2">
          {t.logo && <img src={t.logo} alt="" className="h-14 w-14 shrink-0 object-contain" />}
          <div className="text-[0.85em] font-bold uppercase">{t.orgLine1}<div className="font-normal normal-case">{t.orgLine2}</div></div>
        </div>
        <div className="text-[0.85em]">
          {rh1 && <div className="font-bold uppercase">{rh1}</div>}
          {rhRest.map((l, i) => <div key={i} className="font-semibold">{l}</div>)}
          <div className={rh1 ? "mt-1" : ""}>Số: <b>{d.code}</b></div>
        </div>
      </header>
      {t.place.trim() && <p className="mt-3 text-right italic">{dateLine(t.place.trim(), d.createdAt)}</p>}
      <h1 className="mt-6 text-center text-[1.5em] font-bold uppercase" style={accent}>{t.title}</h1>
      <p className="text-center italic">Lý do: {d.reasonLabel}</p>

      {t.intro.trim() && <p className="mt-4 whitespace-pre-wrap">{t.intro}</p>}

      <section className="mt-5 space-y-1">
        <p>Thời gian lập: <b>{fmt(d.createdAt)}</b>{t.showCreator && <> · Người lập trên hệ thống: {d.createdBy}</>}</p>
        <p>Trận: <b>{d.matchCode}</b> · {d.stage}</p>
        <p>Phe Đỏ: <b>{d.red}</b> · Phe Xanh: <b>{d.blue}</b></p>
      </section>

      <section className="mt-4">
        <p className="font-bold" style={accent}>{t.s1}</p>
        <p className="whitespace-pre-wrap">{d.reason}</p>
      </section>

      <section className="mt-4">
        <p className="font-bold" style={accent}>{t.s2}</p>
        <table className="mt-2 w-full border-collapse">
          <thead><tr style={head}><th className={cell}>STT</th><th className={cell}>Thao tác</th><th className={cell}>Phe</th><th className={cell}>Mục điểm / lỗi</th><th className={cell}>Điểm</th></tr></thead>
          <tbody>
            {d.rows.map((e, i) => (
              <tr key={i}>
                <td className={`${cell} text-center`}>{i + 1}</td>
                <td className={cell}>{e.act}</td>
                <td className={cell}>{e.side}</td>
                <td className={cell}>{e.item}</td>
                <td className={`${cell} text-right`}>{e.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4">
        <p className="font-bold" style={accent}>{t.s3}</p>
        <table className="mt-2 w-full border-collapse">
          <thead><tr style={head}><th className={cell}></th><th className={cell}>Trước</th><th className={cell}>Sau</th></tr></thead>
          <tbody>
            <tr><td className={cell}>Điểm phe Đỏ</td><td className={`${cell} text-center`}>{d.redBefore}</td><td className={`${cell} text-center font-bold`}>{d.redAfter}</td></tr>
            <tr><td className={cell}>Điểm phe Xanh</td><td className={`${cell} text-center`}>{d.blueBefore}</td><td className={`${cell} text-center font-bold`}>{d.blueAfter}</td></tr>
            <tr><td className={cell}>Đội thắng</td><td className={`${cell} text-center`}>{d.winnerBefore}</td><td className={`${cell} text-center font-bold`}>{d.winnerAfter}</td></tr>
          </tbody>
        </table>
      </section>

      {t.closing.trim() && <p className="mt-4 whitespace-pre-wrap">{t.closing}</p>}

      <section className="mt-6 break-inside-avoid">
        <p className="font-bold" style={accent}>{t.s4}</p>
        <div className={`mt-3 grid gap-4 text-center ${t.signColumns === "2" ? "grid-cols-2" : "grid-cols-3"}`}>
          {d.signatures.map((s) => (
            <div key={s.role} className="break-inside-avoid">
              <p className="font-bold">{signerName(t, s.role)}</p>
              {s.image ? <img src={s.image} alt={`Chữ ký ${s.name}`} className="mx-auto h-16 w-auto" /> : <div className="h-16" />}
              <p className="font-semibold">{s.name}</p>
              {t.showSignTime && <p className="text-[0.85em] text-slate-500">{fmt(s.signedAt)}</p>}
            </div>
          ))}
        </div>
      </section>

      {t.footer.trim() && <p className="mt-8 border-t border-slate-300 pt-2 text-center text-[0.8em] italic text-slate-600">{t.footer}</p>}
    </article>
  );
}

// Dữ liệu mẫu cho bản xem trước ở trang sửa mẫu
export const SAMPLE_MINUTES: MinutesData = {
  code: "BB-CK01-01", reason: "Đội Xanh khiếu nại: cấu kiện Kiến thức thứ hai đã nằm trọn trong Trạm thành tựu nhưng chưa được cộng điểm. Tổ trọng tài xem lại camera và xác nhận khiếu nại hợp lệ.",
  reasonLabel: "Khiếu nại của đội thi", createdAt: "2026-11-21T09:35:00+07:00", createdBy: "trongtai@example.com",
  matchCode: "CK01", stage: "Chung kết xếp hạng", red: "Đội Đỏ mẫu", blue: "Đội Xanh mẫu",
  rows: [{ act: "Thêm", side: "Xanh – Đội Xanh mẫu", item: "Thu thập cấu kiện Kiến thức — xem lại camera", points: "+15" }],
  redBefore: 55, redAfter: 55, blueBefore: 45, blueAfter: 60, winnerBefore: "Đội Đỏ mẫu", winnerAfter: "Đội Xanh mẫu",
  signatures: [
    { role: "HEAD_REFEREE", name: "Nguyễn Văn A", image: "", signedAt: "2026-11-21T09:36:00+07:00" },
    { role: "TEAM_RED", name: "Trần Thị B", image: "", signedAt: "2026-11-21T09:37:00+07:00" },
    { role: "TEAM_BLUE", name: "Lê Văn C", image: "", signedAt: "2026-11-21T09:37:30+07:00" },
  ],
};
