"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Copy, DoorOpen, Loader2, PencilLine, Undo2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RegisterForm, { type TeamFormValues } from "@/components/register/RegisterForm";

// Phần tương tác của /team/dashboard: sửa hồ sơ, rút hồ sơ (đội trưởng), rời đội (thành viên)
export default function TeamManager({ email, isLeader, canEdit, canLeave, lockedReason, initial, children }: {
  email: string;
  isLeader: boolean;
  canEdit: boolean;
  canLeave: boolean;
  lockedReason?: string;
  initial: TeamFormValues;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<"withdraw" | "leave" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (editing) return <RegisterForm email={email} initial={initial} onCancel={() => setEditing(false)} />;

  const run = async (fn: "withdraw_team" | "leave_team") => {
    setBusy(true);
    setError("");
    const { error } = await createClient().rpc(fn);
    if (error) {
      setError(error.message);
      setBusy(false);
      setConfirm(null);
      return;
    }
    router.replace("/register?withdrawn=1");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {children}

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-mech-red/30 bg-red-50 p-4 text-sm text-mech-red">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
        <h2 className="font-display text-xl uppercase tracking-wide text-navy">Thao tác</h2>
        {lockedReason && <p className="mt-1 text-sm text-slate-500">{lockedReason}</p>}

        {confirm ? (
          <div className="mt-4 rounded-lg border border-mech-red/30 bg-red-50 p-4">
            <p className="text-sm font-semibold text-mech-red">
              {confirm === "withdraw"
                ? "Rút hồ sơ sẽ xóa đội và toàn bộ danh sách thành viên. Không thể hoàn tác."
                : "Bạn sẽ rời khỏi đội. Đội trưởng có thể thêm lại bạn sau."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => run(confirm === "withdraw" ? "withdraw_team" : "leave_team")} disabled={busy}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-mech-red px-4 font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirm === "withdraw" ? "Xác nhận rút hồ sơ" : "Xác nhận rời đội"}
              </button>
              <button onClick={() => setConfirm(null)} disabled={busy}
                className="inline-flex h-11 items-center rounded-md border border-slate-300 bg-white px-4 font-semibold text-navy">
                Giữ lại
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {isLeader && (
              <>
                <button onClick={() => setEditing(true)} disabled={!canEdit}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-4 font-bold text-white transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-40">
                  <PencilLine className="h-4 w-4" /> Sửa hồ sơ &amp; thành viên
                </button>
                <button onClick={() => setConfirm("withdraw")} disabled={!canEdit && !canLeave}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 px-4 font-semibold text-slate-600 transition hover:border-mech-red hover:text-mech-red disabled:cursor-not-allowed disabled:opacity-40">
                  <Undo2 className="h-4 w-4" /> Rút hồ sơ
                </button>
              </>
            )}
            {!isLeader && (
              <button onClick={() => setConfirm("leave")} disabled={!canLeave}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 px-4 font-semibold text-slate-600 transition hover:border-mech-red hover:text-mech-red disabled:cursor-not-allowed disabled:opacity-40">
                <DoorOpen className="h-4 w-4" /> Rời đội
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export function CopyInvite({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* trình duyệt chặn clipboard: người dùng tự chép */
        }
      }}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-3 text-sm font-bold text-white transition hover:bg-navy-600"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Đã chép" : "Chép lời mời"}
    </button>
  );
}
