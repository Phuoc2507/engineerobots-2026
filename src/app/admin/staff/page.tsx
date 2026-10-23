import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import { StaffEditor, type StaffRow } from "@/components/admin/SimpleEditors";

export const metadata: Metadata = { title: "Quản trị · Nhân sự" };
export const dynamic = "force-dynamic";

export default async function AdminStaff() {
  const staff = await requireStaff(["BTC"]);
  const { data } = await createClient().from("staff").select("email, full_name, role, created_at").order("role").order("email");
  return (
    <AdminShell staff={staff} active="/admin/staff" title="Nhân sự">
      <StaffEditor rows={(data ?? []) as StaffRow[]} me={staff.email} />
    </AdminShell>
  );
}
