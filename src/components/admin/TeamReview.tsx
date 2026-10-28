"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, ChevronDown, Download, Loader2, Pencil, Search, ShieldCheck, X, XCircle } from "lucide-react";
import { ErrorBox, btnDanger, btnGhost, btnPrimary, card, input, useRpc } from "@/components/admin/ui";

type Member = { id: string; student_id: string; full_name: string; email: string; phone: string | null; role: string; joined_at: string | null };
export type AdminTeam = {
  id: string; team_name: string; major: string; cohort: string | null;
  status: string; review_note: string | null; leader_email: string; leader_phone: string; inspection_passed: boolean;
  created_at: string; updated_at: string | null; team_members: Member[];
};

const STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Chờ duyệt", tone: "bg-mech-gold/20 text-amber-800" },
  APPROVED: { label: "Đã duyệt", tone: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Cần bổ sung", tone: "bg-red-100 text-mech-red" },
};
const ROLE: Record<string, string> = { LEADER: "Đội trưởng", PILOT: "Pilot", MEMBER: "Thành viên" };
const fmt = (s: string) => new Date(s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function toCsv(teams: AdminTeam[]) {
  const rows = [["Đội", "Ngành", "Trạng thái", "Kiểm tra KT", "Vai trò", "MSSV", "Họ tên", "Email", "SĐT"]];
  teams.forEach((t) => t.team_members.forEach((m) => rows.push([
    t.team_name, t.major, STATUS[t.status]?.label ?? t.status, t.inspection_passed ? "Đạt" : "",
    ROLE[m.role] ?? m.role, m.student_id, m.full_name, m.email, m.phone ?? "",
  ])));
  return "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

// Một dòng thành viên; BTC bấm bút chì để sửa khi đội báo khai nhầm
function MemberRow({ m }: { m: Member }) {
  const { busy, error, call } = useRpc();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ student_id: m.student_id, full_name: m.full_name, email: m.email, phone: m.phone ?? "" });
  const cell = `${input} h-8 px-2`;
  const save = async () => {
    const { error } = await call("save", "admin_update_member", {
      p_member_id: m.id, p_student_id: f.student_id, p_full_name: f.full_name, p_email: f.email, p_phone: f.phone,
    }, { confirm: f.email.trim().toLowerCase() !== m.email.toLowerCase() && m.role === "LEADER" ? "Đổi email đội trưởng? Người dùng email mới sẽ quản lý hồ sơ đội." : undefined });
    if (!error) setEdit(false);
  };
  if (!edit) return (
    <tr className="border-t border-slate-200">
      <td className="py-1.5 pr-3">{ROLE[m.role] ?? m.role}</td><td className="pr-3 font-mono">{m.student_id}</td>
      <td className="pr-3 font-semibold text-navy">{m.full_name}</td><td className="pr-3">{m.email}</td><td className="pr-3">{m.phone}</td>
      <td className="text-right">
        <button onClick={() => setEdit(true)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-navy" aria-label={`Sửa ${m.full_name}`}><Pencil className="h-4 w-4" /></button>
      </td>
    </tr>
  );
  const field = (k: keyof typeof f, label: string) => (
    <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={cell} aria-label={label} />
  );
  return (
    <>
      <tr className="border-t border-slate-200 bg-white">
        <td className="py-1.5 pr-3">{ROLE[m.role] ?? m.role}</td>
        <td className="pr-2">{field("student_id", "MSSV")}</td>
        <td className="pr-2">{field("full_name", "Họ tên")}</td>
        <td className="pr-2">{field("email", "Email")}</td>
        <td className="pr-2">{field("phone", "SĐT")}</td>
        <td className="whitespace-nowrap text-right">
          <button onClick={save} disabled={!!busy} className="rounded p-1 text-emerald-700 hover:bg-emerald-50" aria-label="Lưu">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button onClick={() => { setEdit(false); setF({ student_id: m.student_id, full_name: m.full_name, email: m.email, phone: m.phone ?? "" }); }} disabled={!!busy}
            className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Hủy"><X className="h-4 w-4" /></button>
        </td>
      </tr>
      {error && <tr><td colSpan={6} className="pb-2 text-xs text-mech-red">{error}</td></tr>}
    </>
  );
}

// Danh sách hồ sơ đội: lọc, duyệt / yêu cầu bổ sung (có email báo đội), xuất CSV
export default function TeamReview({ teams }: { teams: AdminTeam[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("PENDING");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: teams.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    teams.forEach((t) => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [teams]);

  const list = teams.filter((t) => (filter === "ALL" || t.status === filter) && (!q || `${t.team_name} ${t.leader_email} ${t.team_members.map((m) => `${m.full_name} ${m.student_id}`).join(" ")}`.toLowerCase().includes(q.toLowerCase())));

  const review = async (t: AdminTeam, status: string) => {
    const note = notes[t.id]?.trim() ?? "";
    if (status === "REJECTED" && !note) { setError("Ghi rõ cần bổ sung gì để đội biết cách sửa."); setOpen(t.id); return; }
    setBusy(t.id); setError(""); setFlash("");
    const res = await fetch("/api/admin/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId: t.id, status, note }) });
    const body = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) { setError(body.error ?? "Không lưu được."); return; }
    setFlash(`${t.team_name}: ${STATUS[status].label}${status === "PENDING" ? "" : body.email?.sent ? " · đã gửi email cho đội trưởng" : " · chưa gửi email (chưa cấu hình Resend)"}`);
    router.refresh();
  };

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(list)], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `doi-thi-${filter.toLowerCase()}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-4">
        {[["Tổng hồ sơ", counts.ALL, "text-navy"], ["Chờ duyệt", counts.PENDING, "text-amber-700"], ["Đã duyệt", counts.APPROVED, "text-emerald-700"], ["Cần bổ sung", counts.REJECTED, "text-mech-red"]].map(([l, v, tone]) => (
          <div key={l as string} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{l}</p>
            <p className={`font-display text-4xl ${tone}`}>{v}</p>
          </div>
        ))}
      </section>


      <section className={card}>
        <div className="flex flex-wrap items-center gap-2">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`h-9 rounded-full px-4 text-sm font-bold transition ${filter === s ? "bg-navy text-white" : "bg-ice text-navy hover:bg-slate-200"}`}>
              {s === "ALL" ? "Tất cả" : STATUS[s].label} ({counts[s] ?? 0})
            </button>
          ))}
          <label className="relative ml-auto w-full sm:w-64">
            <span className="sr-only">Tìm đội</span>
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên đội, MSSV, email…" className={`${input} pl-9`} />
          </label>
          <button onClick={exportCsv} className={btnGhost} disabled={list.length === 0}><Download className="h-4 w-4" /> CSV</button>
        </div>

        <ErrorBox error={error} />
        {flash && <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{flash}</p>}

        {list.length === 0 ? (
          <p className="mt-5 rounded-lg bg-ice p-6 text-center text-sm text-slate-500">Không có hồ sơ nào.</p>
        ) : (
          <ul className="mt-5 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {list.map((t) => {
              const st = STATUS[t.status] ?? { label: t.status, tone: "bg-slate-100" };
              const expanded = open === t.id;
              return (
                <li key={t.id}>
                  <button onClick={() => setOpen(expanded ? null : t.id)} aria-expanded={expanded} className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-ice/60">
                    <span className="min-w-0 flex-1">
                      <b className="text-navy">{t.team_name}</b>
                      <span className="block text-xs text-slate-500">{t.major} · {t.team_members.length} SV · nộp {fmt(t.created_at)}{t.updated_at ? ` · sửa ${fmt(t.updated_at)}` : ""}</span>
                    </span>
                    {t.inspection_passed && <span className="inline-flex items-center gap-1 rounded-full bg-navy-600/10 px-2 py-0.5 text-xs font-bold text-navy-600"><ShieldCheck className="h-3.5 w-3.5" /> KT đạt</span>}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.tone}`}>{st.label}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="space-y-4 bg-ice/40 px-4 pb-5 pt-2">
                      <p className="text-sm text-slate-600">Đội trưởng: <b>{t.leader_email}</b> · {t.leader_phone}</p>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                          <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
                            <tr><th className="py-1.5 pr-3">Vai trò</th><th className="pr-3">MSSV</th><th className="pr-3">Họ tên</th><th className="pr-3">Email</th><th className="pr-3">SĐT</th><th /></tr>
                          </thead>
                          <tbody>
                            {t.team_members.map((m) => <MemberRow key={m.id} m={m} />)}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-slate-500">Đội báo thông tin thành viên sai thì bấm <Pencil className="inline h-3 w-3" /> để sửa. Đổi email đội trưởng thì người mới đăng nhập bằng email đó sẽ quản lý đội.</p>
                      {t.review_note && <p className="rounded-md bg-white p-3 text-sm text-slate-600 ring-1 ring-slate-200">Ghi chú lần trước: {t.review_note}</p>}
                      <label className="block text-sm">
                        <span className="font-semibold text-navy">Ghi chú gửi đội (bắt buộc khi yêu cầu bổ sung)</span>
                        <textarea value={notes[t.id] ?? ""} onChange={(e) => setNotes({ ...notes, [t.id]: e.target.value })} rows={2} className={`${input} mt-1 h-auto py-2`} placeholder="vd: MSSV thành viên thứ 3 không đúng K26" />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button disabled={busy !== null || t.status === "APPROVED"} onClick={() => review(t, "APPROVED")} className={btnPrimary}>
                          {busy === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Duyệt
                        </button>
                        <button disabled={busy !== null} onClick={() => review(t, "REJECTED")} className={btnDanger}><XCircle className="h-4 w-4" /> Yêu cầu bổ sung</button>
                        {t.status !== "PENDING" && <button disabled={busy !== null} onClick={() => review(t, "PENDING")} className={btnGhost}>Đưa về chờ duyệt</button>}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
