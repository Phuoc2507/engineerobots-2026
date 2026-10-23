import type { Metadata } from "next";
import StageBoard from "@/components/stage/StageBoard";

export const metadata: Metadata = { title: "Màn hình sân khấu" };

export default function StageMatchPage({ params }: { params: { matchId: string } }) {
  return <StageBoard matchId={params.matchId} />;
}
