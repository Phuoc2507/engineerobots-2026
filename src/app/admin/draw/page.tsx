import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import DrawManager, { type DrawRow } from "@/components/draw/DrawManager";

export const metadata: Metadata = { title: "Quản trị · Bốc thăm" };
export const dynamic = "force-dynamic";

export default async function AdminDraw() {
  const staff = await requireStaff(["BTC"]);
  const supabase = createClient();
  const [{ data: draws }, { count }] = await Promise.all([
    supabase.rpc("get_draws"),
    supabase.from("teams").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
  ]);
  return (
    <AdminShell staff={staff} active="/admin/draw" title="Bốc thăm bảng đấu">
      <p className="mb-5 text-sm text-slate-600">
        Tạo lượt bốc thăm, mở <b>Màn hình bốc thăm</b> trên máy chiếu. BTC chọn đội lên bốc thăm, đại diện đội bấm <b>QUAY</b> để nhận vị trí (A1, B1, …) trong bảng đấu.
      </p>
      <DrawManager draws={(draws ?? []) as DrawRow[]} teamCount={count ?? 0} />
    </AdminShell>
  );
}
