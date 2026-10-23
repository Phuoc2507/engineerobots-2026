import type { Metadata } from "next";
import Paddock from "@/components/stage/Paddock";

export const metadata: Metadata = { title: "Khu chờ thi đấu" };

export default function PaddockPage() {
  return <Paddock />;
}
