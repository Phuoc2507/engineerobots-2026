import type { Metadata } from "next";
import { requireStaff } from "@/lib/staff";
import Controller from "@/components/referee/Controller";

export const metadata: Metadata = { title: "Bàn điều khiển trận" };
export const dynamic = "force-dynamic";

export default async function ControllerPage({ params }: { params: { matchId: string } }) {
  const staff = await requireStaff(["BTC", "HEAD_REFEREE"]);
  return <Controller matchId={params.matchId} canReset={staff.role === "BTC"} />;
}
