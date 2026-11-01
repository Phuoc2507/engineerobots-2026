import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import TeamReview, { type AdminTeam } from "@/components/admin/TeamReview";

export const metadata: Metadata = { title: "Quản trị · Đội thi" };
export const dynamic = "force-dynamic";

export default async function AdminTeams() {
  const staff = await requireStaff(["BTC"]);
  const supabase = createClient();
  const [{ data }, { data: photoRows }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, team_name, major, cohort, status, review_note, leader_email, leader_phone, inspection_passed, created_at, updated_at, team_members(id, student_id, full_name, email, phone, role, joined_at)")
      .order("created_at", { ascending: true }),
    supabase.from("member_photos").select("team_id, email, path"),
  ]);

  // Ảnh chân dung do đội trưởng tải lên (bucket riêng tư → link ký tạm 2 giờ)
  const photos = (photoRows ?? []) as { team_id: string; email: string; path: string }[];
  const { data: signed } = photos.length
    ? await supabase.storage.from("member-photos").createSignedUrls(photos.map((p) => p.path), 7200)
    : { data: [] };
  const photoUrl = new Map(photos.map((p, i) => [`${p.team_id}/${p.email}`, signed?.[i]?.signedUrl ?? null]));
  const teams = ((data ?? []) as AdminTeam[]).map((t) => ({
    ...t,
    team_members: t.team_members.map((m) => ({ ...m, photo_url: photoUrl.get(`${t.id}/${m.email.toLowerCase()}`) ?? null })),
  }));

  return (
    <AdminShell staff={staff} active="/admin/teams" title="Đội thi">
      <TeamReview teams={teams} />
    </AdminShell>
  );
}
