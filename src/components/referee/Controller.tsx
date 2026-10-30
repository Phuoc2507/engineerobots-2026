"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, Crown, Flag, Loader2, MonitorPlay, Pause, Play, RotateCcw, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { countEv, evLabel, fmtClock, STAGE3_STEPS, useMatchLive, type Color } from "@/lib/match";
import { MATCH_STATUS } from "@/lib/site";

// Trọng tài chính: điều khiển đồng hồ, Chiến thắng tuyệt đối, xử thắng, chỉnh điểm thủ công, kết thúc trận (thể lệ 2026: không có timeout kỹ thuật)
export default function Controller({ matchId, canReset }: { matchId: string; canReset: boolean }) {
  const { data, missing, remaining, refresh } = useMatchLive(matchId);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [adj, setAdj] = useState<{ color: Color; delta: number; notes: string }>({ color: "RED", delta: 0, notes: "" });

  const rpc = async (key: string, fn: string, args: Record<string, unknown>, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return false;
    setBusy(key); setError("");
    const { error: e } = await createClient().rpc(fn, args);
    setBusy(null);
    if (e) setError(e.message);
    refresh();
    return !e;
  };

  if (missing) return <p className="p-8 text-center text-slate-600">Không tìm thấy trận. <Link href="/referee" className="underline">Quay lại</Link></p>;
  if (!data) return <p className="flex items-center justify-center gap-2 p-8 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải…</p>;

  const m = data.match;
  const p = { p_match: matchId };
  const big = "flex h-16 items-center justify-center gap-2 rounded-xl text-base font-bold transition active:scale-95 disabled:opacity-40";
  const spin = (k: string) => busy === k && <Loader2 className="h-5 w-5 animate-spin" />;
  const name = (c: Color) => (c === "RED" ? `Đỏ (${data.red?.team_name ?? "—"})` : `Xanh (${data.blue?.team_name ?? "—"})`);
  // Chiến thắng tuyệt đối (thể lệ chính thức): đúng trình tự 2 Kiến thức + Cơ hội vàng → Cầu → Đường Thử thách → Đồ án → Đèn
  // Khớp head_declare_winner (0024): kiểm tra đủ sự kiện và thứ tự thời điểm ghi nhận
  const koReady = (c: Color) => {
    const at = (k: string, nth = 1) =>
      data.events
        .filter((e) => e.team_color === c && e.event_type === k)
        .map((e) => Date.parse(e.created_at))
        .sort((a, b) => a - b)[nth - 1];
    const s2 = Math.max(at("STAGE2_BLOCK", 2) ?? NaN, at("STAGE2_GOLDEN_BLOCK") ?? NaN);
    const s3 = STAGE3_STEPS.map((x) => at(x.key) ?? NaN);
    if ([s2, ...s3].some((t) => Number.isNaN(t))) return false;
    return [s2, ...s3].every((t, i, arr) => i === 0 || arr[i - 1] <= t);
  };
  const warn = { RED: countEv(data.events, "RED", "WARNING"), BLUE: countEv(data.events, "BLUE", "WARNING") };
  const retry = { RED: countEv(data.events, "RED", "RETRY"), BLUE: countEv(data.events, "BLUE", "RETRY") };

  return (
    <div className="min-h-screen bg-slate-950 pb-12 text-white">
      <header className="sticky top-0 z-10 bg-navy px-4 py-3 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Link href="/referee" aria-label="Danh sách trận"><ArrowLeft className="h-5 w-5" /></Link>
          <p className="flex-1 font-display text-lg uppercase">Bàn điều khiển · {m.match_code} <span className="text-sm normal-case text-white/60">({m.stage})</span></p>
          <Link href={`/stage/${matchId}`} target="_blank" className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold"><MonitorPlay className="h-4 w-4" /> Màn hình</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 pt-5">
        <section className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl bg-white/5 p-5">
          <div className="text-left">
            <p className="text-xs font-bold uppercase text-team-red">Đỏ · {data.fouls.RED} lỗi · {retry.RED} retry · {warn.RED}/2 cảnh cáo</p>
            <p className="truncate font-display text-xl uppercase">{data.red?.team_name ?? "—"}</p>
            <p className="font-display text-6xl tabular-nums text-team-red">{m.red_score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-white/50">{MATCH_STATUS[m.status] ?? m.status}</p>
            <p className={`font-display text-6xl tabular-nums ${remaining <= 30 && m.status === "RUNNING" ? "text-mech-red" : ""}`}>{fmtClock(remaining)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-team-blue">Xanh · {data.fouls.BLUE} lỗi · {retry.BLUE} retry · {warn.BLUE}/2 cảnh cáo</p>
            <p className="truncate font-display text-xl uppercase">{data.blue?.team_name ?? "—"}</p>
            <p className="font-display text-6xl tabular-nums text-team-blue">{m.blue_score}</p>
          </div>
        </section>

        {(!data.red?.inspection_passed || !data.blue?.inspection_passed) && m.status !== "FINISHED" && (
          <p className="rounded-lg bg-mech-gold/20 p-3 text-sm text-mech-gold">
            Lưu ý: {[!data.red?.inspection_passed && "đội Đỏ", !data.blue?.inspection_passed && "đội Xanh"].filter(Boolean).join(" và ")} chưa qua kiểm tra kỹ thuật.
          </p>
        )}
        {error && <p role="alert" className="rounded-lg bg-mech-red/20 p-3 text-sm text-red-200">{error}</p>}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {m.status === "SCHEDULED" && <button onClick={() => rpc("ready", "head_set_ready", p)} disabled={busy !== null} className={`${big} col-span-2 bg-navy-600 md:col-span-4`}>{spin("ready")} Gọi đội vào sân (Sẵn sàng)</button>}
          {m.status === "READY" && <button onClick={() => rpc("start", "head_start", p)} disabled={busy !== null} className={`${big} col-span-2 bg-emerald-600 md:col-span-4`}>{spin("start") || <Play className="h-5 w-5" />} Bắt đầu trận</button>}
          {m.status === "RUNNING" && <button onClick={() => rpc("pause", "head_pause", p)} disabled={busy !== null} className={`${big} col-span-2 bg-mech-gold text-navy`}>{spin("pause") || <Pause className="h-5 w-5" />} Dừng khẩn cấp</button>}
          {m.status === "PAUSED" && <button onClick={() => rpc("resume", "head_resume", p)} disabled={busy !== null} className={`${big} col-span-2 bg-emerald-600`}>{spin("resume") || <Play className="h-5 w-5" />} Tiếp tục</button>}
          {(m.status === "RUNNING" || m.status === "PAUSED") && (
            <>
              {(["RED", "BLUE"] as Color[]).map((c) => (
                <button key={c} onClick={() => rpc(`ko${c}`, "head_declare_winner", { ...p, p_color: c, p_kind: "KNOCKOUT" }, `Xác nhận CHIẾN THẮNG TUYỆT ĐỐI: phe ${name(c)} đã hoàn thành đúng trình tự 2 Kiến thức + Cơ hội vàng → Cầu → Đường Thử thách → Đồ án lên đế → Dốc Thăng hoa → nhấn sáng Đèn Vinh Quang? Trận kết thúc ngay.`)}
                  disabled={busy !== null || !koReady(c)} className={`${big} ${c === "RED" ? "bg-team-red" : "bg-team-blue"}`}>
                  {spin(`ko${c}`) || <Crown className="h-5 w-5" />} Thắng tuyệt đối {c === "RED" ? "Đỏ" : "Xanh"}
                </button>
              ))}
              <button onClick={() => rpc("finish", "head_finish", p, `Kết thúc trận? Tỉ số ${m.red_score}–${m.blue_score}. Các đội có thời hạn khiếu nại sau khi kết thúc.`)} disabled={busy !== null} className={`${big} col-span-2 bg-white text-navy md:col-span-4`}>
                {spin("finish") || <Flag className="h-5 w-5" />} Kết thúc trận
              </button>
            </>
          )}
          {m.status === "FINISHED" && (
            <p className="col-span-2 rounded-xl bg-white/5 p-4 text-center md:col-span-4">
              Trận đã kết thúc · {m.winner ? <>Thắng: <b className={m.winner === "RED" ? "text-team-red" : "text-team-blue"}>{m.winner === "RED" ? data.red?.team_name : data.blue?.team_name}</b></> : "Hòa sau mọi chỉ số phụ"}
            </p>
          )}
          {m.status === "FINISHED" && !m.winner && (["RED", "BLUE"] as Color[]).map((c) => (
            <button key={c} onClick={() => rpc(`coin${c}`, "head_declare_winner", { ...p, p_color: c, p_kind: "COIN_TOSS" }, `Ghi nhận phe ${name(c)} thắng tung đồng xu?`)}
              disabled={busy !== null} className={`${big} col-span-1 md:col-span-2 ${c === "RED" ? "bg-team-red" : "bg-team-blue"}`}>
              {spin(`coin${c}`) || <Coins className="h-5 w-5" />} {c === "RED" ? "Đỏ" : "Xanh"} thắng đồng xu
            </button>
          ))}
          {m.status !== "SCHEDULED" && m.status !== "READY" && (["RED", "BLUE"] as Color[]).filter((c) => warn[c === "RED" ? "BLUE" : "RED"] >= 3 && m.winner !== c).map((c) => (
            <button key={`ff${c}`} onClick={() => rpc(`ff${c}`, "head_declare_winner", { ...p, p_color: c, p_kind: "FORFEIT" }, `Đối thủ tái phạm sau cảnh cáo / bị truất quyền. Xử phe ${name(c)} thắng?`)}
              disabled={busy !== null} className={`${big} col-span-2 bg-mech-gold text-navy md:col-span-4`}>
              {spin(`ff${c}`)} Xử thắng cho {c === "RED" ? "Đỏ" : "Xanh"} (đối thủ bị truất quyền)
            </button>
          ))}
        </section>

        <section className="rounded-2xl bg-white/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60"><Wrench className="h-4 w-4" /> Chỉnh điểm thủ công (khiếu nại được chấp nhận, lỗi ghi nhầm…)</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-[auto_120px_1fr_auto]">
            <select value={adj.color} onChange={(e) => setAdj({ ...adj, color: e.target.value as Color })} aria-label="Phe" className="h-11 rounded-md bg-white/10 px-3 text-sm">
              <option value="RED" className="text-navy">Đỏ</option><option value="BLUE" className="text-navy">Xanh</option>
            </select>
            <input type="number" value={adj.delta} onChange={(e) => setAdj({ ...adj, delta: Number(e.target.value) })} aria-label="Số điểm (+/-)" className="h-11 rounded-md bg-white/10 px-3 text-right text-sm font-bold" />
            <input value={adj.notes} onChange={(e) => setAdj({ ...adj, notes: e.target.value })} placeholder="Lý do (bắt buộc)" aria-label="Lý do" className="h-11 rounded-md bg-white/10 px-3 text-sm placeholder:text-white/40" />
            <button disabled={!adj.delta || !adj.notes.trim() || busy !== null}
              onClick={async () => { if (await rpc("adj", "head_adjust_score", { ...p, p_color: adj.color, p_delta: adj.delta, p_notes: adj.notes }, `${adj.delta > 0 ? "+" : ""}${adj.delta} điểm cho phe ${adj.color === "RED" ? "Đỏ" : "Xanh"}?`)) setAdj({ ...adj, delta: 0, notes: "" }); }}
              className="h-11 rounded-md bg-navy-600 px-4 text-sm font-bold disabled:opacity-40">
              {spin("adj") || "Áp dụng"}
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-[auto_1fr]">
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Tiến độ Chặng 3</h2>
            <div className="grid w-56 gap-1.5">
              {(["RED", "BLUE"] as Color[]).map((c) => (
                <div key={c} className="grid grid-cols-4 gap-1">
                  {STAGE3_STEPS.map((st) => (
                    <span key={st.key} className={`rounded-md px-1 py-2 text-center text-[11px] font-bold ${countEv(data.events, c, st.key) > 0 ? (c === "RED" ? "bg-team-red" : "bg-team-blue") : "bg-white/10 text-white/50"}`}>
                      {st.short}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Nhật ký trận</h2>
            <ul className="max-h-72 space-y-1 overflow-auto text-sm">
              {data.events.length === 0 && <li className="text-white/40">Chưa có sự kiện.</li>}
              {data.events.map((e) => (
                <li key={e.id} className="flex justify-between gap-2 rounded bg-white/5 px-3 py-1.5">
                  <span className="min-w-0 truncate">
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${e.team_color === "RED" ? "bg-team-red" : e.team_color === "BLUE" ? "bg-team-blue" : "bg-white/40"}`} />
                    {e.match_timestamp_seconds != null && <span className="mr-2 text-white/40">{fmtClock(e.match_timestamp_seconds)}</span>}
                    {evLabel(e)}
                    {e.notes && <span className="text-white/50"> — {e.notes}</span>}
                  </span>
                  {e.event_type !== "FLIP" && <b className={e.point_value < 0 ? "text-red-300" : "text-emerald-300"}>{e.point_value > 0 ? "+" : ""}{e.point_value}</b>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {canReset && (
          <button onClick={() => rpc("reset", "admin_reset_match", p, "ĐẶT LẠI trận? Xóa toàn bộ điểm, sự kiện, cứ điểm và khiếu nại của trận này. Không hoàn tác được.")} disabled={busy !== null}
            className="flex items-center gap-2 text-sm text-white/50 underline hover:text-mech-red">
            <RotateCcw className="h-4 w-4" /> Đặt lại trận (BTC)
          </button>
        )}
      </main>
    </div>
  );
}
