import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import { getContent } from "@/lib/content-server";
import { eventName, minutesCode, REASON_TYPES, type Minutes, type MinutesEvent } from "@/lib/minutes";
import PrintButton from "@/components/referee/PrintButton";
import MinutesDoc from "@/components/referee/MinutesDoc";

export const metadata: Metadata = { title: "Biên bản trận đấu" };
export const dynamic = "force-dynamic";

// Biên bản in được (A4): thông tin trận, nội dung, bảng thay đổi, điểm trước/sau và chữ ký các bên — trình bày theo mẫu BTC đặt
export default async function MinutesView({ params }: { params: { id: string } }) {
  const staff = await requireStaff(["BTC", "HEAD_REFEREE"]);
  const supabase = createClient();
  const { data } = await supabase.from("match_minutes").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const mm = data as Minutes;
  const { data: m } = await supabase.from("matches").select("match_code, stage, start_time, red_team_id, blue_team_id").eq("id", mm.match_id).maybeSingle();
  const [{ data: teams }, { data: rules }, c] = await Promise.all([
    supabase.from("teams").select("id, team_name").in("id", [m?.red_team_id, m?.blue_team_id].filter(Boolean) as string[]),
    supabase.from("scoring_rules").select("rule_key, rule_name"),
    getContent(),
  ]);
  const team = (id: string | null | undefined) => teams?.find((t) => t.id === id)?.team_name ?? "—";
  const side = (col: string) => (col === "RED" ? `Đỏ – ${team(m?.red_team_id)}` : `Xanh – ${team(m?.blue_team_id)}`);
  const winner = (id: string | null) => (id ? team(id) : "Chưa xác định / hòa");
  const row = (act: string) => (e: MinutesEvent) => ({
    act, side: side(e.team_color),
    item: `${eventName(e.event_type, rules ?? [])}${e.notes ? ` — ${e.notes}` : ""}`,
    points: `${act === "Xóa" ? "bỏ " : ""}${e.point_value > 0 ? "+" : ""}${e.point_value}`,
  });

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 print:hidden">
        <Link href="/referee/minutes" className="inline-flex items-center gap-1 text-sm font-bold text-navy-600"><ArrowLeft className="h-4 w-4" /> Danh sách biên bản</Link>
        <div className="flex flex-wrap items-center gap-3">
          {staff.role === "BTC" && (
            <Link href="/admin/content?muc=minutes" className="inline-flex items-center gap-1 text-sm font-bold text-navy-600"><Palette className="h-4 w-4" /> Sửa mẫu biên bản</Link>
          )}
          <PrintButton className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-bold text-white" />
        </div>
      </div>
      <MinutesDoc t={c.minutes} d={{
        code: minutesCode(m?.match_code ?? null, mm.seq), reason: mm.reason, reasonLabel: REASON_TYPES[mm.reason_type] ?? mm.reason_type,
        createdAt: mm.created_at, createdBy: mm.created_by, matchCode: m?.match_code ?? "—", stage: m?.stage ?? "",
        red: team(m?.red_team_id), blue: team(m?.blue_team_id),
        rows: [...mm.changes.removed.map(row("Xóa")), ...mm.changes.added.map(row("Thêm"))],
        redBefore: mm.red_before, redAfter: mm.red_after, blueBefore: mm.blue_before, blueAfter: mm.blue_after,
        winnerBefore: winner(mm.winner_before), winnerAfter: winner(mm.winner_after),
        signatures: mm.signatures.map((s) => ({ role: s.role, name: s.name, image: s.image, signedAt: s.signed_at })),
      }} />
    </div>
  );
}
