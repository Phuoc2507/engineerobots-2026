"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, Loader2, ScanLine, ShieldCheck, ShieldX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ErrorBox, btnDanger, btnGhost, btnPrimary, card, input } from "@/components/admin/ui";

type Lookup = {
  team: { id: string; team_name: string; robot_name: string | null; major: string | null; status: string; inspection_passed: boolean; inspection_data: Inspection | null; inspection_at: string | null };
  members: { full_name: string; student_id: string; role: string }[];
  bookings: { id: string; starts_at: string; ends_at: string; location: string | null; status: string; check_in_at: string | null }[];
  next_match: { id: string; match_code: string; stage: string; start_time: string; color: string } | null;
};
type Inspection = { size?: boolean; voltage?: boolean; arm?: boolean; start?: boolean; safety?: boolean; notes?: string };

// Mục kiểm tra kỹ thuật theo thể lệ — sửa ở đây nếu BTC đổi thông số
const CHECKS: { key: keyof Inspection; label: string }[] = [
  { key: "size", label: "Kích thước ≤ 300 × 250 × 200 mm (dung sai +10 mm), không giới hạn khối lượng" },
  { key: "voltage", label: "Nguồn DC ≤ 12.6 V, pin cố định chắc chắn — cấm điện AC / > 14.8 V" },
  { key: "arm", label: "Cơ cấu gắp có đệm mềm, không vật sắc nhọn, không phóng vật" },
  { key: "start", label: "Chế độ tự hành Chặng 1 khởi động bằng đúng 1 nút; tay điều khiển 2.4 GHz" },
  { key: "safety", label: "Không thiết bị gây nhiễu, không keo / chất lỏng / vũ khí" },
];

const TZ = "Asia/Ho_Chi_Minh";
const t = (s: string) => new Date(s).toLocaleTimeString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

