import type { Metadata } from "next";
import StageBoard from "@/components/stage/StageBoard";
import { getContent } from "@/lib/content-server";

export const metadata: Metadata = { title: "Màn hình sân khấu" };

export default async function StageMatchPage({ params }: { params: { matchId: string } }) {
  return <StageBoard matchId={params.matchId} idle={(await getContent()).stage} />;
}
