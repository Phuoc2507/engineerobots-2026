import type { Metadata } from "next";
import StageScreen, { type StageView } from "@/components/stage/StageScreen";
import { getContent } from "@/lib/content-server";

export const metadata: Metadata = { title: "Màn hình sân khấu" };

const VIEWS: StageView[] = ["lich", "bangdiem", "anpham"];

export default async function StageMatchPage({ params, searchParams }: { params: { matchId: string }; searchParams: { view?: string } }) {
  const c = await getContent();
  const view = VIEWS.find((v) => v === searchParams.view) ?? "bangdiem";
  return <StageScreen s={c.stage} brand={{ logo: c.brand.markLogo || c.brand.logoMain, siteName: c.site.name }} view={view} matchId={params.matchId} />;
}
