"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Maximize, PanelLeftClose, PanelLeftOpen, Search, Sparkles, UserRoundCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { drawSlots, useDraw } from "@/lib/draw";
import { SITE } from "@/lib/site";
import DrawWheel, { targetRotation } from "@/components/draw/DrawWheel";
import DrawBracket from "@/components/draw/DrawBracket";

export type DrawTeam = { id: string; team_name: string };

// Màn hình bốc thăm (chiếu lên sân khấu): BTC mời đội ở cột trái, đại diện đội bấm QUAY,
// máy chủ chọn ngẫu nhiên 1 vị trí trống, vòng quay diễn hoạt dừng đúng ô đó
export default function DrawConsole({ drawId, teams }: { drawId: string; teams: DrawTeam[] }) {
  const { draw, missing, refresh } = useDraw(drawId);
  const [panel, setPanel] = useState(true);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wheelSlots, setWheelSlots] = useState<string[] | null>(null); // giữ nguyên các ô trên vòng trong lúc quay
  const [result, setResult] = useState<{ slot: string; team: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const free = useMemo(() => {
    if (!draw) return [];
    const taken = new Set(draw.results.map((r) => r.slot_code));
    return drawSlots(draw).filter((s) => !taken.has(s));
  }, [draw]);
  const drawn = useMemo(() => new Set(draw?.results.map((r) => r.team_id)), [draw]);
  const waiting = teams.filter((t) => !drawn.has(t.id) && t.team_name.toLowerCase().includes(q.trim().toLowerCase()));

  const rpc = async (key: string, fn: string, args: Record<string, unknown>) => {
    setBusy(key); setError("");
    const { data, error: e } = await createClient().rpc(fn, args);
    setBusy(null);
    if (e) setError(e.message);
    return e ? null : (data ?? true);
  };

  const pick = async (id: string | null) => {
    setResult(null);
    setWheelSlots(null);
    if (await rpc(`pick-${id}`, "admin_draw_pick_team", { p_draw: drawId, p_team: id })) refresh();
  };

  const spin = async () => {
    if (!draw?.current || spinning) return;
    const snapshot = free;
    const team = draw.current.team_name;
    const res = (await rpc("spin", "draw_spin", { p_draw: drawId })) as { slot_code: string } | null;
    if (!res) return;
    const idx = snapshot.indexOf(res.slot_code);
    setWheelSlots(snapshot);
    setResult(null);
    setSpinning(true);
    // 1 frame để vòng quay nhận danh sách ô cũ rồi mới bắt đầu chuyển động
    requestAnimationFrame(() => setRotation((r) => targetRotation(r, Math.max(idx, 0), snapshot.length)));
    // Dừng lại giữ nguyên vòng quay đang chỉ vào ô vừa bốc tới khi BTC mời đội kế tiếp
    timer.current = setTimeout(() => {
      setSpinning(false);
      setResult({ slot: res.slot_code, team });
      refresh();
    }, 6300);
  };

  const undo = async (id: string, label: string) => {
    if (!window.confirm(`Hủy kết quả bốc thăm ${label}? Đội sẽ phải bốc lại.`)) return;
    if (await rpc(`undo-${id}`, "admin_draw_undo", { p_result: id })) { setResult(null); setWheelSlots(null); refresh(); }
  };

  if (missing) return <p className="p-8 text-center text-slate-600">Không tìm thấy lượt bốc thăm. <Link href="/admin/draw" className="underline">Quay lại</Link></p>;
  if (!draw) return <p className="flex min-h-screen items-center justify-center gap-2 bg-navy text-white/70"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải…</p>;

  const shown = wheelSlots ?? free;
  const canSpin = !!draw.current && !spinning && free.length > 0 && busy === null;

  return (
    <div className="flex min-h-screen bg-navy bg-tech-grid bg-grid-40 text-white">
      {panel && (
        <aside className="flex w-80 shrink-0 flex-col border-r border-white/10 bg-navy-900/90 p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/draw" className="inline-flex items-center gap-1 text-sm font-bold text-white/70 hover:text-mech-gold"><ArrowLeft className="h-4 w-4" /> Lượt bốc thăm</Link>
            <button onClick={() => setPanel(false)} aria-label="Ẩn bảng điều khiển" className="text-white/50 hover:text-white"><PanelLeftClose className="h-5 w-5" /></button>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/50">BTC mời đội lên bốc thăm ({teams.length - drawn.size} đội chờ)</p>
          <label className="relative mt-2 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm đội…" aria-label="Tìm đội" className="h-10 w-full rounded-md bg-white/10 pl-9 pr-3 text-sm outline-none placeholder:text-white/40 focus:ring-2 focus:ring-mech-gold" />
          </label>
          <ul className="mt-3 flex-1 space-y-1 overflow-auto">
            {waiting.length === 0 && <li className="text-sm text-white/40">{teams.length === drawn.size ? "Tất cả đội đã bốc thăm." : "Không có đội khớp."}</li>}
            {waiting.map((t) => {
              const on = draw.current?.id === t.id;
              return (
                <li key={t.id}>
                  <button disabled={spinning || busy !== null} onClick={() => pick(on ? null : t.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition disabled:opacity-50 ${on ? "bg-mech-gold text-navy" : "bg-white/5 hover:bg-white/15"}`}>
                    {busy === `pick-${t.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : on ? <UserRoundCheck className="h-4 w-4" /> : null}
                    <span className="min-w-0 flex-1 truncate">{t.team_name}</span>
                    {on && <span className="text-xs">Bỏ chọn</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-white/40">Vị trí do máy chủ chọn ngẫu nhiên trong các ô còn trống; vòng quay chỉ diễn hoạt kết quả. Bấm ✕ trên bảng đấu để hủy một kết quả nhầm.</p>
        </aside>
      )}

      <main className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8">
        <header className="flex items-center gap-3">
          {!panel && <button onClick={() => setPanel(true)} aria-label="Hiện bảng điều khiển" className="text-white/50 hover:text-white"><PanelLeftOpen className="h-5 w-5" /></button>}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-mech-gold">{SITE.name} · Bốc thăm</p>
            <h1 className="truncate font-display text-3xl uppercase md:text-4xl">{draw.name}</h1>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">{draw.results.length}/{draw.results.length + free.length} vị trí</span>
          <button onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Toàn màn hình" className="text-white/50 hover:text-white"><Maximize className="h-5 w-5" /></button>
        </header>

        <div className="mt-4 grid flex-1 items-center gap-8 xl:grid-cols-[minmax(0,560px)_1fr]">
          <div className="mx-auto flex w-full max-w-[560px] flex-col items-center">
            <div className="mb-4 min-h-[88px] text-center">
              {result ? (
                <div className="animate-[pulse_1.2s_ease-in-out_2]">
                  <p className="text-lg font-bold uppercase text-white/70">{result.team}</p>
                  <p className="font-display text-6xl uppercase text-mech-gold"><Sparkles className="mr-2 inline h-10 w-10" />Vị trí {result.slot}</p>
                </div>
              ) : draw.current ? (
                <>
                  <p className="text-sm font-bold uppercase tracking-widest text-white/60">Đội đang bốc thăm</p>
                  <p className="font-display text-5xl uppercase">{draw.current.team_name}</p>
                </>
              ) : (
                <p className="pt-6 text-xl text-white/60">{free.length ? "Chờ BTC mời đội lên bốc thăm…" : "Đã bốc thăm xong toàn bộ vị trí."}</p>
              )}
            </div>
            <div className="w-full max-w-[480px]">
              <DrawWheel slots={shown} rotation={rotation} spinning={spinning} highlight={result?.slot} />
            </div>
            <button onClick={spin} disabled={!canSpin}
              className="mt-6 inline-flex h-20 min-w-[260px] items-center justify-center gap-3 rounded-2xl bg-mech-red px-10 font-display text-4xl uppercase tracking-wider shadow-2xl shadow-mech-red/40 transition hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
              {busy === "spin" || spinning ? <Loader2 className="h-8 w-8 animate-spin" /> : null} {spinning ? "Đang quay…" : "Quay"}
            </button>
            {error && (
              <p role="alert" className="mt-4 flex items-center gap-2 rounded-lg bg-mech-red/20 px-3 py-2 text-sm text-red-200">
                {error} <button onClick={() => setError("")} aria-label="Đóng"><X className="h-4 w-4" /></button>
              </p>
            )}
          </div>
          <DrawBracket draw={draw} fresh={result?.slot} onUndo={spinning ? undefined : undo} dark />
        </div>
      </main>
    </div>
  );
}
