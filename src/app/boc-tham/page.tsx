import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PortalShell from "@/components/register/PortalShell";
import DrawLive from "@/components/draw/DrawLive";
import { getContent } from "@/lib/content-server";

export const metadata: Metadata = { title: "Kết quả bốc thăm · FME JOURNEY 2026" };
export const dynamic = "force-dynamic";

type Row = { id: string; name: string; total: number; filled: number };

export default async function DrawPublic({ searchParams }: { searchParams: { id?: string } }) {
  const [{ data }, c] = await Promise.all([createClient().rpc("get_draws"), getContent()]);
  const draws = (data ?? []) as Row[];
  const current = draws.find((d) => d.id === searchParams.id) ?? draws[0];
  return (
    <PortalShell title={c.pages.drawTitle} subtitle={c.pages.drawSubtitle}>
      {draws.length > 1 && (
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Các lượt bốc thăm">
          {draws.map((d) => (
            <Link key={d.id} href={`/boc-tham?id=${d.id}`} aria-current={d.id === current?.id ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ring-1 ${d.id === current?.id ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-slate-300"}`}>
              {d.name}
            </Link>
          ))}
        </nav>
      )}
      {current ? <DrawLive drawId={current.id} /> : <p className="rounded-xl bg-white p-6 text-center text-slate-600 ring-1 ring-slate-200">{c.pages.drawEmpty}</p>}
    </PortalShell>
  );
}
