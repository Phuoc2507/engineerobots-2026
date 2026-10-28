"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { VOTE_CATEGORIES } from "@/lib/site";

export type PublicTeam = { id: string; team_name: string; logo_url: string | null; major: string };

const KEY = "er26_voter";
const PICKS = "er26_votes";

// Mã thiết bị ẩn danh để mỗi máy bình chọn một lần mỗi hạng mục (đổi lựa chọn được)
function voterId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) { id = `v-${crypto.randomUUID()}`; localStorage.setItem(KEY, id); }
    return id;
  } catch {
    return `v-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

export default function VoteBoard({ teams, open }: { teams: PublicTeam[]; open: boolean }) {
  const [cat, setCat] = useState(VOTE_CATEGORIES[0].key);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try { setPicks(JSON.parse(localStorage.getItem(PICKS) ?? "{}")); } catch { /* bỏ qua */ }
  }, []);

  const vote = async (teamId: string) => {
    setBusy(teamId); setError("");
    const { error: e } = await createClient().rpc("cast_vote", { p_fingerprint: voterId(), p_team: teamId, p_category: cat });
    setBusy(null);
    if (e) { setError(e.message); return; }
    const next = { ...picks, [cat]: teamId };
    setPicks(next);
    try { localStorage.setItem(PICKS, JSON.stringify(next)); } catch { /* bỏ qua */ }
  };

  return (
    <div>
      {!open && <p className="mb-5 rounded-lg bg-mech-gold/15 p-4 text-center text-sm font-semibold text-amber-800">Cổng bình chọn chưa mở — BTC sẽ mở vào ngày thi đấu.</p>}
      <div role="tablist" className="flex flex-wrap gap-2">
        {VOTE_CATEGORIES.map((c) => (
          <button key={c.key} role="tab" aria-selected={cat === c.key} onClick={() => setCat(c.key)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${cat === c.key ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-slate-200"}`}>
            {c.label} {picks[c.key] && <CheckCircle2 className="ml-1 inline h-4 w-4 text-emerald-400" />}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-mech-red">{error}</p>}

      {teams.length === 0 ? (
        <p className="mt-6 rounded-lg bg-ice p-6 text-center text-sm text-slate-500">Danh sách đội sẽ hiện sau khi BTC duyệt hồ sơ.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => {
            const mine = picks[cat] === t.id;
            return (
              <li key={t.id} className={`flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ${mine ? "ring-2 ring-emerald-500" : "ring-slate-200"}`}>
                <div className="flex items-center gap-3">
                  {t.logo_url
                    ? <img src={t.logo_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    : <span className="grid h-12 w-12 place-items-center rounded-lg bg-navy font-display text-xl text-white">{t.team_name.slice(0, 1)}</span>}
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg uppercase text-navy">{t.team_name}</span>
                    <span className="block truncate text-xs text-slate-500">{t.major}</span>
                  </span>
                </div>
                <button disabled={!open || busy !== null || mine} onClick={() => vote(t.id)}
                  className={`mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold disabled:cursor-not-allowed ${mine ? "bg-emerald-50 text-emerald-700" : "bg-mech-red text-white disabled:opacity-40"}`}>
                  {busy === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : mine ? <><CheckCircle2 className="h-4 w-4" /> Bạn đã chọn</> : "Bình chọn"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-center text-xs text-slate-400">Mỗi thiết bị một phiếu cho mỗi hạng mục; chọn đội khác sẽ chuyển phiếu.</p>
    </div>
  );
}
