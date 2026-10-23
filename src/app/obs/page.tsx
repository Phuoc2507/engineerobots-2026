import type { Metadata } from "next";
import { AutoStage } from "@/components/stage/StageBoard";

export const metadata: Metadata = { title: "OBS overlay" };

export default function ObsPage() {
  return <AutoStage variant="obs" />;
}
