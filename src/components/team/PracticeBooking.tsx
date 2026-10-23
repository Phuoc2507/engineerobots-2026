"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarClock, CheckCircle2, Loader2, Lock, MapPin, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type PracticeSlot = {
  id: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  note: string | null;
  capacity: number;
  booked: number;
  my_booking_id: string | null;
};

const TZ = "Asia/Ho_Chi_Minh";
const MAX_PER_WEEK = 2;
const fmtTime = (s: string) => new Date(s).toLocaleTimeString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const fmtDay = (s: string) => new Date(s).toLocaleDateString("vi-VN", { timeZone: TZ, weekday: "long", day: "2-digit", month: "2-digit" });
const dayKey = (s: string) => new Date(s).toLocaleDateString("en-CA", { timeZone: TZ });

// Đặt / hủy slot thử sa bàn trong trang Đội của tôi. Quy tắc thật nằm ở RPC book_practice_slot.
export default function PracticeBooking({ slots, approved }: { slots: PracticeSlot[]; approved: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const days = useMemo(() => {
    const map = new Map<string, PracticeSlot[]>();
    slots.forEach((s) => map.set(dayKey(s.starts_at), [...(map.get(dayKey(s.starts_at)) ?? []), s]));
    return Array.from(map.entries());
  }, [slots]);
  const mine = slots.filter((s) => s.my_booking_id);

  const act = async (slot: PracticeSlot) => {
    if (slot.my_booking_id && !window.confirm(`Hủy slot ${fmtTime(slot.starts_at)} ngày ${fmtDay(slot.starts_at)}?`)) return;
    setBusy(slot.id);
    setError("");
    const supabase = createClient();
    const { error } = slot.my_booking_id
      ? await supabase.rpc("cancel_practice_booking", { p_booking_id: slot.my_booking_id })
      : await supabase.rpc("book_practice_slot", { p_slot_id: slot.id });
    if (error) setError(error.message);
    setBusy(null);
    router.refresh();
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl uppercase tracking-wide text-navy">
            <CalendarClock className="h-5 w-5 text-mech-red" /> Đặt lịch thử sa bàn
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Slot 15 phút · tối đa {MAX_PER_WEEK} slot/tuần · hủy trước giờ thử ít nhất 1 tiếng.
          </p>
        </div>
        {approved && (
          <span className="rounded-full bg-ice px-3 py-1 text-xs font-bold text-navy-600">Đội đã đặt {mine.length} slot</span>
        )}
      </header>

      {!approved ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-ice p-4 text-sm text-slate-500">
          <Lock className="h-4 w-4 shrink-0" /> Mở sau khi BTC duyệt hồ sơ đội.
        </p>
      ) : days.length === 0 ? (
        <p className="mt-4 rounded-lg bg-ice p-4 text-sm text-slate-500">
          BTC chưa mở slot nào trong 3 tuần tới. Lịch thử sẽ được thông báo sau buổi họp kỹ thuật.
        </p>
      ) : (
        <>
          {mine.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {mine.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>
                    <b className="capitalize">{fmtDay(s.starts_at)}</b> · {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}
                    {s.location && <span className="block text-xs text-emerald-700/80">{s.location}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-mech-red/30 bg-red-50 p-3 text-sm text-mech-red">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <div className="mt-5 space-y-5">
            {days.map(([key, list]) => (
              <div key={key}>
                <h3 className="flex flex-wrap items-center gap-x-3 text-sm font-bold capitalize text-navy">
                  {fmtDay(list[0].starts_at)}
                  {list[0].location && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal normal-case text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {list[0].location}
                    </span>
                  )}
                </h3>
                <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                  {list.map((s) => {
                    const full = s.booked >= s.capacity && !s.my_booking_id;
                    const past = new Date(s.starts_at).getTime() <= Date.now();
                    const label = `${fmtTime(s.starts_at)}–${fmtTime(s.ends_at)}`;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          disabled={full || past || busy !== null}
                          onClick={() => act(s)}
                          aria-label={s.my_booking_id ? `Hủy slot ${label}` : full ? `Slot ${label} đã kín` : `Đặt slot ${label}`}
                          className={`group flex h-14 w-full flex-col items-center justify-center rounded-lg text-sm font-bold transition disabled:cursor-not-allowed ${
                            s.my_booking_id
                              ? "bg-navy-600 text-white hover:bg-mech-red"
                              : full || past
                                ? "bg-slate-100 text-slate-400 line-through"
                                : "bg-ice text-navy ring-1 ring-slate-200 hover:bg-navy-600 hover:text-white"
                          }`}
                        >
                          {busy === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : fmtTime(s.starts_at)}
                          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                            {s.my_booking_id ? (
                              <span className="inline-flex items-center gap-0.5"><span className="group-hover:hidden">Đã đặt</span><span className="hidden items-center group-hover:inline-flex"><X className="h-3 w-3" />Hủy</span></span>
                            ) : full ? "Kín" : s.capacity > 1 ? `Còn ${s.capacity - s.booked}` : "Trống"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
