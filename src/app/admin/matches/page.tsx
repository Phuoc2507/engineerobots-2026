import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import MatchManager, { type AdminMatch, type TeamOption } from "@/components/admin/MatchManager";

export const metadata: Metadata = { title: "Quản trị · Trận đấu" };
export const dynamic = "force-dynamic";

export default async function AdminMatches() {
  const staff = await requireStaff(["BTC"]);
  const supabase = createClient();
  const [{ data: matches }, { data: teams }] = await Promise.all([
    supabase.from("matches")
      .select("id, match_code, stage, status, start_time, duration_seconds, red_team_id, blue_team_id, red_score, blue_score, winner_team_id")
      .order("start_time", { ascending: true, nullsFirst: false }),
    supabase.from("teams").select("id, team_name, inspection_passed").eq("status", "APPROVED").order("team_name"),
  ]);

  return (
    <AdminShell staff={staff} active="/admin/matches" title="Trận đấu">
      <MatchManager matches={(matches ?? []) as AdminMatch[]} teams={(teams ?? []) as TeamOption[]} />
    </AdminShell>
  );
}
