"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Gamepad2, Loader2, MonitorPlay, Pencil, Plus, Trash2, X } from "lucide-react";
import { ErrorBox, btnDanger, btnGhost, btnPrimary, card, input, useRpc } from "@/components/admin/ui";

export type TeamOption = { id: string; team_name: string; inspection_passed: boolean };
export type AdminMatch = {
  id: string; match_code: string | null; stage: string; status: string; start_time: string | null; duration_seconds: number;
  red_team_id: string | null; blue_team_id: string | null; red_score: number; blue_score: number; winner_team_id: string | null;
};

const TZ = "Asia/Ho_Chi_Minh";
const STAGES = ["Vòng loại", "Vòng 1/8", "Tứ kết", "Bán kết", "Tranh hạng ba", "Chung kết", "Giao hữu"];
const STATUS: Record<string, string> = { SCHEDULED: "Sắp đấu", READY: "Chuẩn bị", RUNNING: "Đang đấu", PAUSED: "Tạm dừng", FINISHED: "Kết thúc" };
// datetime-local ↔ ISO theo giờ Việt Nam (không phụ thuộc múi giờ máy BTC)
const toLocal = (s: string | null) => (s ? new Date(s).toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T").slice(0, 16) : "");
const fromLocal = (v: string) => (v ? `${v}:00+07:00` : null);
const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("vi-VN", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Chưa xếp giờ");

type Form = { id: string | null; code: string; stage: string; red: string; blue: string; start: string; duration: number };
// Thể lệ: Vòng loại 180 giây, Vòng Chung kết xếp hạng 300 giây
const durationFor = (stage: string) => (stage === "Vòng loại" ? 180 : 300);
const EMPTY: Form = { id: null, code: "", stage: "Vòng loại", red: "", blue: "", start: "", duration: 180 };

export default function MatchManager({ matches, teams }: { matches: AdminMatch[]; teams: TeamOption[] }) {
  const { busy, error, call } = useRpc();
  const [form, setForm] = useState<Form | null>(null);
  const [swap, setSwap] = useState<string | null>(null);
  const name = (id: string | null) => teams.find((t) => t.id === id)?.team_name ?? (id ? "Đội (không còn duyệt)" : "Chờ xác định");

  const save = async () => {
    if (!form) return;
    const r = await call("save", "admin_upsert_match", {
      p_id: form.id, p_code: form.code, p_stage: form.stage, p_red: form.red || null, p_blue: form.blue || null,
      p_start: fromLocal(form.start), p_duration: form.duration,
    });
    if (!r.error) setForm(null);
  };

  const doSwap = async (b: string) => {
    if (!swap) return;
    await call(`swap-${b}`, "admin_swap_match_times", { p_a: swap, p_b: b });
    setSwap(null);
  };

  const stages = Array.from(new Set(matches.map((m) => m.stage)));
  const pending = (m: AdminMatch) => m.status === "SCHEDULED" || m.status === "READY";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setForm({ ...EMPTY })} className={btnPrimary}><Plus className="h-4 w-4" /> Thêm trận</button>
        {teams.length < 2 && <p className="self-center text-sm text-slate-500">Cần ít nhất 2 đội đã duyệt để xếp trận đối kháng.</p>}
      </div>

      {form && (
        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl uppercase text-navy">{form.id ? "Sửa trận" : "Trận mới"}</h2>
            <button onClick={() => setForm(null)} aria-label="Đóng" className="text-slate-400 hover:text-mech-red"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-navy">Mã trận
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="vd: A1, BK2" className={`${input} mt-1`} maxLength={20} />
            </label>
            <label className="text-sm font-semibold text-navy">Vòng
              <input list="stages" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value, ...(STAGES.includes(e.target.value) && { duration: durationFor(e.target.value) }) })} className={`${input} mt-1`} />
              <datalist id="stages">{STAGES.map((s) => <option key={s} value={s} />)}</datalist>
            </label>
            <label className="text-sm font-semibold text-navy">Giờ thi đấu (giờ VN)
              <input type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className={`${input} mt-1`} />
            </label>
            <label className="text-sm font-semibold text-team-red">Phe Đỏ
              <select value={form.red} onChange={(e) => setForm({ ...form, red: e.target.value })} className={`${input} mt-1`}>
                <option value="">— Chờ xác định —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.team_name}{t.inspection_passed ? "" : " (chưa KT kỹ thuật)"}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-team-blue">Phe Xanh
              <select value={form.blue} onChange={(e) => setForm({ ...form, blue: e.target.value })} className={`${input} mt-1`}>
                <option value="">— Chờ xác định —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.team_name}{t.inspection_passed ? "" : " (chưa KT kỹ thuật)"}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-navy">Thời lượng (giây)
              <input type="number" min={30} max={1200} step={10} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className={`${input} mt-1`} />
            </label>
          </div>
          <ErrorBox error={error} />
          <div className="mt-4 flex gap-2">
            <button onClick={save} disabled={busy !== null || !form.stage.trim()} className={btnPrimary}>{busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />} Lưu trận</button>
            <button onClick={() => setForm(null)} className={btnGhost}>Hủy</button>
          </div>
        </section>
      )}

      {!form && <ErrorBox error={error} />}
      {swap && (
        <p role="status" className="flex items-center justify-between gap-3 rounded-lg border border-mech-gold bg-mech-gold/10 p-3 text-sm text-amber-900">
          Chọn trận thứ hai để đổi giờ với trận đã chọn.
          <button onClick={() => setSwap(null)} className="font-bold underline">Bỏ chọn</button>
        </p>
      )}

      {matches.length === 0 ? (
        <p className={`${card} text-center text-sm text-slate-500`}>Chưa có trận nào. Lịch công khai ở /lich-thi sẽ hiện thông báo “sắp công bố”.</p>
      ) : stages.map((stage) => (
        <section key={stage} className={card}>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-mech-red">{stage}</h2>
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {matches.filter((m) => m.stage === stage).map((m) => (
              <li key={m.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${swap === m.id ? "bg-mech-gold/10" : ""}`}>
                <span className="w-16 font-display text-lg text-navy">{m.match_code ?? "—"}</span>
                <span className="min-w-0 flex-1 text-sm">
                  <b className="text-team-red">{name(m.red_team_id)}</b> <span className="text-slate-400">vs</span> <b className="text-team-blue">{name(m.blue_team_id)}</b>
                  <span className="block text-xs text-slate-500">{fmt(m.start_time)} · {m.duration_seconds}s · {STATUS[m.status] ?? m.status}{m.status !== "SCHEDULED" && m.status !== "READY" ? ` · ${m.red_score}–${m.blue_score}` : ""}</span>
                </span>
                <span className="flex flex-wrap gap-1.5">
                  <Link href={`/referee/controller/${m.id}`} className={`${btnGhost} h-9 px-3`} title="Bảng điều khiển trọng tài chính"><Gamepad2 className="h-4 w-4" /> Điều khiển</Link>
                  <Link href={`/stage/${m.id}`} target="_blank" className={`${btnGhost} h-9 px-3`} title="Mở màn hình sân khấu"><MonitorPlay className="h-4 w-4" /></Link>
                  {pending(m) && (
                    <>
                      {swap && swap !== m.id ? (
                        <button onClick={() => doSwap(m.id)} disabled={busy !== null} className={`${btnPrimary} h-9 px-3`}><ArrowLeftRight className="h-4 w-4" /> Đổi với trận này</button>
                      ) : (
                        <button onClick={() => setSwap(swap === m.id ? null : m.id)} className={`${btnGhost} h-9 px-3`} title="Đổi giờ với trận khác"><ArrowLeftRight className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => setForm({ id: m.id, code: m.match_code ?? "", stage: m.stage, red: m.red_team_id ?? "", blue: m.blue_team_id ?? "", start: toLocal(m.start_time), duration: m.duration_seconds })} className={`${btnGhost} h-9 px-3`} aria-label="Sửa"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => call(`del-${m.id}`, "admin_delete_match", { p_id: m.id }, { confirm: `Xóa trận ${m.match_code ?? ""}?` })} disabled={busy !== null} className={`${btnDanger} h-9 px-3`} aria-label="Xóa"><Trash2 className="h-4 w-4" /></button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
