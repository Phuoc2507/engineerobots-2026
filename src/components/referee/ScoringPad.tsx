"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, Minus, MonitorPlay, Undo2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { countEv, evLabel, fmtClock, ruleApplies, SCORE_GROUPS, scoreGroup, SIDE_LABEL, useMatchLive, type Color } from "@/lib/match";
import { MATCH_STATUS } from "@/lib/site";

export type PadRule = { rule_key: string; rule_name: string; score_value: number; max_per_match: number | null };

type Toast = { text: string; ok: boolean; undoKey?: string };

// Bàn nhập điểm của thư ký (mỗi thư ký 1 phe): các ô xếp theo chặng như trọng tài sân báo,
// chạm ô = ghi 1 lần, nút "−" ở góc = xóa lần ghi gần nhất của đúng mục đó
export default function ScoringPad({ matchId, side, rules }: { matchId: string; side: Color; rules: PadRule[] }) {
  const { data, missing, remaining, refresh } = useMatchLive(matchId);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast | null>(null);
  const [showAll, setShowAll] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const red = side === "RED";
  const accent = red ? "bg-team-red" : "bg-team-blue";
  const live = !!data && (data.match.status === "RUNNING" || data.match.status === "PAUSED");

  const flash = (t: Toast) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), t.ok ? 4000 : 6000);
  };

  const rpc = async (busyKey: string, fn: string, args: Record<string, unknown>, ok: string, undoKey?: string) => {
    setPending((s) => new Set(s).add(busyKey));
    const { error } = await createClient().rpc(fn, args);
    setPending((s) => { const n = new Set(s); n.delete(busyKey); return n; });
    if (error) flash({ text: error.message, ok: false });
    else { flash({ text: ok, ok: true, undoKey }); navigator.vibrate?.(35); }
    refresh();
  };
  const add = (r: PadRule) => rpc(`+${r.rule_key}`, "ref_add_event", { p_match: matchId, p_color: side, p_rule_key: r.rule_key },
    `${r.score_value > 0 ? "+" : ""}${r.score_value || ""} ${r.rule_name}`.trim(), r.rule_key);
  const remove = (r: PadRule) => rpc(`-${r.rule_key}`, "ref_remove_event", { p_match: matchId, p_color: side, p_rule_key: r.rule_key },
    `Đã xóa 1 lần: ${r.rule_name}`);

  if (missing) return <p className="p-8 text-center text-slate-600">Không tìm thấy trận. <Link href="/referee" className="underline">Quay lại</Link></p>;
  if (!data) return <p className="flex items-center justify-center gap-2 p-8 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải…</p>;

  const m = data.match;
  const team = red ? data.red : data.blue;
  const myScore = red ? m.red_score : m.blue_score;
  const oppScore = red ? m.blue_score : m.red_score;
  const myEvents = data.events.filter((e) => e.team_color === side && e.event_type !== "FLIP").slice(0, 10);
  const used = (r: PadRule) => countEv(data.events, side, r.rule_key);
  const full = (r: PadRule) => r.max_per_match != null && used(r) >= r.max_per_match;
  const visible = rules.filter((r) => showAll || ruleApplies(r.rule_key, m.stage));
  const hidden = rules.length - rules.filter((r) => ruleApplies(r.rule_key, m.stage)).length;

  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-white">
      <header className={`${accent} sticky top-0 z-20 px-4 py-2.5 shadow-lg`}>
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link href="/referee" aria-label="Danh sách trận"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase opacity-80">Thư ký phe {SIDE_LABEL[side]} · {m.match_code} · {m.stage} · {MATCH_STATUS[m.status] ?? m.status}</p>
            <p className="truncate font-display text-xl uppercase">{team?.team_name ?? "—"}</p>
          </div>
          <span className={`hidden rounded-lg bg-black/25 px-3 py-1 font-display text-2xl tabular-nums sm:block ${remaining <= 30 && m.status === "RUNNING" ? "animate-pulse" : ""}`}>{fmtClock(remaining)}</span>
          <div className="text-right">
            <p className="font-display text-4xl leading-none tabular-nums">{myScore}</p>
            <p className="text-xs opacity-80">đối thủ {oppScore}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-3 pt-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-white/10 px-3 py-1.5 font-display text-xl tabular-nums sm:hidden">{fmtClock(remaining)}</span>
          {!live && <p className="flex-1 rounded-lg bg-mech-gold/20 px-3 py-2 text-mech-gold">Trận chưa bắt đầu hoặc đã kết thúc: các ô nhập điểm đang khóa. Sửa điểm sau trận do trọng tài chính lập biên bản.</p>}
          <span className="ml-auto flex flex-wrap gap-2">
            {hidden > 0 && (
              <button onClick={() => setShowAll(!showAll)} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold">
                {showAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showAll ? "Chỉ hiện mục của vòng này" : `Hiện thêm ${hidden} mục không dùng ở ${m.stage}`}
              </button>
            )}
            <Link href={`/stage/${matchId}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold"><MonitorPlay className="h-4 w-4" /> Màn hình chiếu</Link>
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {SCORE_GROUPS.map((g) => {
            const items = visible.filter((r) => scoreGroup(r.rule_key) === g.key)
              .sort((a, b) => Number(b.score_value > 0) - Number(a.score_value > 0) || Math.abs(a.score_value) - Math.abs(b.score_value));
            if (items.length === 0) return null;
            return (
              <section key={g.key} className="rounded-2xl bg-white/5 p-2.5">
                <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-white/60">{g.label}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((r) => {
                    const n = used(r);
                    const tone = r.score_value > 0 ? "bg-emerald-600" : r.score_value < 0 ? "bg-mech-red" : r.rule_key === "WARNING" ? "bg-mech-gold text-navy" : "bg-white/15";
                    const busyAdd = pending.has(`+${r.rule_key}`);
                    return (
                      <div key={r.rule_key} className="relative">
                        <button
                          disabled={!live || busyAdd || full(r)}
                          onClick={() => {
                            if (r.rule_key === "WARNING" && !window.confirm("Ghi cảnh cáo hành vi? Tái phạm sau 1 cảnh cáo sẽ bị truất quyền thi đấu.")) return;
                            add(r);
                          }}
                          className={`flex min-h-[88px] w-full flex-col justify-between gap-1 rounded-xl px-3 py-2 pr-11 text-left text-[13px] font-bold leading-snug transition active:scale-[0.97] disabled:opacity-35 ${tone}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-display text-2xl leading-none">{r.score_value > 0 ? `+${r.score_value}` : r.score_value < 0 ? r.score_value : "•"}</span>
                            {busyAdd && <Loader2 className="h-4 w-4 animate-spin" />}
                          </span>
                          <span>{r.rule_name}</span>
                        </button>
                        <span className={`pointer-events-none absolute right-2 top-2 min-w-[28px] rounded-full px-1.5 py-0.5 text-center text-xs font-black ${n > 0 ? "bg-white text-navy" : "bg-black/20 text-white/60"}`}>
                          {n}{r.max_per_match != null ? `/${r.max_per_match}` : ""}
                        </span>
                        <button
                          disabled={!live || n === 0 || pending.has(`-${r.rule_key}`)}
                          onClick={() => remove(r)}
                          aria-label={`Xóa 1 lần ${r.rule_name}`}
                          className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-black/30 text-white transition active:scale-90 disabled:invisible"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <section className="rounded-2xl bg-white/5 p-3">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Nhật ký phe {SIDE_LABEL[side]} (mới nhất ở trên)</h2>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {myEvents.length === 0 && <li className="text-white/40">Chưa có sự kiện.</li>}
            {myEvents.map((e) => (
              <li key={e.id} className="flex justify-between gap-2 rounded bg-white/5 px-3 py-1.5">
                <span className="min-w-0 truncate">{e.match_timestamp_seconds != null && <span className="mr-2 text-white/40">{fmtClock(e.match_timestamp_seconds)}</span>}{evLabel(e)}</span>
                <b className={e.point_value < 0 ? "text-red-300" : "text-emerald-300"}>{e.point_value > 0 ? "+" : ""}{e.point_value}</b>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {toast && (
        <div role={toast.ok ? "status" : "alert"} className={`fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-xl items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold shadow-2xl ${toast.ok ? "bg-emerald-600 text-white" : "bg-mech-red text-white"}`}>
          <span className="flex-1">{toast.text}</span>
          {toast.ok && toast.undoKey && live && (
            <button onClick={() => { const r = rules.find((x) => x.rule_key === toast.undoKey); if (r) remove(r); }} className="inline-flex items-center gap-1 rounded-md bg-black/25 px-3 py-1.5">
              <Undo2 className="h-4 w-4" /> Hoàn tác
            </button>
          )}
        </div>
      )}
    </div>
  );
}
