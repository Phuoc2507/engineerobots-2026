import type { Metadata } from "next";
import StageBoard from "@/components/stage/StageBoard";

export const metadata: Metadata = { title: "OBS overlay" };

export default function ObsMatchPage({ params }: { params: { matchId: string } }) {
  return <StageBoard matchId={params.matchId} variant="obs" />;
}
