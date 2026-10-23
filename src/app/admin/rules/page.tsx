import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import AdminShell from "@/components/admin/AdminShell";
import { RulesEditor, type Rule } from "@/components/admin/SimpleEditors";

export const metadata: Metadata = { title: "Quản trị · Barem điểm" };
export const dynamic = "force-dynamic";

export default async function AdminRules() {
  const staff = await requireStaff(["BTC"]);
  const { data } = await createClient().from("scoring_rules").select("rule_key, rule_name, score_value, description, is_active").order("rule_key");
  return (
    <AdminShell staff={staff} active="/admin/rules" title="Barem điểm">
      <RulesEditor rules={(data ?? []) as Rule[]} />
    </AdminShell>
  );
}