type Detector = { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

export default function CheckIn() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Lookup | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [insp, setInsp] = useState<Inspection>({});
  const [camOn, setCamOn] = useState(false);
  const [camErr, setCamErr] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const lookup = async (tk: string) => {
    const v = tk.trim();
    if (!v) return;
    setBusy("lookup"); setError(""); setMsg("");
    const { data: d, error: e } = await createClient().rpc("staff_lookup_team_by_qr", { p_token: v });
    setBusy(null);
    if (e) { setError(e.message); setData(null); return; }
    const r = d as Lookup;
    setData(r);
    setToken(v);
    setInsp(r.team.inspection_data ?? {});
  };

  // Quét QR bằng camera (BarcodeDetector có sẵn trên Chrome Android / Edge; iOS dùng ô nhập tay)
  useEffect(() => {
    if (!camOn) return;
    let stream: MediaStream | null = null;
    let stop = false;
    const W = window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector };
    if (!W.BarcodeDetector) { setCamErr("Trình duyệt này chưa hỗ trợ quét QR. Dùng Chrome trên Android, hoặc nhập mã thủ công."); setCamOn(false); return; }
    const det = new W.BarcodeDetector({ formats: ["qr_code"] });
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        while (!stop) {
          const codes = await det.detect(videoRef.current).catch(() => []);
          if (codes.length) { setCamOn(false); navigator.vibrate?.(80); lookup(codes[0].rawValue); break; }
          await new Promise((r) => setTimeout(r, 250));
        }
      } catch {
        setCamErr("Không mở được camera — kiểm tra quyền truy cập camera.");
        setCamOn(false);
      }
    })();
    return () => { stop = true; stream?.getTracks().forEach((tr) => tr.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camOn]);

  const rpc = async (key: string, fn: string, args: Record<string, unknown>, ok: string) => {
    setBusy(key); setError(""); setMsg("");
    const { error: e } = await createClient().rpc(fn, args);
    setBusy(null);
    if (e) { setError(e.message); return; }
    setMsg(ok);
    await lookup(token);
    setMsg(ok);
  };

  const allOk = CHECKS.every((c) => insp[c.key] === true);

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="flex items-center gap-2 font-display text-xl uppercase text-navy"><ScanLine className="h-5 w-5 text-mech-red" /> Quét mã QR đội</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => { setCamErr(""); setCamOn(!camOn); }} className={camOn ? btnGhost : btnPrimary}>
            {camOn ? <><CameraOff className="h-4 w-4" /> Tắt camera</> : <><Camera className="h-4 w-4" /> Mở camera</>}
          </button>
          <form onSubmit={(e) => { e.preventDefault(); lookup(token); }} className="flex min-w-[260px] flex-1 gap-2">
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="…hoặc nhập / dán mã QR" aria-label="Mã QR" className={input} />
            <button disabled={!token.trim() || busy !== null} className={btnPrimary}>{busy === "lookup" && <Loader2 className="h-4 w-4 animate-spin" />} Tra cứu</button>
          </form>
        </div>
        {camOn && <video ref={videoRef} muted playsInline className="mt-4 aspect-square w-full max-w-sm rounded-lg bg-black object-cover" />}
        {camErr && <p className="mt-3 text-sm text-amber-800">{camErr}</p>}
        <ErrorBox error={error} />
        {msg && <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {msg}</p>}
      </section>

      {data && (
        <>
          <section className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl uppercase text-navy">{data.team.team_name}</h2>
                <p className="text-sm text-slate-500">Robot: {data.team.robot_name || "—"} · {data.team.major || "—"}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${data.team.inspection_passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-mech-red"}`}>
                {data.team.inspection_passed ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
                {data.team.inspection_passed ? "Đã qua kiểm tra kỹ thuật" : "Chưa qua kiểm tra kỹ thuật"}
              </span>
            </div>
            {data.team.status !== "APPROVED" && <p className="mt-3 rounded bg-red-50 p-3 text-sm font-semibold text-mech-red">Hồ sơ đội chưa được duyệt ({data.team.status}).</p>}
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {data.members.map((m) => (
                <li key={m.student_id} className="rounded-lg bg-ice px-3 py-2 text-sm"><b className="text-navy">{m.full_name}</b> <span className="text-slate-500">· {m.student_id}{m.role === "LEADER" ? " · Đội trưởng" : ""}</span></li>
              ))}
            </ul>
            {data.next_match && (
              <p className="mt-4 text-sm text-slate-600">
                Trận kế tiếp: <b className="text-navy">{data.next_match.match_code}</b> ({data.next_match.stage}) lúc {t(data.next_match.start_time)} — phe{" "}
                <b className={data.next_match.color === "RED" ? "text-team-red" : "text-team-blue"}>{data.next_match.color === "RED" ? "Đỏ" : "Xanh"}</b>
              </p>
            )}
          </section>

          <section className={card}>
            <h3 className="font-display text-lg uppercase text-navy">Slot thử sa bàn hôm nay</h3>
            {data.bookings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Đội không đặt slot nào hôm nay.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.bookings.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200">
                    <b className="text-navy">{t(b.starts_at)}–{t(b.ends_at)}</b>
                    <span className="flex-1 text-slate-500">{b.location}</span>
                    {b.check_in_at ? (
                      <span className="font-semibold text-emerald-700">Đã check-in {t(b.check_in_at)}</span>
                    ) : b.status === "CONFIRMED" ? (
                      <button onClick={() => rpc(`ci-${b.id}`, "staff_checkin_booking", { p_booking_id: b.id }, "Đã check-in slot.")} disabled={busy !== null} className={btnPrimary}>
                        {busy === `ci-${b.id}` && <Loader2 className="h-4 w-4 animate-spin" />} Check-in
                      </button>
                    ) : (
                      <span className="text-slate-400">{b.status}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={card}>
            <h3 className="font-display text-lg uppercase text-navy">Kiểm tra kỹ thuật robot</h3>
            {data.team.inspection_at && <p className="text-xs text-slate-500">Lần kiểm tra gần nhất: {new Date(data.team.inspection_at).toLocaleString("vi-VN", { timeZone: TZ })}</p>}
            <ul className="mt-3 space-y-2">
              {CHECKS.map((c) => (
                <li key={c.key}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ring-1 ring-slate-200 hover:bg-ice">
                    <input type="checkbox" checked={insp[c.key] === true} onChange={(e) => setInsp({ ...insp, [c.key]: e.target.checked })} className="h-5 w-5 accent-navy-600" />
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>
            <textarea value={insp.notes ?? ""} onChange={(e) => setInsp({ ...insp, notes: e.target.value })} rows={2} placeholder="Ghi chú (số đo thực tế, yêu cầu sửa…)" aria-label="Ghi chú kiểm tra" className={`${input} mt-3 h-auto py-2`} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={!allOk || busy !== null || data.team.status !== "APPROVED"} onClick={() => rpc("pass", "staff_set_inspection", { p_team_id: data.team.id, p_passed: true, p_data: insp }, "Đã xác nhận đạt kiểm tra kỹ thuật.")} className={btnPrimary}>
                {busy === "pass" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Đạt
              </button>
              <button disabled={busy !== null || data.team.status !== "APPROVED"} onClick={() => rpc("fail", "staff_set_inspection", { p_team_id: data.team.id, p_passed: false, p_data: insp }, "Đã ghi nhận chưa đạt.")} className={btnDanger}>
                {busy === "fail" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4" />} Chưa đạt
              </button>
            </div>
            {!allOk && <p className="mt-2 text-xs text-slate-500">Tích đủ các mục để xác nhận “Đạt”.</p>}
          </section>
        </>
      )}
    </div>
  );
}
