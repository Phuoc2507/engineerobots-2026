"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { ErrorBox, btnPrimary, card, input, useRpc } from "@/components/admin/ui";

type Booking = { id: string; status: string; check_in_at: string | null; teams: { team_name: string } | null };
export type AdminSlot = { id: string; starts_at: string; ends_at: string; capacity: number; location: string | null; practice_arena_bookings: Booking[] };

const TZ = "Asia/Ho_Chi_Minh";
const t = (s: string) => new Date(s).toLocaleTimeString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const day = (s: string) => new Date(s).toLocaleDateString("vi-VN", { timeZone: TZ, weekday: "long", day: "2-digit", month: "2-digit" });
const dayKey = (s: string) => new Date(s).toLocaleDateString("en-CA", { timeZone: TZ });
const B_STATUS: Record<string, { label: string; tone: string }> = {
  CONFIRMED: { label: "Đã đặt", tone: "bg-ice text-navy-600" },
  COMPLETED: { label: "Đã check-in", tone: "bg-emerald-100 text-emerald-700" },
  NO_SHOW: { label: "Vắng", tone: "bg-red-100 text-mech-red" },
  CANCELLED: { label: "Đã hủy", tone: "bg-slate-100 text-slate-400 line-through" },
};

// BTC mở slot hàng loạt theo buổi, xem đội nào đặt, đánh dấu vắng / xóa slot
export default function PracticeAdmin({ slots }: { slots: AdminSlot[] }) {
  const { busy, error, call } = useRpc();
  const [f, setF] = useState({ date: "", from: "13:30", to: "17:00", minutes: 15, capacity: 1, location: "" });
  const [msg, setMsg] = useState("");

  const days = useMemo(() => {
    const map = new Map<string, AdminSlot[]>();
    slots.forEach((s) => map.set(dayKey(s.starts_at), [...(map.get(dayKey(s.starts_at)) ?? []), s]));
    return Array.from(map.entries());
  }, [slots]);

  const create = async () => {
    setMsg("");
    const r = await call<number>("create", "create_practice_slots", {
      p_date: f.date, p_from: f.from, p_to: f.to, p_minutes: f.minutes, p_capacity: f.capacity, p_location: f.location.trim() || null,
    });
    if (!r.error) setMsg(`Đã mở ${r.data ?? 0} slot mới (slot trùng giờ được bỏ qua).`);
  };

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="flex items-center gap-2 font-display text-xl uppercase text-navy"><CalendarPlus className="h-5 w-5 text-mech-red" /> Mở buổi thử</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <label className="text-sm font-semibold text-navy">Ngày<input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={`${input} mt-1`} /></label>
          <label className="text-sm font-semibold text-navy">Từ<input type="time" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} className={`${input} mt-1`} /></label>
          <label className="text-sm font-semibold text-navy">Đến<input type="time" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className={`${input} mt-1`} /></label>
          <label className="text-sm font-semibold text-navy">Phút/slot<input type="number" min={5} max={120} value={f.minutes} onChange={(e) => setF({ ...f, minutes: Number(e.target.value) })} className={`${input} mt-1`} /></label>
          <label className="text-sm font-semibold text-navy">Đội/slot<input type="number" min={1} max={10} value={f.capacity} onChange={(e) => setF({ ...f, capacity: Number(e.target.value) })} className={`${input} mt-1`} /></label>
          <label className="text-sm font-semibold text-navy">Địa điểm<input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Mặc định: Xưởng Khoa Cơ khí" className={`${input} mt-1`} /></label>
        </div>
        <button onClick={create} disabled={!f.date || busy !== null} className={`${btnPrimary} mt-4`}>{busy === "create" && <Loader2 className="h-4 w-4 animate-spin" />} Mở slot</button>
        {msg && <p role="status" className="mt-3 text-sm text-emerald-700">{msg}</p>}
        <ErrorBox error={error} />
      </section>

      {days.length === 0 ? (
        <p className={`${card} text-center text-sm text-slate-500`}>Chưa có slot nào từ hôm kia trở đi.</p>
      ) : days.map(([key, list]) => (
        <section key={key} className={card}>
          <h3 className="font-bold capitalize text-navy">{day(list[0].starts_at)} <span className="text-sm font-normal normal-case text-slate-500">· {list[0].location}</span></h3>
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
            {list.map((s) => {
              const active = s.practice_arena_bookings.filter((b) => b.status !== "CANCELLED");
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="w-28 font-bold text-navy">{t(s.starts_at)}–{t(s.ends_at)}</span>
                  <span className="w-14 text-xs text-slate-500">{active.length}/{s.capacity}</span>
                  <span className="flex min-w-0 flex-1 flex-wrap gap-2">
                    {s.practice_arena_bookings.length === 0 && <span className="text-slate-400">Trống</span>}
                    {s.practice_arena_bookings.map((b) => {
                      const st = b.check_in_at && b.status === "CONFIRMED" ? B_STATUS.COMPLETED : B_STATUS[b.status] ?? { label: b.status, tone: "bg-slate-100" };
                      return (
                        <span key={b.id} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${st.tone}`}>
                          {b.check_in_at && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {b.teams?.team_name ?? "?"} · {st.label}
                          {b.status === "CONFIRMED" && !b.check_in_at && (
                            <button onClick={() => call(`ns-${b.id}`, "admin_set_booking_status", { p_booking_id: b.id, p_status: "NO_SHOW" })} disabled={busy !== null} className="ml-1 underline hover:text-mech-red">vắng</button>
                          )}
                          {(b.status === "NO_SHOW" || b.status === "CANCELLED") && (
                            <button onClick={() => call(`rs-${b.id}`, "admin_set_booking_status", { p_booking_id: b.id, p_status: "CONFIRMED" })} disabled={busy !== null} className="ml-1 underline">khôi phục</button>
                          )}
                        </span>
                      );
                    })}
                  </span>
                  <button
                    onClick={() => call(`del-${s.id}`, "admin_delete_slot", { p_slot_id: s.id }, { confirm: active.length ? `Slot này có ${active.length} đội đã đặt. Vẫn xóa? (Nhớ báo các đội)` : "Xóa slot này?" })}
                    disabled={busy !== null} aria-label="Xóa slot" className="text-slate-400 hover:text-mech-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
