"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gavel, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type AppealMatch = {
  id: string; match_code: string | null; stage: string; finished_at: string | null;
  my_color: "RED" | "BLUE"; my_score: number; opp_score: number; opponent: string | null;
};
export type MyAppeal = { match_id: string; reason: string; status: string; resolution_notes: string | null; created_at: string };

const APPEAL_STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Đang xem xét", tone: "bg-mech-gold/15 text-amber-700" },
  ACCEPTED: { label: "Được chấp nhận", tone: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Bị bác", tone: "bg-red-100 text-mech-red" },
};

// mm:ss hoặc số giây → giây; rỗng → null
const parseTs = (s: string) => {
  const t = s.trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return /^\d+$/.test(t) ? Number(t) : NaN;
};

// Khiếu nại trong N phút sau khi trận kết thúc (kiểm tra lại ở submit_appeal)
export default function TeamAppeals({ matches, appeals, windowMinutes }: { matches: AppealMatch[]; appeals: MyAppeal[]; windowMinutes: number }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [ts, setTs] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const submit = async (matchId: string) => {
    const sec = parseTs(ts);
    if (Number.isNaN(sec)) { setError("Thời điểm ghi theo dạng phút:giây, vd 1:45."); return; }
    setBusy(true); setError("");
    const { error: e } = await createClient().rpc("submit_appeal", { p_match: matchId, p_reason: reason, p_timestamp_seconds: sec });
    setBusy(false);
    if (e) { setError(e.message); return; }
    setOpen(null); setReason(""); setTs("");
    router.refresh();
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
      <h2 className="flex items-center gap-2 font-display text-xl uppercase tracking-wide text-navy"><Gavel className="h-5 w-5 text-mech-red" /> Khiếu nại kết quả</h2>
      <p className="mt-1 text-sm text-slate-500">Đội có {windowMinutes} phút sau khi trận kết thúc để gửi một khiếu nại. Trọng tài chính sẽ xem lại và trả lời tại đây.</p>

      {matches.length === 0 ? (
        <p className="mt-4 rounded-lg bg-ice p-4 text-center text-sm text-slate-500">Đội chưa có trận nào kết thúc.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
          {matches.map((m) => {
            const appeal = appeals.find((a) => a.match_id === m.id);
            const deadline = m.finished_at ? new Date(m.finished_at).getTime() + windowMinutes * 60000 : 0;
            const left = Math.max(0, Math.floor((deadline - now) / 1000));
            const st = appeal ? APPEAL_STATUS[appeal.status] ?? { label: appeal.status, tone: "bg-slate-100 text-slate-600" } : null;
            return (
              <li key={m.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">
                    <b className="text-navy">{m.match_code ?? m.stage}</b>
                    <span className="text-slate-500"> · gặp {m.opponent ?? "—"} · </span>
                    <b className={m.my_score > m.opp_score ? "text-emerald-700" : m.my_score < m.opp_score ? "text-mech-red" : "text-slate-600"}>{m.my_score}–{m.opp_score}</b>
                  </span>
                  {st ? (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.tone}`}>{st.label}</span>
                  ) : left > 0 ? (
                    <button onClick={() => { setOpen(open === m.id ? null : m.id); setError(""); }} className="rounded-md bg-mech-red px-3 py-1.5 text-xs font-bold text-white">
                      Khiếu nại · còn {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Hết hạn khiếu nại</span>
                  )}
                </div>
                {appeal && (
                  <div className="mt-2 rounded-md bg-ice p-3 text-xs text-slate-600">
                    <p><b>Nội dung:</b> {appeal.reason}</p>
                    {appeal.resolution_notes && <p className="mt-1"><b>Trả lời:</b> {appeal.resolution_notes}</p>}
                  </div>
                )}
                {!appeal && open === m.id && left > 0 && (
                  <div className="mt-3 space-y-2">
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Mô tả tình huống cần xem lại (ít nhất 10 ký tự)" aria-label="Nội dung khiếu nại"
                      className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-navy-600 focus:outline-none" />
                    <div className="flex flex-wrap items-center gap-2">
                      <input value={ts} onChange={(e) => setTs(e.target.value)} placeholder="Thời điểm, vd 1:45 (không bắt buộc)" aria-label="Thời điểm trong trận"
                        className="h-10 w-64 rounded-md border border-slate-300 px-2 text-sm focus:border-navy-600 focus:outline-none" />
                      <button disabled={busy || reason.trim().length < 10} onClick={() => submit(m.id)}
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-bold text-white disabled:opacity-40">
                        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Gửi khiếu nại
                      </button>
                    </div>
                    {error && <p role="alert" className="text-sm text-mech-red">{error}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
