"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { ErrorBox, btnDanger, btnPrimary, card, input, useRpc } from "@/components/admin/ui";

export type AdminAppeal = {
  id: string; reason: string; status: string; resolution_notes: string | null; appeal_timestamp_seconds: number | null; created_at: string;
  teams: { team_name: string } | null;
  matches: { id: string; match_code: string; stage: string; red_score: number; blue_score: number } | null;
};

const TZ = "Asia/Ho_Chi_Minh";
const when = (s: string) => new Date(s).toLocaleString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
const mmss = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
const TONE: Record<string, string> = { PENDING: "bg-mech-gold/20 text-amber-800", ACCEPTED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-slate-100 text-slate-500" };
const LABEL: Record<string, string> = { PENDING: "Chờ xử lý", ACCEPTED: "Chấp nhận", REJECTED: "Bác bỏ" };

// Trọng tài chính xem lại khiếu nại; nếu chấp nhận thì chỉnh điểm ở bàn điều khiển trận
export default function AppealsAdmin({ appeals }: { appeals: AdminAppeal[] }) {
  const { busy, error, call } = useRpc();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? appeals : appeals.filter((a) => a.status === "PENDING");

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {appeals.filter((a) => a.status === "PENDING").length} khiếu nại đang chờ. Chấp nhận khiếu nại không tự đổi điểm — hãy dùng
          “Chỉnh điểm” ở bàn điều khiển trận.
        </p>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-navy-600" /> Hiện cả đã xử lý</label>
      </div>
      <ErrorBox error={error} />
      {list.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">Không có khiếu nại nào.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((a) => (
            <li key={a.id} className="rounded-lg p-4 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE[a.status] ?? ""}`}>{LABEL[a.status] ?? a.status}</span>
                <b className="text-navy">{a.teams?.team_name}</b>
                <span className="text-slate-500">· trận {a.matches?.match_code} ({a.matches?.stage}) · {a.matches?.red_score}–{a.matches?.blue_score}</span>
                {a.appeal_timestamp_seconds != null && <span className="text-slate-500">· thời điểm {mmss(a.appeal_timestamp_seconds)}</span>}
                <span className="ml-auto text-xs text-slate-400">{when(a.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{a.reason}</p>
              {a.status === "PENDING" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input value={notes[a.id] ?? ""} onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })} placeholder="Kết luận của trọng tài (bắt buộc)" aria-label="Kết luận" className={`${input} min-w-[240px] flex-1`} />
                  <button disabled={!notes[a.id]?.trim() || busy !== null} onClick={() => call(`a-${a.id}`, "resolve_appeal", { p_appeal: a.id, p_status: "ACCEPTED", p_notes: notes[a.id] })} className={btnPrimary}>
                    {busy === `a-${a.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Chấp nhận
                  </button>
                  <button disabled={!notes[a.id]?.trim() || busy !== null} onClick={() => call(`r-${a.id}`, "resolve_appeal", { p_appeal: a.id, p_status: "REJECTED", p_notes: notes[a.id] })} className={btnDanger}>
                    {busy === `r-${a.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Bác bỏ
                  </button>
                  {a.matches && <Link href={`/referee/controller/${a.matches.id}`} className="self-center text-sm font-semibold text-navy-600 underline">Bàn điều khiển trận</Link>}
                </div>
              ) : (
                a.resolution_notes && <p className="mt-2 rounded bg-ice px-3 py-2 text-sm text-navy">Kết luận: {a.resolution_notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
