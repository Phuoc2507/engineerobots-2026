"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Crown, Loader2, Plus, Save, Send, Trash2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MAJORS, STUDENT_DOMAIN } from "@/lib/site";

// Các luật dưới đây trùng với hàm SQL _validate_team() — server vẫn là nơi kiểm tra cuối cùng
const MSSV_RE = /^26\d{6}$/;
const PHONE_RE = /^0\d{9}$/;
const MIN_MEMBERS = 2; // + đội trưởng = 3
const MAX_MEMBERS = 4; // + đội trưởng = 5

type Member = { student_id: string; full_name: string; email: string; phone: string; role: "MEMBER" | "PILOT"; autoEmail: boolean };
type Errors = Record<string, string>;

const emptyMember = (): Member => ({ student_id: "", full_name: "", email: "", phone: "", role: "MEMBER", autoEmail: true });

// Dữ liệu điền sẵn khi đội trưởng sửa hồ sơ (gọi update_team thay vì register_team)
export type TeamFormValues = {
  team: { team_name: string; robot_name: string; slogan: string; major: string };
  leader: { student_id: string; full_name: string; phone: string };
  members: Omit<Member, "autoEmail">[];
};

export default function RegisterForm({ email, defaultName = "", initial, onCancel }: {
  email: string;
  defaultName?: string;
  initial?: TeamFormValues;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const editing = !!initial;
  const emailPrefix = email.split("@")[0];
  const [team, setTeam] = useState(initial?.team ?? { team_name: "", robot_name: "", slogan: "", major: "" });
  const [leader, setLeader] = useState(initial?.leader ?? {
    student_id: MSSV_RE.test(emailPrefix) ? emailPrefix : "",
    full_name: defaultName,
    phone: "",
  });
  const [members, setMembers] = useState<Member[]>(
    initial?.members.map((m) => ({ ...m, autoEmail: false })) ?? [emptyMember(), emptyMember()],
  );
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateMember = (i: number, patch: Partial<Member>) =>
    setMembers((list) =>
      list.map((m, idx) => {
        if (idx !== i) return m;
        const next = { ...m, ...patch };
        // Email trường thường là MSSV@student…: tự điền cho đến khi người dùng sửa tay
        if ("student_id" in patch && m.autoEmail) next.email = patch.student_id ? `${patch.student_id}@${STUDENT_DOMAIN}` : "";
        if ("email" in patch) next.autoEmail = false;
        return next;
      }),
    );

  const validate = (): Errors => {
    const e: Errors = {};
    const name = team.team_name.trim();
    if (name.length < 3 || name.length > 100) e.team_name = "Tên đội cần từ 3 đến 100 ký tự.";
    if (!team.major) e.major = "Chọn ngành.";
    if (!MSSV_RE.test(leader.student_id.trim())) e.leader_student_id = "MSSV gồm 8 số, bắt đầu bằng 26.";
    if (!leader.full_name.trim()) e.leader_full_name = "Nhập họ tên.";
    if (!PHONE_RE.test(leader.phone.trim())) e.leader_phone = "10 số, bắt đầu bằng 0.";

    const ids = [leader.student_id.trim()];
    const mails = [email.toLowerCase()];
    members.forEach((m, i) => {
      const id = m.student_id.trim();
      const mail = m.email.trim().toLowerCase();
      if (!MSSV_RE.test(id)) e[`m${i}_student_id`] = "MSSV gồm 8 số, bắt đầu bằng 26.";
      else if (ids.includes(id)) e[`m${i}_student_id`] = "MSSV bị trùng.";
      if (!m.full_name.trim()) e[`m${i}_full_name`] = "Nhập họ tên.";
      if (!mail.endsWith(`@${STUDENT_DOMAIN}`)) e[`m${i}_email`] = `Email phải có đuôi @${STUDENT_DOMAIN}.`;
      else if (mails.includes(mail)) e[`m${i}_email`] = "Email bị trùng.";
      if (m.phone.trim() && !PHONE_RE.test(m.phone.trim())) e[`m${i}_phone`] = "10 số, bắt đầu bằng 0.";
      ids.push(id);
      mails.push(mail);
    });
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // Đợi React vẽ lại aria-invalid rồi mới focus ô lỗi đầu tiên
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    setSubmitting(true);
    const { error } = await createClient().rpc(editing ? "update_team" : "register_team", {
      p_team: {
        team_name: team.team_name.trim(),
        robot_name: team.robot_name.trim(),
        slogan: team.slogan.trim(),
        major: team.major,
        leader_student_id: leader.student_id.trim(),
        leader_full_name: leader.full_name.trim(),
        leader_phone: leader.phone.trim(),
      },
      p_members: members.map((m) => ({
        student_id: m.student_id.trim(),
        full_name: m.full_name.trim(),
        email: m.email.trim().toLowerCase(),
        phone: m.phone.trim(),
        role: m.role,
      })),
    });

    if (error) {
      setServerError(error.message);
      setSubmitting(false);
      return;
    }
    if (editing) {
      setSubmitting(false);
      onCancel?.();
      router.refresh();
    } else {
      router.replace("/team/dashboard");
      router.refresh();
    }
  };

  const total = members.length + 1;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card step="01" title="Thông tin đội">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên đội" required error={errors.team_name} className="sm:col-span-2">
            <input className={input(errors.team_name)} value={team.team_name} maxLength={100}
              onChange={(e) => setTeam({ ...team, team_name: e.target.value })} placeholder="VD: Bách Khoa Titans" aria-invalid={!!errors.team_name} />
          </Field>
          <Field label="Tên robot">
            <input className={input()} value={team.robot_name} onChange={(e) => setTeam({ ...team, robot_name: e.target.value })} placeholder="VD: Iron Lotus" />
          </Field>
          <Field label="Ngành (đội trưởng)" required error={errors.major}>
            <select className={input(errors.major)} value={team.major} onChange={(e) => setTeam({ ...team, major: e.target.value })} aria-invalid={!!errors.major}>
              <option value="">— Chọn ngành —</option>
              {MAJORS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Slogan" className="sm:col-span-2">
            <input className={input()} value={team.slogan} maxLength={150} onChange={(e) => setTeam({ ...team, slogan: e.target.value })} placeholder="Một câu thật chất của đội bạn" />
          </Field>
        </div>
      </Card>

      <Card step="02" title="Đội trưởng" icon={<Crown className="h-4 w-4 text-mech-gold" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email (đăng nhập)" hint="Lấy từ tài khoản Google">
            <input className={`${input()} bg-slate-100 text-slate-500`} value={email} readOnly />
          </Field>
          <Field label="MSSV" required error={errors.leader_student_id}>
            <input className={input(errors.leader_student_id)} inputMode="numeric" maxLength={8} value={leader.student_id}
              onChange={(e) => setLeader({ ...leader, student_id: e.target.value.replace(/\D/g, "") })} placeholder="26xxxxxx" aria-invalid={!!errors.leader_student_id} />
          </Field>
          <Field label="Họ và tên" required error={errors.leader_full_name}>
            <input className={input(errors.leader_full_name)} value={leader.full_name}
              onChange={(e) => setLeader({ ...leader, full_name: e.target.value })} aria-invalid={!!errors.leader_full_name} />
          </Field>
          <Field label="Số điện thoại" required error={errors.leader_phone} hint="BTC liên hệ qua số này">
            <input className={input(errors.leader_phone)} type="tel" inputMode="numeric" maxLength={10} value={leader.phone}
              onChange={(e) => setLeader({ ...leader, phone: e.target.value.replace(/\D/g, "") })} placeholder="09xxxxxxxx" aria-invalid={!!errors.leader_phone} />
          </Field>
        </div>
      </Card>

      <Card step="03" title="Thành viên" aside={<span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{total}/5 người</span>}>
        <p className="-mt-2 mb-4 text-sm text-slate-500">Đội gồm 3–5 sinh viên K26 (kể cả đội trưởng). Mỗi sinh viên chỉ thuộc một đội.</p>
        <div className="space-y-4">
          {members.map((m, i) => (
            <fieldset key={i} className="rounded-lg border border-slate-200 bg-ice/60 p-4">
              <legend className="sr-only">Thành viên {i + 2}</legend>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy">
                  <UserRound className="h-4 w-4 text-navy-600" /> Thành viên {i + 2}
                </span>
                {members.length > MIN_MEMBERS && (
                  <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i))}
                    className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-mech-red"
                    aria-label={`Xóa thành viên ${i + 2}`}>
                    <Trash2 className="h-4 w-4" /> Xóa
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="MSSV" required error={errors[`m${i}_student_id`]}>
                  <input className={input(errors[`m${i}_student_id`])} inputMode="numeric" maxLength={8} value={m.student_id}
                    onChange={(e) => updateMember(i, { student_id: e.target.value.replace(/\D/g, "") })} placeholder="26xxxxxx" aria-invalid={!!errors[`m${i}_student_id`]} />
                </Field>
                <Field label="Họ và tên" required error={errors[`m${i}_full_name`]}>
                  <input className={input(errors[`m${i}_full_name`])} value={m.full_name}
                    onChange={(e) => updateMember(i, { full_name: e.target.value })} aria-invalid={!!errors[`m${i}_full_name`]} />
                </Field>
                <Field label="Email trường" required error={errors[`m${i}_email`]}>
                  <input className={input(errors[`m${i}_email`])} type="email" value={m.email}
                    onChange={(e) => updateMember(i, { email: e.target.value })} placeholder={`26xxxxxx@${STUDENT_DOMAIN}`} aria-invalid={!!errors[`m${i}_email`]} />
                </Field>
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <Field label="Số điện thoại" error={errors[`m${i}_phone`]}>
                    <input className={input(errors[`m${i}_phone`])} type="tel" inputMode="numeric" maxLength={10} value={m.phone}
                      onChange={(e) => updateMember(i, { phone: e.target.value.replace(/\D/g, "") })} placeholder="Không bắt buộc" aria-invalid={!!errors[`m${i}_phone`]} />
                  </Field>
                  <Field label="Vai trò">
                    <select className={input()} value={m.role} onChange={(e) => updateMember(i, { role: e.target.value as Member["role"] })}>
                      <option value="MEMBER">Thành viên</option>
                      <option value="PILOT">Pilot</option>
                    </select>
                  </Field>
                </div>
              </div>
            </fieldset>
          ))}
        </div>
        {members.length < MAX_MEMBERS && (
          <button type="button" onClick={() => setMembers([...members, emptyMember()])}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 font-semibold text-navy-600 transition hover:border-navy-600 hover:bg-white">
            <Plus className="h-5 w-5" /> Thêm thành viên ({MAX_MEMBERS - members.length} chỗ trống)
          </button>
        )}
      </Card>

      {serverError && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-mech-red/30 bg-red-50 p-4 text-sm text-mech-red">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {serverError}
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {editing
            ? "Lưu thay đổi sẽ đưa hồ sơ về trạng thái Chờ duyệt."
            : "Sau khi gửi, mỗi thành viên đăng nhập bằng email trường là thấy đội. BTC duyệt và cấp mã QR check-in."}
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={submitting} className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 px-6 font-bold uppercase tracking-wide text-navy transition hover:border-navy-600">Hủy</button>
          )}
          <button type="submit" disabled={submitting} className="btn-primary disabled:translate-y-0 disabled:opacity-60">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? <Save className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            {editing ? "Lưu thay đổi" : "Gửi đăng ký"}
          </button>
        </div>
      </div>
    </form>
  );
}

const input = (error?: string) =>
  `h-11 w-full rounded-md border bg-white px-3 text-[15px] text-navy outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    error ? "border-mech-red focus:ring-mech-red/30" : "border-slate-300 focus:border-navy-600 focus:ring-navy-600/20"
  }`;

function Card({ step, title, icon, aside, children }: { step: string; title: string; icon?: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3">
          <span className="font-display text-2xl text-mech-red">{step}</span>
          <span className="flex items-center gap-2 font-display text-xl uppercase tracking-wide text-navy">{title} {icon}</span>
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function Field({ label, required, error, hint, className = "", children }: {
  label: string; required?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-navy">
        {label} {required && <span className="text-mech-red">*</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-mech-red">{error}</span>
        : hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
