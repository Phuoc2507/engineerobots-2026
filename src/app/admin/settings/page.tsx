import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import { SettingsEditor, type VoteRow } from "@/components/admin/SimpleEditors";

export const metadata: Metadata = { title: "Quản trị · Cài đặt" };
export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const staff = await requireStaff(["BTC"]);
  const supabase = createClient();
  const [{ data: settings }, { data: votes }] = await Promise.all([
    supabase.from("app_settings").select("key, value"),
    supabase.rpc("vote_results"),
  ]);
  const get = (k: string) => (settings ?? []).find((s) => s.key === k)?.value;
  return (
    <AdminShell staff={staff} active="/admin/settings" title="Cài đặt">
      <SettingsEditor
        votingOpen={get("voting_open") === true}
        appealMinutes={Number(get("appeal_window_minutes") ?? 5)}
        votes={(votes ?? []) as VoteRow[]}
        emailReady={!!process.env.RESEND_API_KEY}
      />
    </AdminShell>
  );
}
