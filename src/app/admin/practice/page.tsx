import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import PracticeAdmin, { type AdminSlot } from "@/components/admin/PracticeAdmin";

export const metadata: Metadata = { title: "Quản trị · Thử sa bàn" };
export const dynamic = "force-dynamic";

export default async function AdminPractice() {
  const staff = await requireStaff(["BTC"]);
  const from = new Date(Date.now() - 2 * 86400000).toISOString();
  const { data } = await createClient()
    .from("practice_slots")
    .select("id, starts_at, ends_at, capacity, location, practice_arena_bookings(id, status, check_in_at, teams(team_name))")
    .gte("starts_at", from)
    .order("starts_at");

  return (
    <AdminShell staff={staff} active="/admin/practice" title="Thử sa bàn">
      <PracticeAdmin slots={(data ?? []) as unknown as AdminSlot[]} />
    </AdminShell>
  );
}
