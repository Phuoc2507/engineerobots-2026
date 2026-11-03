"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, Loader2, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fmtClock, ruleApplies, SCORE_GROUPS, scoreGroup, SIDE_LABEL, type Color } from "@/lib/match";
import { eventName, REASON_TYPES, SIGNER_ROLES, type MinutesEvent } from "@/lib/minutes";
import SignaturePad from "@/components/referee/SignaturePad";
import { ErrorBox, btnGhost, btnPrimary, card, input } from "@/components/admin/ui";
import type { PadRule } from "@/components/referee/ScoringPad";

export type ReviseInfo = { id: string; code: string; stage: string; status: string; red_score: number; blue_score: number; red_name: string; blue_name: string };
type Add = { uid: number; color: Color; rule_key?: string; delta?: number; notes: string };
type Signer = { role: string; label: string; name: string; image: string | null };

const COLORS: Color[] = ["RED", "BLUE"];

// Lập biên bản chỉnh điểm: chọn sự kiện cần xóa, thêm mục điểm / điều chỉnh tay, các bên ký trực tiếp trên màn hình
export default function ReviseMatch({ match, events, rules, myName, labels = {} }: { match: ReviseInfo; events: MinutesEvent[]; rules: PadRule[]; myName: string; labels?: Record<string, string> }) {
  const router = useRouter();
  const [type, setType] = useState("INPUT_ERROR");
  const [reason, setReason] = useState("");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [adds, setAdds] = useState<Add[]>([]);
  const [pick, setPick] = useState<Record<Color, string>>({ RED: "", BLUE: "" });
  const [manual, setManual] = useState<Record<Color, { delta: number; notes: string }>>({ RED: { delta: 0, notes: "" }, BLUE: { delta: 0, notes: "" } });
  const [signers, setSigners] = useState<Signer[]>(
    SIGNER_ROLES.map((s) => ({ ...s, label: labels[s.role] || s.label, name: s.role === "HEAD_REFEREE" ? myName : "", image: null })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const name = (c: Color) => (c === "RED" ? match.red_name : match.blue_name);
  const usable = rules.filter((r) => r.rule_key !== "STAGE3_LAMP_SECOND" && ruleApplies(r.rule_key, match.stage));
  const ruleOf = (k?: string) => rules.find((r) => r.rule_key === k);

  // Giá trị dự kiến của mục thêm (Đèn: +25 nếu phe kia đã có Đèn sau khi trừ các mục bị xóa)
  const lampTaken = (c: Color) =>
    events.some((e) => e.team_color !== c && e.event_type === "STAGE3_LAMP" && !removed.has(e.id)) ||
    adds.some((a) => a.color !== c && a.rule_key === "STAGE3_LAMP");
  const addValue = (a: Add) => {
    if (a.delta != null) return a.delta;
    if (a.rule_key === "STAGE3_LAMP" && lampTaken(a.color)) return ruleOf("STAGE3_LAMP_SECOND")?.score_value ?? 25;
    return ruleOf(a.rule_key)?.score_value ?? 0;
  };
  const after = useMemo(() => {
    const t = { RED: match.red_score, BLUE: match.blue_score };
    for (const e of events) if (removed.has(e.id)) t[e.team_color as Color] -= e.point_value;
    for (const a of adds) t[a.color] += addValue(a);
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, removed, adds, match]);

  let uid = adds.reduce((m, a) => Math.max(m, a.uid), 0);
  const addRule = (c: Color) => {
    if (!pick[c]) return;
    setAdds([...adds, { uid: ++uid, color: c, rule_key: pick[c], notes: "" }]);
    setPick({ ...pick, [c]: "" });
  };
  const addManual = (c: Color) => {
    const m = manual[c];
    if (!m.delta || !m.notes.trim()) return;
    setAdds([...adds, { uid: ++uid, color: c, delta: m.delta, notes: m.notes.trim() }]);
    setManual({ ...manual, [c]: { delta: 0, notes: "" } });
  };
  const toggle = (id: string) => {
    const n = new Set(removed);
    if (n.has(id)) n.delete(id); else n.add(id);
    setRemoved(n);
  };
  const setSigner = (i: number, patch: Partial<Signer>) => setSigners(signers.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const signed = signers.filter((s) => s.name.trim() && s.image);
  const changes = removed.size + adds.length;
  const problems = [
    !reason.trim() && "ghi nội dung / lý do",
    changes === 0 && "chọn ít nhất 1 thay đổi điểm",
    !signed.some((s) => s.role === "HEAD_REFEREE") && "chữ ký + họ tên Trọng tài chính",
    signed.length < 2 && "tối thiểu 2 chữ ký",
    signers.some((s) => s.image && !s.name.trim()) && "họ tên cho mọi chữ ký",
  ].filter(Boolean) as string[];

  const submit = async () => {
    if (problems.length) return;
    if (!window.confirm(`Lưu biên bản và cập nhật điểm: Đỏ ${match.red_score} → ${after.RED}, Xanh ${match.blue_score} → ${after.BLUE}?`)) return;
    setBusy(true); setError("");
    const { data, error: e } = await createClient().rpc("head_revise_match", {
      p_match: match.id, p_reason_type: type, p_reason: reason.trim(), p_remove: Array.from(removed),
      p_add: adds.map((a) => (a.delta != null ? { color: a.color, delta: a.delta, notes: a.notes } : { color: a.color, rule_key: a.rule_key, notes: a.notes })),
      p_signatures: signed.map((s) => ({ role: s.role, name: s.name.trim(), image: s.image })),
    });
    setBusy(false);
    if (e) { setError(e.message); return; }
    router.push(`/referee/minutes/${data as string}`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-display text-xl uppercase text-navy">1. Lý do lập biên bản</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(REASON_TYPES).map(([k, v]) => (
            <button key={k} type="button" onClick={() => setType(k)} aria-pressed={type === k}
              className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${type === k ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-slate-300 hover:ring-navy-600"}`}>{v}</button>
          ))}
        </div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={2000}
          placeholder="Nội dung: ai khiếu nại / phát hiện sai sót gì, trọng tài kết luận ra sao…" aria-label="Nội dung biên bản"
          className={`${input} mt-3 h-auto py-2`} />
      </section>

      <section className={card}>
        <h2 className="font-display text-xl uppercase text-navy">2. Thay đổi điểm</h2>
        <p className="mt-1 text-sm text-slate-600">Đánh dấu sự kiện ghi nhầm để xóa, thêm mục bị bỏ sót hoặc điều chỉnh tay. Điểm cuối cùng do hệ thống tính lại khi lưu.</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {COLORS.map((c) => {
            const mine = events.filter((e) => e.team_color === c);
            const myAdds = adds.filter((a) => a.color === c);
            const before = c === "RED" ? match.red_score : match.blue_score;
            return (
              <div key={c} className={`rounded-xl p-4 ring-2 ${c === "RED" ? "ring-team-red/40" : "ring-team-blue/40"}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate font-bold ${c === "RED" ? "text-team-red" : "text-team-blue"}`}>Phe {SIDE_LABEL[c]} · {name(c)}</p>
                  <p className="whitespace-nowrap font-display text-2xl text-navy tabular-nums">
                    {before}{after[c] !== before && <> → <span className={after[c] > before ? "text-emerald-600" : "text-mech-red"}>{after[c]}</span></>}
                  </p>
                </div>
                <ul className="mt-3 max-h-72 space-y-1 overflow-auto text-sm">
                  {mine.length === 0 && <li className="text-slate-400">Chưa có sự kiện.</li>}
                  {mine.map((e) => {
                    const off = removed.has(e.id);
                    return (
                      <li key={e.id}>
                        <label className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 ${off ? "bg-red-50 text-slate-400 line-through" : "hover:bg-ice"}`}>
                          <input type="checkbox" checked={off} onChange={() => toggle(e.id)} aria-label={`Xóa ${eventName(e.event_type, rules)}`} className="h-4 w-4 accent-mech-red" />
                          {e.match_timestamp_seconds != null && <span className="w-10 text-xs text-slate-400">{fmtClock(e.match_timestamp_seconds)}</span>}
                          <span className="min-w-0 flex-1 truncate">{eventName(e.event_type, rules)}{e.notes && <span className="text-slate-400"> — {e.notes}</span>}</span>
                          <b className={e.point_value < 0 ? "text-mech-red" : "text-emerald-600"}>{e.point_value > 0 ? "+" : ""}{e.point_value}</b>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                {myAdds.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
                    {myAdds.map((a) => (
                      <li key={a.uid} className="flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1.5">
                        <Plus className="h-4 w-4 text-emerald-600" />
                        <span className="min-w-0 flex-1 truncate">{a.delta != null ? `Điều chỉnh tay — ${a.notes}` : ruleOf(a.rule_key)?.rule_name}</span>
                        <b className={addValue(a) < 0 ? "text-mech-red" : "text-emerald-600"}>{addValue(a) > 0 ? "+" : ""}{addValue(a)}</b>
                        <button type="button" onClick={() => setAdds(adds.filter((x) => x.uid !== a.uid))} aria-label="Bỏ mục thêm" className="text-slate-400 hover:text-mech-red"><X className="h-4 w-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex gap-2">
                  <select value={pick[c]} onChange={(e) => setPick({ ...pick, [c]: e.target.value })} aria-label={`Thêm mục điểm cho phe ${SIDE_LABEL[c]}`} className={input}>
                    <option value="">— Thêm mục điểm / lỗi —</option>
                    {SCORE_GROUPS.map((g) => (
                      <optgroup key={g.key} label={g.label}>
                        {usable.filter((r) => scoreGroup(r.rule_key) === g.key).map((r) => (
                          <option key={r.rule_key} value={r.rule_key}>{r.score_value > 0 ? "+" : ""}{r.score_value} · {r.rule_name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button type="button" onClick={() => addRule(c)} disabled={!pick[c]} className={btnGhost}><Plus className="h-4 w-4" /> Thêm</button>
                </div>
                <div className="mt-2 grid grid-cols-[90px_1fr_auto] gap-2">
                  <input type="number" value={manual[c].delta || ""} onChange={(e) => setManual({ ...manual, [c]: { ...manual[c], delta: Number(e.target.value) } })} placeholder="± điểm" aria-label="Điểm điều chỉnh tay" className={`${input} text-right`} />
                  <input value={manual[c].notes} onChange={(e) => setManual({ ...manual, [c]: { ...manual[c], notes: e.target.value } })} placeholder="Lý do điều chỉnh tay" aria-label="Lý do điều chỉnh tay" className={input} />
                  <button type="button" onClick={() => addManual(c)} disabled={!manual[c].delta || !manual[c].notes.trim()} className={btnGhost}>Thêm</button>
                </div>
              </div>
            );
          })}
        </div>
        {changes > 0 && (
          <button type="button" onClick={() => { setRemoved(new Set()); setAdds([]); }} className="mt-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-mech-red">
            <RotateCcw className="h-4 w-4" /> Bỏ hết thay đổi
          </button>
        )}
      </section>

      <section className={card}>
        <h2 className="font-display text-xl uppercase text-navy">3. Chữ ký các bên</h2>
        <p className="mt-1 text-sm text-slate-600">Bắt buộc Trọng tài chính và tối thiểu 2 chữ ký. Ô nào không có người ký thì để trống. Ký bằng ngón tay hoặc bút trên máy tính bảng / điện thoại.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {signers.map((s, i) => (
            <div key={s.role} className="rounded-xl bg-ice p-3">
              <p className="text-sm font-bold text-navy">{s.label}{s.role === "HEAD_REFEREE" && <span className="text-mech-red"> *</span>}</p>
              <input value={s.name} onChange={(e) => setSigner(i, { name: e.target.value })} placeholder="Họ và tên" aria-label={`Họ tên ${s.label}`} className={`${input} mt-2`} maxLength={80} />
              <div className="mt-2"><SignaturePad label={s.label} value={s.image} onChange={(image) => setSigner(i, { image })} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm text-slate-600">
            {problems.length ? <>Còn thiếu: {problems.join(", ")}.</> : <>Đỏ <b>{match.red_score} → {after.RED}</b> · Xanh <b>{match.blue_score} → {after.BLUE}</b> · {signed.length} chữ ký</>}
          </p>
          <button type="button" onClick={() => router.back()} className={btnGhost}><Trash2 className="h-4 w-4" /> Hủy</button>
          <button type="button" onClick={submit} disabled={busy || problems.length > 0} className={btnPrimary}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />} Lưu biên bản & cập nhật điểm
          </button>
        </div>
        <ErrorBox error={error} />
      </div>
    </div>
  );
}
