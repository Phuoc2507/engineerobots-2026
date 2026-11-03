import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/staff";
import { mergeContent } from "@/lib/content";
import AdminShell from "@/components/admin/AdminShell";
import ContentEditor from "@/components/admin/ContentEditor";

export const metadata: Metadata = { title: "Quản trị · Giao diện & nội dung" };
export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const staff = await requireStaff(["BTC"]);
  // Đọc thẳng DB (không qua cache) để form luôn khớp bản vừa lưu
  const { data } = await createClient().from("site_content").select("key, value");
  const rows = (data ?? []) as { key: string; value: unknown }[];
  return (
    <AdminShell staff={staff} active="/admin/content" title="Giao diện & nội dung"
      actions={<Link href="/" target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-navy-600 hover:text-mech-red"><ExternalLink className="h-4 w-4" /> Xem trang chủ</Link>}>
      <ContentEditor content={mergeContent(rows)} edited={rows.map((r) => r.key)} />
    </AdminShell>
  );
}
