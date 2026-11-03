import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getContent } from "@/lib/content-server";
import PortalShell from "@/components/register/PortalShell";
import VoteBoard, { type PublicTeam } from "@/components/vote/VoteBoard";

export const metadata: Metadata = { title: "Bình chọn · FME JOURNEY 2026" };
export const dynamic = "force-dynamic";

export default async function VotePage() {
  const supabase = createClient();
  const [{ data: teams }, { data: setting }, c] = await Promise.all([
    supabase.rpc("get_public_teams"),
    supabase.from("app_settings").select("value").eq("key", "voting_open").maybeSingle(),
    getContent(),
  ]);
  const v = (setting as { value: unknown } | null)?.value;
  const open = v === true || v === "true";

  return (
    <PortalShell title={c.pages.voteTitle} subtitle={c.pages.voteSubtitle}>
      <VoteBoard teams={(teams ?? []) as PublicTeam[]} open={open} />
    </PortalShell>
  );
}
