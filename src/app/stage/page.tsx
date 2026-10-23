import type { Metadata } from "next";
import { AutoStage } from "@/components/stage/StageBoard";

export const metadata: Metadata = { title: "Màn hình sân khấu" };

export default function StagePage() {
  return <AutoStage />;
}
