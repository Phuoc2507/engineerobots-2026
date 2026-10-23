import type { Metadata } from "next";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import CheckIn from "@/components/admin/CheckIn";

export const metadata: Metadata = { title: "Check-in & Kiểm tra kỹ thuật" };
export const dynamic = "force-dynamic";

export default async function AdminCheckIn() {
  const staff = await requireStaff();
  return (
    <AdminShell staff={staff} active="/admin/checkin" title="Check-in & Kiểm tra kỹ thuật">
      <CheckIn />
    </AdminShell>
  );
}
