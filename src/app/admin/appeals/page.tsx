import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import AppealsAdmin, { type AdminAppeal } from "@/components/admin/AppealsAdmin";

export const metadata: Metadata = { title: "Quản trị · Khiếu nại" };
export const dynamic = "force-dynamic";

export default async function AdminAppeals() {
  const staff = await requireStaff(["BTC", "HEAD_REFEREE"]);
  const { data } = await createClient()
    .from("match_appeals")
    .select("id, reason, status, resolution_notes, appeal_timestamp_seconds, created_at, teams(team_name), matches(id, match_code, stage, red_score, blue_score, red_team_id, blue_team_id)")
    .order("created_at", { ascending: false });
  return (
    <AdminShell staff={staff} active="/admin/appeals" title="Khiếu nại">
      <AppealsAdmin appeals={(data ?? []) as unknown as AdminAppeal[]} />
    </AdminShell>
  );
}
