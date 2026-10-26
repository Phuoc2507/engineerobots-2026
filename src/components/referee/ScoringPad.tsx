"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Undo2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { countEv, evLabel, fmtClock, useMatchLive, type Color } from "@/lib/match";
import { MATCH_STATUS } from "@/lib/site";

export type PadRule = { rule_key: string; rule_name: string; score_value: number; max_per_match: number | null };

// Bảng chấm cho trọng tài biên: nút luật cộng điểm, đánh dấu và lỗi của một phe
export default function ScoringPad({ matchId, side, rules }: { matchId: string; side: Color; rules: PadRule[] }) {
  const { data, missing, remaining, refresh } = useMatchLive(matchId);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const red = side === "RED";
  const accent = red ? "bg-team-red" : "bg-team-blue";
  const live = data && (data.match.status === "RUNNING" || data.match.status === "PAUSED");

  const rpc = async (key: string, fn: string, args: Record<string, unknown>, ok?: string) => {
    setBusy(key); setError("");
    const { error: e } = await createClient().rpc(fn, args);
    setBusy(null);
    if (e) setError(e.message);
    else if (ok) { setFlash(ok); setTimeout(() => setFlash(""), 1500); navigator.vibrate?.(40); }
    refresh();
  };

  if (missing) return <p className="p-8 text-center text-slate-600">Không tìm thấy trận. <Link href="/referee" className="underline">Quay lại</Link></p>;
  if (!data) return <p className="flex items-center justify-center gap-2 p-8 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải…</p>;

  const m = data.match;
  const team = red ? data.red : data.blue;
  const myScore = red ? m.red_score : m.blue_score;
  const oppScore = red ? m.blue_score : m.red_score;
  const myEvents = data.events.filter((e) => e.team_color === side && e.event_type !== "FLIP").slice(0, 8);
  const fouls = rules.filter((r) => r.score_value < 0);
  const plus = rules.filter((r) => r.score_value > 0);
  const marks = rules.filter((r) => r.score_value === 0);
  const used = (r: PadRule) => countEv(data.events, side, r.rule_key);
  const full = (r: PadRule) => r.max_per_match != null && used(r) >= r.max_per_match;
  const tally = (r: PadRule) => (r.max_per_match != null ? ` (${used(r)}/${r.max_per_match})` : "");

  return (
    <div className="min-h-screen bg-slate-950 pb-10 text-white">
      <header className={`${accent} sticky top-0 z-10 px-4 py-3 shadow-lg`}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <Link href="/referee" aria-label="Danh sách trận"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase opacity-80">{m.match_code} · Phe {red ? "Đỏ" : "Xanh"} · {MATCH_STATUS[m.status] ?? m.status}</p>
            <p className="truncate font-display text-lg uppercase">{team?.team_name ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl leading-none tabular-nums">{myScore}</p>
            <p className="text-xs opacity-80">đối thủ {oppScore}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-5 px-4 pt-4">
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2">
          <span className="text-sm text-white/60">Đồng hồ</span>
          <span className={`font-display text-3xl tabular-nums ${remaining <= 30 && m.status === "RUNNING" ? "text-mech-red" : ""}`}>{fmtClock(remaining)}</span>
        </div>
        {!live && <p className="rounded-lg bg-mech-gold/20 p-3 text-sm text-mech-gold">Trận chưa bắt đầu hoặc đã kết thúc — các nút chấm đang khóa.</p>}
        {error && <p role="alert" className="rounded-lg bg-mech-red/20 p-3 text-sm text-red-200">{error}</p>}
        {flash && <p role="status" className="rounded-lg bg-emerald-500/20 p-3 text-sm font-bold text-emerald-300">{flash}</p>}

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Ghi điểm</h2>
          <div className="grid grid-cols-2 gap-2">
            {plus.map((r) => (
              <button key={r.rule_key} disabled={!live || busy !== null || full(r)} onClick={() => rpc(r.rule_key, "ref_add_event", { p_match: matchId, p_color: side, p_rule_key: r.rule_key }, `+${r.score_value} ${r.rule_name}`)}
                className="min-h-[72px] rounded-xl bg-emerald-600 px-3 py-2 text-left text-sm font-bold transition active:scale-95 disabled:opacity-40">
                <span className="block font-display text-2xl">+{r.score_value}</span>{r.rule_name}{tally(r)}
              </button>
            ))}
          </div>
          <h2 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-white/50">Retry (tối đa 3) / cảnh cáo (tái phạm → truất quyền)</h2>
          <div className="grid grid-cols-2 gap-2">
            {marks.map((r) => (
              <button key={r.rule_key} disabled={!live || busy !== null || full(r)}
                onClick={() => { if (r.rule_key !== "WARNING" || window.confirm("Ghi cảnh cáo hành vi? Tái phạm sau 1 cảnh cáo sẽ bị truất quyền thi đấu.")) rpc(r.rule_key, "ref_add_event", { p_match: matchId, p_color: side, p_rule_key: r.rule_key }, r.rule_name); }}
                className={`min-h-[60px] rounded-xl px-3 py-2 text-left text-sm font-bold transition active:scale-95 disabled:opacity-40 ${r.rule_key === "WARNING" ? "bg-mech-gold text-navy" : "bg-white/15"}`}>
                <span className="block font-display text-2xl">{used(r)}/{r.max_per_match ?? "∞"}</span>{r.rule_name}
              </button>
            ))}
          </div>
          <h2 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-white/50">Lỗi / phạt</h2>
          <div className="grid grid-cols-2 gap-2">
            {fouls.map((r) => (
              <button key={r.rule_key} disabled={!live || busy !== null} onClick={() => rpc(r.rule_key, "ref_add_event", { p_match: matchId, p_color: side, p_rule_key: r.rule_key }, `${r.score_value} ${r.rule_name}`)}
                className="min-h-[72px] rounded-xl bg-mech-red px-3 py-2 text-left text-sm font-bold transition active:scale-95 disabled:opacity-40">
                <span className="block font-display text-2xl">{r.score_value}</span>{r.rule_name}
              </button>
            ))}
          </div>
          <button disabled={!live || busy !== null || myEvents.length === 0}
            onClick={() => { if (window.confirm("Hoàn tác lần ghi điểm gần nhất của phe này?")) rpc("undo", "ref_undo_last", { p_match: matchId, p_color: side }, "Đã hoàn tác"); }}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-sm font-bold disabled:opacity-40">
            <Undo2 className="h-4 w-4" /> Hoàn tác lần gần nhất
          </button>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Nhật ký phe {red ? "Đỏ" : "Xanh"}</h2>
          <ul className="space-y-1 text-sm">
            {myEvents.length === 0 && <li className="text-white/40">Chưa có sự kiện.</li>}
            {myEvents.map((e) => (
              <li key={e.id} className="flex justify-between rounded bg-white/5 px-3 py-1.5">
                <span>{e.match_timestamp_seconds != null && <span className="mr-2 text-white/40">{fmtClock(e.match_timestamp_seconds)}</span>}{evLabel(e)}</span>
                <b className={e.point_value < 0 ? "text-red-300" : "text-emerald-300"}>{e.point_value > 0 ? "+" : ""}{e.point_value}</b>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
