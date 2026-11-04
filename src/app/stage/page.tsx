import type { Metadata } from "next";
import StageScreen, { type StageView } from "@/components/stage/StageScreen";
import { getContent } from "@/lib/content-server";

export const metadata: Metadata = { title: "Màn hình sân khấu" };

const VIEWS: StageView[] = ["auto", "lich", "anpham"];

// ?view=lich: lịch thi đấu toàn màn hình · ?view=anpham: trình chiếu ấn phẩm · mặc định tự chuyển bảng điểm / màn chờ
export default async function StagePage({ searchParams }: { searchParams: { view?: string } }) {
  const c = await getContent();
  const view = VIEWS.find((v) => v === searchParams.view) ?? "auto";
  return <StageScreen s={c.stage} siteName={c.site.name} view={view} />;
}
