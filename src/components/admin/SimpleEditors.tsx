"use client";

import { useState } from "react";
import { Loader2, Mail, Save, Trash2, UserPlus, Vote } from "lucide-react";
import { STAFF_ROLES, VOTE_CATEGORIES } from "@/lib/site";
import { ErrorBox, btnDanger, btnPrimary, card, input, useRpc } from "@/components/admin/ui";

// ───────── Barem điểm ─────────
export type Rule = { rule_key: string; rule_name: string; score_value: number; description: string | null; is_active: boolean };

export function RulesEditor({ rules }: { rules: Rule[] }) {
  const { busy, error, call } = useRpc();
  const [draft, setDraft] = useState<Record<string, { v: number; a: boolean }>>(
    Object.fromEntries(rules.map((r) => [r.rule_key, { v: r.score_value, a: r.is_active }])),
  );
  return (
    <section className={card}>
      <p className="text-sm text-slate-600">
        Điểm Chặng 3 (4 cứ điểm góc + Master Point) được tính tự động từ trạng thái cứ điểm. Sửa ở đây áp dụng cho các
        sự kiện ghi <b>sau</b> khi lưu; điểm cứ điểm của trận đang diễn ra được tính lại ở lần lật kế tiếp.
      </p>
      <ErrorBox error={error} />
      <ul className="mt-4 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
        {rules.map((r) => {
          const d = draft[r.rule_key];
          const dirty = d.v !== r.score_value || d.a !== r.is_active;
          return (
            <li key={r.rule_key} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <b className="text-navy">{r.rule_name}</b> <code className="text-xs text-slate-400">{r.rule_key}</code>
                {r.description && <span className="block text-xs text-slate-500">{r.description}</span>}
              </span>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={d.a} onChange={(e) => setDraft({ ...draft, [r.rule_key]: { ...d, a: e.target.checked } })} className="h-4 w-4 accent-navy-600" /> Áp dụng
              </label>
              <input type="number" aria-label={`Điểm ${r.rule_name}`} value={d.v} onChange={(e) => setDraft({ ...draft, [r.rule_key]: { ...d, v: Number(e.target.value) } })} className={`${input} w-24 text-right font-bold`} />
              <button disabled={!dirty || busy !== null} onClick={() => call(r.rule_key, "admin_update_rule", { p_rule_key: r.rule_key, p_value: d.v, p_active: d.a })} className={`${btnPrimary} h-10 px-3`} aria-label="Lưu">
                {busy === r.rule_key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ───────── Nhân sự ─────────
export type StaffRow = { email: string; full_name: string | null; role: string; created_at: string };

export function StaffEditor({ rows, me }: { rows: StaffRow[]; me: string }) {
  const { busy, error, call } = useRpc();
  const [f, setF] = useState({ email: "", name: "", role: "REFEREE" });
  const add = async () => {
    const r = await call("add", "admin_upsert_staff", { p_email: f.email, p_full_name: f.name, p_role: f.role });
    if (!r.error) setF({ email: "", name: "", role: f.role });
  };
  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="flex items-center gap-2 font-display text-xl uppercase text-navy"><UserPlus className="h-5 w-5 text-mech-red" /> Thêm / đổi vai trò</h2>
        <p className="mt-1 text-sm text-slate-500">
          Người được thêm đăng nhập ở <b>/referee/login</b> bằng đúng email Google này (Gmail cá nhân cũng được).
          BTC: toàn quyền · Trọng tài chính: điều khiển trận, xử lý khiếu nại · Trọng tài: chấm điểm, check-in.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_2fr_1fr_auto]">
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="email@gmail.com" aria-label="Email" className={input} />
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Họ tên" aria-label="Họ tên" className={input} />
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} aria-label="Vai trò" className={input}>
            {Object.entries(STAFF_ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={add} disabled={!f.email || busy !== null} className={btnPrimary}>{busy === "add" && <Loader2 className="h-4 w-4 animate-spin" />} Lưu</button>
        </div>
        <ErrorBox error={error} />
      </section>
      <section className={card}>
        <ul className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
          {rows.map((r) => (
            <li key={r.email} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1"><b className="text-navy">{r.full_name || "—"}</b><span className="block text-slate-500">{r.email}</span></span>
              <select
                value={r.role} disabled={r.email === me || busy !== null} aria-label={`Vai trò của ${r.email}`}
                onChange={(e) => call(`role-${r.email}`, "admin_upsert_staff", { p_email: r.email, p_full_name: r.full_name ?? "", p_role: e.target.value })}
                className={`${input} w-44`}
              >
                {Object.entries(STAFF_ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button
                disabled={r.email === me || busy !== null} aria-label={`Xóa ${r.email}`}
                onClick={() => call(`del-${r.email}`, "admin_remove_staff", { p_email: r.email }, { confirm: `Gỡ quyền của ${r.email}?` })}
                className={`${btnDanger} h-10 px-3`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ───────── Cài đặt + kết quả bình chọn ─────────
export type VoteRow = { vote_category: string; team_id: string; team_name: string; votes: number };

export function SettingsEditor({ votingOpen, appealMinutes, votes, emailReady }: { votingOpen: boolean; appealMinutes: number; votes: VoteRow[]; emailReady: boolean }) {
  const { busy, error, call } = useRpc();
  const [minutes, setMinutes] = useState(appealMinutes);
  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-display text-xl uppercase text-navy">Vận hành</h2>
        <ErrorBox error={error} />
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-ice p-4">
            <span><b className="text-navy">Cổng bình chọn khán giả (/vote)</b><span className="block text-sm text-slate-500">{votingOpen ? "Đang mở — khán giả có thể bình chọn." : "Đang đóng."}</span></span>
            <button onClick={() => call("vote", "admin_set_setting", { p_key: "voting_open", p_value: !votingOpen })} disabled={busy !== null} className={votingOpen ? btnDanger : btnPrimary}>
              {busy === "vote" && <Loader2 className="h-4 w-4 animate-spin" />} {votingOpen ? "Đóng bình chọn" : "Mở bình chọn"}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-ice p-4">
            <span><b className="text-navy">Hạn khiếu nại sau trận</b><span className="block text-sm text-slate-500">Thể lệ: 3 phút kể từ khi trọng tài chính kết thúc trận.</span></span>
            <span className="flex items-center gap-2">
              <input type="number" min={1} max={60} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} aria-label="Số phút" className={`${input} w-20 text-right`} /> phút
              <button onClick={() => call("appeal", "admin_set_setting", { p_key: "appeal_window_minutes", p_value: minutes })} disabled={busy !== null || minutes === appealMinutes} className={btnPrimary}>Lưu</button>
            </span>
          </div>
          <p className={`flex items-start gap-2 rounded-lg p-4 text-sm ${emailReady ? "bg-emerald-50 text-emerald-800" : "bg-mech-gold/10 text-amber-900"}`}>
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            {emailReady
              ? "Email thông báo duyệt hồ sơ đang bật (Resend)."
              : "Chưa bật email thông báo. Thêm RESEND_API_KEY và EMAIL_FROM vào Environment Variables của Vercel rồi redeploy."}
          </p>
        </div>
      </section>
      <section className={card}>
        <h2 className="flex items-center gap-2 font-display text-xl uppercase text-navy"><Vote className="h-5 w-5 text-mech-red" /> Kết quả bình chọn</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {VOTE_CATEGORIES.map((c) => {
            const rows = votes.filter((v) => v.vote_category === c.key);
            const total = rows.reduce((s, r) => s + r.votes, 0);
            return (
              <div key={c.key} className="rounded-lg bg-ice p-4">
                <h3 className="font-bold text-navy">{c.label}</h3>
                <p className="text-xs text-slate-500">{total} phiếu</p>
                <ol className="mt-2 space-y-1.5 text-sm">
                  {rows.length === 0 && <li className="text-slate-400">Chưa có phiếu</li>}
                  {rows.slice(0, 5).map((r, i) => (
                    <li key={r.team_id}>
                      <span className="flex justify-between"><span>{i + 1}. {r.team_name}</span><b>{r.votes}</b></span>
                      <span className="mt-0.5 block h-1.5 rounded-full bg-white"><span className="block h-1.5 rounded-full bg-navy-600" style={{ width: `${(r.votes / Math.max(total, 1)) * 100}%` }} /></span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
