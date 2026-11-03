import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import DrawConsole, { type DrawTeam } from "@/components/draw/DrawConsole";

export const metadata: Metadata = { title: "Màn hình bốc thăm" };
export const dynamic = "force-dynamic";

export default async function DrawConsolePage({ params }: { params: { id: string } }) {
  await requireStaff(["BTC"]);
  const { data } = await createClient().from("teams").select("id, team_name").eq("status", "APPROVED").order("team_name");
  return <DrawConsole drawId={params.id} teams={(data ?? []) as DrawTeam[]} />;
}
