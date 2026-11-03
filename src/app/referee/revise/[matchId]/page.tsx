import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import { MATCH_STATUS } from "@/lib/site";
import { minutesCode, REASON_TYPES, SIGNER_ROLES, type MinutesEvent } from "@/lib/minutes";
import AdminShell from "@/components/admin/AdminShell";
import ReviseMatch from "@/components/referee/ReviseMatch";
import { getContent } from "@/lib/content-server";
import { signerName } from "@/components/referee/MinutesDoc";
import type { PadRule } from "@/components/referee/ScoringPad";

export const metadata: Metadata = { title: "Lập biên bản chỉnh điểm" };
export const dynamic = "force-dynamic";

export default async function RevisePage({ params }: { params: { matchId: string } }) {
  const staff = await requireStaff(["BTC", "HEAD_REFEREE"]);
  const supabase = createClient();
  const { data: m } = await supabase.from("matches")
    .select("id, match_code, stage, status, red_score, blue_score, red_team_id, blue_team_id").eq("id", params.matchId).maybeSingle();
  if (!m) notFound();
  const { minutes: minutesTpl } = await getContent();
  const [{ data: teams }, { data: events }, { data: rules }, { data: minutes }] = await Promise.all([
    supabase.from("teams").select("id, team_name").in("id", [m.red_team_id, m.blue_team_id].filter(Boolean) as string[]),
    supabase.from("match_events").select("id, team_color, event_type, point_value, notes, match_timestamp_seconds")
      .eq("match_id", m.id).neq("event_type", "FLIP").order("created_at"),
    supabase.from("scoring_rules").select("rule_key, rule_name, score_value, max_per_match").eq("is_active", true).order("score_value", { ascending: false }),
    supabase.from("match_minutes").select("id, seq, reason_type, created_at, red_before, blue_before, red_after, blue_after").eq("match_id", m.id).order("seq"),
  ]);
  const team = (id: string | null) => teams?.find((t) => t.id === id)?.team_name ?? "—";
  const editable = ["RUNNING", "PAUSED", "FINISHED"].includes(m.status);

  return (
    <AdminShell staff={staff} active="/referee/minutes" title={`Chỉnh điểm trận ${m.match_code ?? ""}`}
      actions={<Link href="/referee/minutes" className="inline-flex items-center gap-1 text-sm font-bold text-navy-600 hover:text-mech-red"><ArrowLeft className="h-4 w-4" /> Danh sách biên bản</Link>}>
      <p className="mb-4 text-sm text-slate-600">
        {m.stage} · {MATCH_STATUS[m.status] ?? m.status} · <b className="text-team-red">{team(m.red_team_id)}</b> {m.red_score}–{m.blue_score} <b className="text-team-blue">{team(m.blue_team_id)}</b>
      </p>
      {(minutes ?? []).length > 0 && (
        <div className="mb-6 rounded-xl bg-white p-4 text-sm ring-1 ring-slate-200">
          <p className="font-bold text-navy">Biên bản đã lập cho trận này</p>
          <ul className="mt-2 space-y-1">
            {minutes!.map((x) => (
              <li key={x.id}>
                <Link href={`/referee/minutes/${x.id}`} className="font-semibold text-navy-600 underline">{minutesCode(m.match_code, x.seq)}</Link>
                {" · "}{REASON_TYPES[x.reason_type] ?? x.reason_type} · Đỏ {x.red_before}→{x.red_after}, Xanh {x.blue_before}→{x.blue_after}
              </li>
            ))}
          </ul>
        </div>
      )}
      {editable ? (
        <ReviseMatch
          match={{ id: m.id, code: m.match_code ?? "", stage: m.stage, status: m.status, red_score: m.red_score, blue_score: m.blue_score, red_name: team(m.red_team_id), blue_name: team(m.blue_team_id) }}
          events={(events ?? []) as MinutesEvent[]} rules={(rules ?? []) as PadRule[]} myName={staff.full_name ?? ""}
          labels={Object.fromEntries(SIGNER_ROLES.map((s) => [s.role, signerName(minutesTpl, s.role)]))}
        />
      ) : (
        <p className="rounded-xl bg-white p-6 text-center text-slate-600 ring-1 ring-slate-200">Trận chưa bắt đầu nên chưa có điểm để chỉnh.</p>
      )}
    </AdminShell>
  );
}
