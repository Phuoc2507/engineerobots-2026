import type { Metadata } from "next";
import Link from "next/link";
import PortalShell from "@/components/register/PortalShell";
import ArenaViewer from "@/components/landing/ArenaViewer";
import ArenaVideo from "@/components/landing/ArenaVideo";

export const metadata: Metadata = {
  title: "Sa bàn 3D · FME JOURNEY 2026",
  description: "Mô hình 3D sa bàn 4800 × 4800 mm của FME JOURNEY 2026: xoay, phóng to để xem 3 chặng thi.",
};

export default function Arena3DPage() {
  return (
    <PortalShell title="Sa bàn 3D" subtitle="Kéo để xoay, cuộn / chụm hai ngón để phóng to, chọn góc nhìn từng chặng. Mô hình dựng theo bản vẽ thể lệ FME JOURNEY 2026 (đơn vị thật, tỉ lệ 1:1).">
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:p-4">
        <ArenaViewer />
        <ul className="mt-4 grid gap-2 px-1 text-sm text-slate-600 sm:grid-cols-3">
          <li><b className="text-team-red">Chặng 1</b> · 2 làn dò line hai bên biên</li>
          <li><b className="text-navy">Chặng 2</b> · 6 Cấu kiện Kiến thức + Bục Cơ hội</li>
          <li><b className="text-team-blue">Chặng 3</b> · Cầu Bản lĩnh, Địa hình + Bục Vinh Quang</li>
        </ul>
        <p className="mt-3 px-1 text-sm">
          <Link href="/rules#sa-ban" className="font-semibold text-navy-600 underline">Xem thông số chi tiết trong thể lệ</Link>
          <span className="mx-2 text-slate-300">·</span>
          <a href="/models/ban-ve-sa-ban-2026.pdf" className="font-semibold text-navy-600 underline">Tải bản vẽ kỹ thuật (PDF)</a>
        </p>
      </div>
      <div className="mt-6 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:p-4">
        <h2 className="px-1 font-display text-xl uppercase tracking-wide text-navy">Video mô phỏng một lượt thi</h2>
        <p className="mt-1 px-1 text-sm text-slate-600">
          Robot đỏ và xanh dò line Chặng 1, đưa Cấu kiện Kiến thức về Trạm thành tựu, tranh Cơ hội vàng, vượt Cầu Bản lĩnh rồi leo Bục Vinh Quang nhấn đèn ở Chặng 3. Chỉ minh hoạ, không phải chiến thuật bắt buộc.
        </p>
        <div className="mt-3 overflow-hidden rounded-lg">
          <ArenaVideo />
        </div>
      </div>
    </PortalShell>
  );
}
