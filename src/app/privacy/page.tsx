import type { Metadata } from "next";
import { getContent } from "@/lib/content-server";
import PortalShell from "@/components/register/PortalShell";
import Doc from "@/components/content/Doc";

export const metadata: Metadata = { title: "Chính sách quyền riêng tư · FME JOURNEY 2026" };

// Trang bắt buộc cho màn hình xin quyền Google OAuth — nội dung BTC sửa ở /admin/content → Chính sách quyền riêng tư
export default async function PrivacyPage() {
  const c = await getContent();
  return (
    <PortalShell title={c.pages.privacyTitle} subtitle={c.pages.privacySubtitle}>
      <article className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-10 [&_li]:text-base [&_ul]:mt-3 [&_ul]:space-y-2">
        <Doc text={c.privacy.body} headingClass="mt-8 font-display text-xl uppercase tracking-wide text-navy first:mt-0" />
        {c.privacy.footer && (
          <p className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-500">{c.privacy.footer}</p>
        )}
      </article>
    </PortalShell>
  );
}
