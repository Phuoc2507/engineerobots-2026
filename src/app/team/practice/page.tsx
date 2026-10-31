import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { STUDENT_DOMAIN } from "@/lib/site";
import PortalShell, { AccountBar } from "@/components/register/PortalShell";
import PracticeBooking, { type PracticeSlot } from "@/components/team/PracticeBooking";

export const metadata: Metadata = { title: "Đăng ký lịch chạy thử · FME JOURNEY 2026" };

// Trang riêng để đội đặt lịch chạy thử sa bàn. Mỗi slot chỉ 1 đội (khóa ở RPC book_practice_slot) nên không trùng lịch.
export default async function PracticePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase() ?? "";
  if (!user || !email.endsWith(`@${STUDENT_DOMAIN}`)) redirect("/register");

  await supabase.rpc("claim_membership");
  const { data: ids } = await supabase.rpc("my_team_ids");
  const teamIds = (ids ?? []) as string[];
  if (!teamIds.length) redirect("/register");
  const { data: team } = await supabase.from("teams").select("team_name, status").in("id", teamIds).limit(1).maybeSingle();
  if (!team) redirect("/register");

  const approved = team.status === "APPROVED";
  const { data: slotData } = approved ? await supabase.rpc("list_practice_slots") : { data: null };

  return (
    <PortalShell title="Đăng ký lịch chạy thử" subtitle="Chạy thử trên sa bàn thật trước ngày thi 1 tuần. Mỗi khung giờ chỉ dành cho 1 đội, đặt trước để không trùng lịch.">
      <AccountBar email={email} />
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-white p-5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy-600" />
        <div>
          <p>Đội <b className="text-navy">{team.team_name}</b>. BTC mở lịch chạy thử 1 tuần trước ngày thi.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Khung giờ đã có đội đặt sẽ hiện “Kín” — chọn khung khác.</li>
            <li>Muốn đổi giờ: hủy khung đã đặt (trước giờ thử ít nhất 1 tiếng) rồi đặt khung mới.</li>
            <li>Có mặt đúng giờ và đưa mã QR của đội để BTC check-in.</li>
          </ul>
        </div>
      </div>
      <PracticeBooking slots={(slotData ?? []) as PracticeSlot[]} approved={approved} />
      <Link href="/team/dashboard" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-mech-red">
        <ArrowLeft className="h-4 w-4" /> Về trang Đội của tôi
      </Link>
    </PortalShell>
  );
}
