import type { Metadata } from "next";
import { AutoStage } from "@/components/stage/StageBoard";
import { getContent } from "@/lib/content-server";

export const metadata: Metadata = { title: "Màn hình sân khấu" };

export default async function StagePage() {
  return <AutoStage idle={(await getContent()).stage} />;
}
