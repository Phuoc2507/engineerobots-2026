import type { Metadata } from "next";
import Link from "next/link";
import PortalShell from "@/components/register/PortalShell";
import ArenaViewer from "@/components/landing/ArenaViewer";

export const metadata: Metadata = {
  title: "Sa bàn 3D · ENGINEEROBOTS 2026",
  description: "Mô hình 3D sa bàn 4,8 × 4,8 m của ENGINEEROBOTS 2026: xoay, phóng to để xem 3 chặng thi.",
};

export default function Arena3DPage() {
  return (
    <PortalShell title="Sa bàn 3D" subtitle="Kéo để xoay, cuộn / chụm hai ngón để phóng to. Mô hình dựng theo bản vẽ thể lệ 2026 (đơn vị thật, tỉ lệ 1:1).">
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:p-4">
        <ArenaViewer />
        <ul className="mt-4 grid gap-2 px-1 text-sm text-slate-600 sm:grid-cols-3">
          <li><b className="text-team-red">Chặng 1</b> · 2 làn dò line hai bên biên</li>
          <li><b className="text-navy">Chặng 2</b> · 6 khối cấu kiện + bục dốc Khối Vàng</li>
          <li><b className="text-team-blue">Chặng 3</b> · 4 cứ điểm góc + Master Tower</li>
        </ul>
        <p className="mt-3 px-1 text-sm"><Link href="/rules#sa-ban" className="font-semibold text-navy-600 underline">Xem thông số chi tiết trong thể lệ</Link></p>
      </div>
    </PortalShell>
  );
}
