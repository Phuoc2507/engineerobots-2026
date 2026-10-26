import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";
import PortalShell from "@/components/register/PortalShell";
import VoteBoard, { type PublicTeam } from "@/components/vote/VoteBoard";

export const metadata: Metadata = { title: "Bình chọn · ENGINEEROBOTS 2026" };
export const dynamic = "force-dynamic";

export default async function VotePage() {
  const supabase = createClient();
  const [{ data: teams }, { data: setting }] = await Promise.all([
    supabase.rpc("get_public_teams"),
    supabase.from("app_settings").select("value").eq("key", "voting_open").maybeSingle(),
  ]);
  const v = (setting as { value: unknown } | null)?.value;
  const open = v === true || v === "true";

  return (
    <PortalShell title="Bình chọn khán giả" subtitle={`Chọn đội bạn yêu thích nhất tại ${SITE.name}.`}>
      <VoteBoard teams={(teams ?? []) as PublicTeam[]} open={open} />
    </PortalShell>
  );
}
