import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import { SITE } from "@/lib/site";
import { eventName, minutesCode, REASON_TYPES, signerLabel, type Minutes, type MinutesEvent } from "@/lib/minutes";
import PrintButton from "@/components/referee/PrintButton";

export const metadata: Metadata = { title: "Biên bản chỉnh điểm" };
export const dynamic = "force-dynamic";

const TZ = "Asia/Ho_Chi_Minh";
const fmt = (s: string) => new Date(s).toLocaleString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

// Biên bản in được (A4): thông tin trận, nội dung, bảng thay đổi, điểm trước/sau và chữ ký các bên
export default async function MinutesView({ params }: { params: { id: string } }) {
  await requireStaff(["BTC", "HEAD_REFEREE"]);
  const supabase = createClient();
  const { data } = await supabase.from("match_minutes").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const mm = data as Minutes;
  const { data: m } = await supabase.from("matches").select("match_code, stage, start_time, red_team_id, blue_team_id").eq("id", mm.match_id).maybeSingle();
  const [{ data: teams }, { data: rules }] = await Promise.all([
    supabase.from("teams").select("id, team_name").in("id", [m?.red_team_id, m?.blue_team_id].filter(Boolean) as string[]),
    supabase.from("scoring_rules").select("rule_key, rule_name"),
  ]);
  const team = (id: string | null | undefined) => teams?.find((t) => t.id === id)?.team_name ?? "—";
  const side = (c: string) => (c === "RED" ? `Đỏ – ${team(m?.red_team_id)}` : `Xanh – ${team(m?.blue_team_id)}`);
  const winner = (id: string | null) => (id ? team(id) : "Chưa xác định / hòa");
  const rows: (MinutesEvent & { act: string })[] = [
    ...mm.changes.removed.map((e) => ({ ...e, act: "Xóa" })),
    ...mm.changes.added.map((e) => ({ ...e, act: "Thêm" })),
  ];
  const cell = "border border-slate-400 px-2 py-1.5 align-top";

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-4 print:hidden">
        <Link href="/referee/minutes" className="inline-flex items-center gap-1 text-sm font-bold text-navy-600"><ArrowLeft className="h-4 w-4" /> Danh sách biên bản</Link>
        <PrintButton className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-bold text-white" />
      </div>
      <article className="mx-auto max-w-[210mm] bg-white px-[15mm] py-[12mm] text-[13px] leading-relaxed text-black shadow print:shadow-none">
        <header className="flex items-start justify-between gap-4 text-center">
          <div className="text-xs font-bold uppercase">{SITE.organizer}<div className="font-normal normal-case">Ban tổ chức {SITE.name}</div></div>
          <div className="text-xs">Số: <b>{minutesCode(m?.match_code ?? null, mm.seq)}</b></div>
        </header>
        <h1 className="mt-6 text-center text-xl font-bold uppercase">Biên bản chỉnh điểm số trận đấu</h1>
        <p className="text-center italic">Lý do: {REASON_TYPES[mm.reason_type] ?? mm.reason_type}</p>

        <section className="mt-5 space-y-1">
          <p>Thời gian lập: <b>{fmt(mm.created_at)}</b> · Người lập trên hệ thống: {mm.created_by}</p>
          <p>Trận: <b>{m?.match_code}</b> · {m?.stage}</p>
          <p>Phe Đỏ: <b>{team(m?.red_team_id)}</b> · Phe Xanh: <b>{team(m?.blue_team_id)}</b></p>
        </section>

        <section className="mt-4">
          <p className="font-bold">I. Nội dung</p>
          <p className="whitespace-pre-wrap">{mm.reason}</p>
        </section>

        <section className="mt-4">
          <p className="font-bold">II. Các thay đổi điểm</p>
          <table className="mt-2 w-full border-collapse">
            <thead><tr className="bg-slate-100"><th className={cell}>STT</th><th className={cell}>Thao tác</th><th className={cell}>Phe</th><th className={cell}>Mục điểm / lỗi</th><th className={cell}>Điểm</th></tr></thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={`${e.act}${e.id}`}>
                  <td className={`${cell} text-center`}>{i + 1}</td>
                  <td className={cell}>{e.act}</td>
                  <td className={cell}>{side(e.team_color)}</td>
                  <td className={cell}>{eventName(e.event_type, rules ?? [])}{e.notes && <> — {e.notes}</>}</td>
                  <td className={`${cell} text-right`}>{e.act === "Xóa" ? "bỏ " : ""}{e.point_value > 0 ? "+" : ""}{e.point_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-4">
          <p className="font-bold">III. Kết quả sau chỉnh</p>
          <table className="mt-2 w-full border-collapse">
            <thead><tr className="bg-slate-100"><th className={cell}></th><th className={cell}>Trước</th><th className={cell}>Sau</th></tr></thead>
            <tbody>
              <tr><td className={cell}>Điểm phe Đỏ</td><td className={`${cell} text-center`}>{mm.red_before}</td><td className={`${cell} text-center font-bold`}>{mm.red_after}</td></tr>
              <tr><td className={cell}>Điểm phe Xanh</td><td className={`${cell} text-center`}>{mm.blue_before}</td><td className={`${cell} text-center font-bold`}>{mm.blue_after}</td></tr>
              <tr><td className={cell}>Đội thắng</td><td className={`${cell} text-center`}>{winner(mm.winner_before)}</td><td className={`${cell} text-center font-bold`}>{winner(mm.winner_after)}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="mt-6 break-inside-avoid">
          <p className="font-bold">IV. Xác nhận của các bên</p>
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            {mm.signatures.map((s) => (
              <div key={s.role} className="break-inside-avoid">
                <p className="font-bold">{signerLabel(s.role)}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={`Chữ ký ${s.name}`} className="mx-auto h-16 w-auto" />
                <p className="font-semibold">{s.name}</p>
                <p className="text-[11px] text-slate-500">{fmt(s.signed_at)}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
