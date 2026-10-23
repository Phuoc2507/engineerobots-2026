import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import ScoringPad, { type PadRule } from "@/components/referee/ScoringPad";

export const metadata: Metadata = { title: "Chấm điểm" };
export const dynamic = "force-dynamic";

export default async function ScoringPage({ params, searchParams }: { params: { matchId: string }; searchParams: { side?: string } }) {
  await requireStaff();
  const { data } = await createClient().from("scoring_rules").select("rule_key, rule_name, score_value").eq("is_active", true).order("score_value", { ascending: false });
  // Điểm Chặng 2 tính từ lưới cứ điểm → không cho bấm tay
  const rules = ((data ?? []) as PadRule[]).filter((r) => !r.rule_key.startsWith("STAGE2_"));
  const side = searchParams.side === "BLUE" ? "BLUE" : "RED";
  return <ScoringPad matchId={params.matchId} side={side} rules={rules} />;
}
