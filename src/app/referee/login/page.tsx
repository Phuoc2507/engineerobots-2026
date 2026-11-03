import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, Gavel } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/staff";
import { getContent } from "@/lib/content-server";
import GoogleSignIn from "@/components/register/GoogleSignIn";
import PortalShell, { SignOutButton } from "@/components/register/PortalShell";

export const metadata: Metadata = { title: "Đăng nhập BTC / Trọng tài · FME JOURNEY 2026" };

export default async function StaffLogin({ searchParams }: { searchParams: { error?: string } }) {
  const staff = await getStaff();
  if (staff) redirect(staff.role === "BTC" ? "/admin" : "/referee");
  const { data: { user } } = await createClient().auth.getUser();
  const notStaff = searchParams.error === "not_staff" || !!user;
  const c = await getContent();
  const CONTACT = c.contact;

  return (
    <PortalShell title={c.pages.staffTitle} subtitle={c.pages.staffSubtitle}>
      {notStaff && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-mech-red/30 bg-red-50 p-4 text-sm text-mech-red">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            {user ? <>Tài khoản <b>{user.email}</b></> : "Tài khoản vừa đăng nhập"} chưa có trong danh sách BTC/trọng tài.
            Nhờ Trưởng BTC thêm email của bạn ở mục <b>Nhân sự</b>{CONTACT.email ? <> hoặc liên hệ {CONTACT.email}</> : null}.
          </span>
        </div>
      )}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <h2 className="flex items-center gap-2 font-display text-2xl uppercase text-navy">
          <Gavel className="h-6 w-6 text-mech-red" /> Đăng nhập
        </h2>
        <p className="mt-2 text-sm text-slate-600">{c.pages.staffNote}</p>
        <div className="mt-5 max-w-sm">
          {user ? <SignOutButton to="/referee/login" /> : <GoogleSignIn staff next="/admin" />}
        </div>
      </div>
    </PortalShell>
  );
}
