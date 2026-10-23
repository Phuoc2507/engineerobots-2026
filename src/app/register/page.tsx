import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Info, ShieldCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SITE, STUDENT_DOMAIN } from "@/lib/site";
import GoogleSignIn from "@/components/register/GoogleSignIn";
import RegisterForm from "@/components/register/RegisterForm";
import PortalShell, { AccountBar, SignOutButton } from "@/components/register/PortalShell";

export const metadata: Metadata = { title: "Đăng ký đội thi · ENGINEEROBOTS 2026" };

const ERRORS: Record<string, string> = {
  domain: `Chỉ chấp nhận tài khoản @${STUDENT_DOMAIN}. Vui lòng đăng nhập lại bằng email sinh viên.`,
  auth: "Đăng nhập không thành công. Vui lòng thử lại.",
};

export default async function RegisterPage({ searchParams }: { searchParams: { error?: string; withdrawn?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase() ?? "";
  const validDomain = email.endsWith(`@${STUDENT_DOMAIN}`);

  // Đã là đội trưởng hoặc được thêm vào đội → về trang quản lý đội
  if (user && validDomain) {
    const { data: teamId } = await supabase.rpc("claim_membership");
    if (teamId) redirect("/team/dashboard");
  }

  const error = searchParams.error ? ERRORS[searchParams.error] : null;
  const closed = Date.now() > new Date(SITE.registrationDeadline).getTime();

  return (
    <PortalShell title="Đăng ký đội thi" subtitle="Đội 3–5 sinh viên K26 Khoa Cơ khí. Đội trưởng đăng nhập bằng email trường và khai báo cho cả đội.">
      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-mech-red/30 bg-red-50 p-4 text-sm text-mech-red">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
        </div>
      )}
      {searchParams.withdrawn && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy-600" /> Đã rút hồ sơ / rời đội. Bạn có thể đăng ký đội mới hoặc chờ đội trưởng khác thêm bạn.
        </div>
      )}

      {!user && <SignInCard />}

      {user && !validDomain && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <h2 className="font-display text-2xl uppercase text-navy">Sai tài khoản</h2>
          <p className="mt-2 text-slate-600">
            Bạn đang đăng nhập bằng <b>{email}</b>. Chỉ email <b>@{STUDENT_DOMAIN}</b> được đăng ký.
          </p>
          <div className="mt-5"><SignOutButton /></div>
        </div>
      )}

      {user && validDomain && (
        <>
          <AccountBar email={email} />
          {closed ? (
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
              <h2 className="font-display text-2xl uppercase text-navy">Đã hết hạn đăng ký</h2>
              <p className="mt-2 text-slate-600">Cổng đăng ký đã đóng. Liên hệ BTC qua fanpage Khoa Cơ khí nếu cần hỗ trợ.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-navy-600/20 bg-white p-4 text-sm text-slate-600">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy-600" />
                <p>
                  <b className="text-navy">Bạn là thành viên, không phải đội trưởng?</b> Không cần điền form — chờ đội trưởng thêm email{" "}
                  <b className="text-navy">{email}</b> vào đội, rồi tải lại trang này là thấy đội của mình.
                </p>
              </div>
              <RegisterForm email={email} defaultName={(user.user_metadata?.full_name as string | undefined) ?? ""} />
            </>
          )}
        </>
      )}
    </PortalShell>
  );
}

function SignInCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-xl shadow-navy/10 ring-1 ring-slate-200 md:p-10">
      <div className="mx-auto max-w-sm text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy-600/10">
          <ShieldCheck className="h-7 w-7 text-navy-600" />
        </span>
        <h2 className="mt-4 font-display text-2xl uppercase tracking-wide text-navy">Đăng nhập để tiếp tục</h2>
        <p className="mt-2 text-sm text-slate-600">
          Dùng tài khoản Google <b>@{STUDENT_DOMAIN}</b>. Đội trưởng tạo hồ sơ; thành viên đăng nhập là thấy đội của mình.
        </p>
        <div className="mt-6"><GoogleSignIn /></div>
      </div>
      <ul className="mt-8 grid gap-3 border-t border-slate-100 pt-6 text-sm text-slate-600 sm:grid-cols-3">
        <li className="flex gap-2"><Users className="h-5 w-5 shrink-0 text-mech-red" /> 3–5 thành viên K26</li>
        <li className="flex gap-2"><Clock className="h-5 w-5 shrink-0 text-mech-red" /> Khoảng 5 phút</li>
        <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-mech-red" /> BTC duyệt &amp; cấp QR</li>
      </ul>
    </div>
  );
}
