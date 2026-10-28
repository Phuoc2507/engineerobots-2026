import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import TeamReview, { type AdminTeam } from "@/components/admin/TeamReview";

export const metadata: Metadata = { title: "Quản trị · Đội thi" };
export const dynamic = "force-dynamic";

export default async function AdminTeams() {
  const staff = await requireStaff(["BTC"]);
  const { data } = await createClient()
    .from("teams")
    .select("id, team_name, major, cohort, status, review_note, leader_email, leader_phone, inspection_passed, created_at, updated_at, team_members(id, student_id, full_name, email, phone, role, joined_at)")
    .order("created_at", { ascending: true });

  return (
    <AdminShell staff={staff} active="/admin/teams" title="Đội thi">
      <TeamReview teams={(data ?? []) as AdminTeam[]} />
    </AdminShell>
  );
}
