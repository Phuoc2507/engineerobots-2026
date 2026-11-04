"use client";

/* eslint-disable @next/next/no-img-element -- ấn phẩm, logo do BTC tải lên kho ấn phẩm */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarClock, CalendarX2, Expand, Images, Radio, Shrink, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MATCH_STATUS } from "@/lib/site";
import type { Content } from "@/lib/content";
import StageBoard from "@/components/stage/StageBoard";

export type StageContent = Content["stage"];
export type StageView = "lich" | "bangdiem" | "anpham";
export type SchedRow = {
  id: string; match_code: string | null; stage: string | null; status: string; start_time: string | null;
  red_team: string | null; blue_team: string | null; red_score: number; blue_score: number; winner: "RED" | "BLUE" | null;
};
type Brand = { logo: string; siteName: string };

const TZ = "Asia/Ho_Chi_Minh";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
export const fmtStart = (s: string | null) => {
  if (!s) return "Chưa xếp giờ";
  const d = new Date(s);
  const hm = d.toLocaleTimeString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  return dayKey(d) === dayKey(new Date()) ? hm : `${hm} · ${d.toLocaleDateString("vi-VN", { timeZone: TZ, day: "2-digit", month: "2-digit" })}`;
};
const LIVE = ["RUNNING", "PAUSED", "READY"];
const nextInfo = (r?: SchedRow) => (r ? { time: fmtStart(r.start_time), code: r.match_code ?? "", red: r.red_team ?? "Chờ xác định", blue: r.blue_team ?? "Chờ xác định" } : null);

// Lịch trận công khai (get_schedule), làm mới mỗi 10 giây
export function useSchedule() {
  const [rows, setRows] = useState<SchedRow[]>([]);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await createClient().rpc("get_schedule");
      if (alive && data) setRows(data as SchedRow[]);
    };
    load();
    const t = setInterval(load, 10000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  const upcoming = rows.filter((r) => r.status !== "FINISHED")
    .sort((a, b) => (LIVE.includes(b.status) ? 1 : 0) - (LIVE.includes(a.status) ? 1 : 0));
  const results = rows.filter((r) => r.status === "FINISHED").slice(-4).reverse();
  return { rows, upcoming, results };
}

// Màn hình chiếu sân khấu, 3 chế độ: Lịch thi đấu (mặc định) · Bảng điểm trận đang đấu · Ấn phẩm
export default function StageScreen({ s, brand, view, matchId }: { s: StageContent; brand: Brand; view: StageView; matchId?: string }) {
  const { rows, upcoming, results } = useSchedule();
  const slides = s.slides.map((x) => x.image).filter(Boolean);
  return (
    <>
      {view === "lich" ? <ScheduleScreen s={s} brand={brand} upcoming={upcoming} results={results} />
        : view === "anpham" ? <Slideshow images={slides.length ? slides : [s.poster]} seconds={Number(s.slideSeconds) || 10} full />
        : <BoardScreen s={s} brand={brand} rows={rows} upcoming={upcoming} matchId={matchId} />}
      <ControlBar view={view} matchId={matchId} />
    </>
  );
}

// Bảng điểm: theo trận được mở (/stage/[id]) hoặc trận hệ thống đang chọn; giữ kết quả trận vừa xong một lúc
function BoardScreen({ s, brand, rows, upcoming, matchId }: { s: StageContent; brand: Brand; rows: SchedRow[]; upcoming: SchedRow[]; matchId?: string }) {
  const [autoId, setAutoId] = useState<string | null>(null);
  const [prevId, setPrevId] = useState<string | null>(null);
  const shown = useRef<string | null>(null);
  useEffect(() => {
    if (autoId && shown.current && autoId !== shown.current) setPrevId(shown.current);
    shown.current = autoId;
  }, [autoId]);
  useEffect(() => {
    if (matchId) return;
    const load = async () => {
      const { data } = await createClient().rpc("get_current_match_id");
      setAutoId((data as string | null) ?? null);
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [matchId]);

  const autoLive = LIVE.includes(rows.find((r) => r.id === autoId)?.status ?? "");
  const id = matchId ?? (!autoLive && prevId ? prevId : autoId);
  const next = nextInfo(upcoming.find((r) => r.id !== id && !LIVE.includes(r.status)));
  const waiting = (
    <div className="flex h-screen flex-col overflow-hidden bg-part-stage bg-tech-grid bg-grid-40 text-white">
      <TopBar brand={brand} />
      <main className="flex flex-1 flex-col items-center justify-center px-10 pb-16 text-center">
        <Radio className="h-16 w-16 text-mech-gold" />
        {s.idleTitle && <p className="mt-6 font-display text-7xl uppercase leading-tight">{s.idleTitle}</p>}
        {s.idleText && <p className="mt-3 text-3xl text-white/75">{s.idleText}</p>}
        {next && (
          <div className="mt-12 rounded-3xl bg-black/25 px-10 py-6 ring-1 ring-white/10">
            <p className="text-lg font-bold uppercase tracking-[0.3em] text-mech-gold">{s.nextLabel}</p>
            <p className="mt-3 font-display text-4xl tabular-nums">{next.time}{next.code && <span className="text-white/60"> · {next.code}</span>}</p>
            <p className="mt-4 flex items-center justify-center gap-5 text-3xl font-bold">
              <span className="rounded-xl bg-team-red px-5 py-2">{next.red}</span>
              <span className="font-display text-white/70">VS</span>
              <span className="rounded-xl bg-team-blue px-5 py-2">{next.blue}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
  return (
    <StageBoard matchId={id} siteName={brand.siteName} logo={brand.logo} idleView={waiting}
      autoIdleSeconds={matchId ? undefined : Number(s.resultSeconds) || 120}
      next={s.showNext ? next : null} nextLabel={s.nextLabel} />
  );
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className="font-display text-4xl tabular-nums">{now?.toLocaleTimeString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }) ?? ""}</span>;
}

// Thanh trên cùng: bộ logo + tên giải · tiêu đề giữa màn hình · đồng hồ
function TopBar({ brand, title }: { brand: Brand; title?: string }) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-10 pb-4 pt-6">
      <div className="flex min-w-0 items-center gap-4">
        {brand.logo && <img src={brand.logo} alt="Logo đơn vị tổ chức" className="h-14 w-auto shrink-0 object-contain" />}
        <p className="truncate font-display text-3xl uppercase tracking-wide">{brand.siteName}</p>
      </div>
      {title ? (
        <h1 className="flex items-center gap-4 font-display text-6xl uppercase tracking-wide text-mech-gold drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <CalendarClock className="h-12 w-12" /> {title}
        </h1>
      ) : <span />}
      <div className="flex justify-end"><Clock /></div>
    </header>
  );
}

function MatchRow({ r, next, result }: { r: SchedRow; next?: boolean; result?: boolean }) {
  const live = LIVE.includes(r.status);
  return (
    <li className={`rounded-2xl px-6 py-4 ${live ? "bg-mech-red/90 shadow-lg shadow-mech-red/30" : next ? "bg-white/15 ring-2 ring-mech-gold" : "bg-white/[0.07] ring-1 ring-white/10"}`}>
      <div className="flex items-center justify-between gap-3 text-lg font-bold uppercase tracking-wider">
        <span className="font-display text-2xl tabular-nums text-mech-gold">{result ? r.match_code : fmtStart(r.start_time)}</span>
        <span className="text-white/70">{result ? r.stage : `${r.match_code ?? ""}${r.stage ? ` · ${r.stage}` : ""}`}</span>
        {live ? <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5 text-sm text-mech-red"><Radio className="h-4 w-4" /> {MATCH_STATUS[r.status]}</span>
          : next ? <span className="rounded-full bg-mech-gold px-3 py-0.5 text-sm text-navy">Tiếp theo</span> : null}
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span className={`truncate rounded-xl bg-team-red px-4 py-2 text-center text-2xl font-bold ${result && r.winner === "RED" ? "ring-4 ring-mech-gold" : ""}`}>{r.red_team ?? "Chờ xác định"}</span>
        <span className="font-display text-3xl tabular-nums text-white/85">{result ? `${r.red_score} – ${r.blue_score}` : "VS"}</span>
        <span className={`truncate rounded-xl bg-team-blue px-4 py-2 text-center text-2xl font-bold ${result && r.winner === "BLUE" ? "ring-4 ring-mech-gold" : ""}`}>{r.blue_team ?? "Chờ xác định"}</span>
      </div>
    </li>
  );
}

// Lịch thi đấu toàn màn hình: các trận sắp tới + kết quả gần nhất; chưa có trận thì hiện ấn phẩm
export function ScheduleScreen({ s, brand, upcoming, results }: { s: StageContent; brand: Brand; upcoming: SchedRow[]; results: SchedRow[] }) {
  const nextIdx = upcoming.findIndex((x) => !LIVE.includes(x.status));
  const list = upcoming.slice(0, Number(s.scheduleCount) || 8);
  const empty = !upcoming.length && !results.length;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-part-stage bg-tech-grid bg-grid-40 text-white">
      <TopBar brand={brand} title={s.scheduleTitle} />
      <div className="mx-10 h-px bg-gradient-to-r from-transparent via-mech-gold/70 to-transparent" />
      {empty ? (
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-10 pb-10 text-center">
          {s.poster && <img src={s.poster} alt="" className="max-h-[52vh] w-auto rounded-3xl object-contain shadow-2xl shadow-black/40 ring-1 ring-white/10" />}
          <p className="flex items-center gap-3 text-4xl font-bold text-white/85"><CalendarX2 className="h-10 w-10 text-mech-gold" /> {s.scheduleEmpty}</p>
        </main>
      ) : (
        <main className={`grid min-h-0 flex-1 gap-10 px-10 pb-8 pt-6 ${results.length && upcoming.length ? "grid-cols-[3fr_2fr]" : ""}`}>
          {upcoming.length > 0 && (
            <section className="min-h-0 overflow-hidden">
              <ol className={`grid gap-4 ${results.length ? "" : "xl:grid-cols-2"}`}>
                {list.map((r, i) => <MatchRow key={r.id} r={r} next={i === nextIdx} />)}
              </ol>
            </section>
          )}
          {results.length > 0 && (
            <section className="min-h-0 overflow-hidden">
              <h2 className="mb-4 flex items-center gap-3 font-display text-3xl uppercase tracking-wide text-white/85"><Trophy className="h-8 w-8 text-mech-gold" /> {s.resultsTitle}</h2>
              <ol className="space-y-4">{results.map((r) => <MatchRow key={r.id} r={r} result />)}</ol>
            </section>
          )}
        </main>
      )}
    </div>
  );
}

// Trình chiếu ấn phẩm: ảnh lần lượt, mờ dần; nền là chính ảnh đó làm nhòe để lấp khoảng trống khi khác tỉ lệ
export function Slideshow({ images, seconds, full }: { images: string[]; seconds: number; full?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % images.length), Math.max(3, seconds) * 1000);
    return () => clearInterval(t);
  }, [images.length, seconds]);
  return (
    <div className={`${full ? "fixed inset-0 bg-black" : "absolute inset-0 bg-black/40"} overflow-hidden`}>
      {images.map((src, j) => (
        <div key={`${j}${src}`} className={`absolute inset-0 transition-opacity duration-1000 ${j === i % images.length ? "opacity-100" : "opacity-0"}`}>
          <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
          <img src={src} alt={`Ấn phẩm ${j + 1}`} className="relative h-full w-full object-contain" />
        </div>
      ))}
    </div>
  );
}

// Thanh điều khiển cho người vận hành (giữa cạnh dưới): hiện khi di chuột, tự ẩn sau 3 giây
function ControlBar({ view, matchId }: { view: StageView; matchId?: string }) {
  const [show, setShow] = useState(false);
  const [fs, setFs] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const move = () => { setShow(true); clearTimeout(timer.current); timer.current = setTimeout(() => setShow(false), 3000); };
    const onFs = () => setFs(!!document.fullscreenElement);
    window.addEventListener("mousemove", move);
    document.addEventListener("fullscreenchange", onFs);
    return () => { window.removeEventListener("mousemove", move); document.removeEventListener("fullscreenchange", onFs); clearTimeout(timer.current); };
  }, []);
  const base = matchId ? `/stage/${matchId}` : "/stage";
  const def: StageView = matchId ? "bangdiem" : "lich";
  const items: { v: StageView; label: string; icon: typeof Radio }[] = [
    { v: "lich", label: "Lịch thi đấu", icon: CalendarClock },
    { v: "bangdiem", label: "Bảng điểm", icon: Radio },
    { v: "anpham", label: "Ấn phẩm", icon: Images },
  ];
  return (
    <nav aria-label="Chế độ màn hình chiếu"
      className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-xl bg-black/75 p-1 text-sm font-bold text-white shadow-xl backdrop-blur transition-opacity ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {items.map((x) => (
        <Link key={x.v} href={x.v === def ? base : `${base}?view=${x.v}`} aria-current={view === x.v ? "page" : undefined}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 ${view === x.v ? "bg-white text-navy" : "hover:bg-white/15"}`}>
          <x.icon className="h-4 w-4" /> {x.label}
        </Link>
      ))}
      <button type="button" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-white/15">
        {fs ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />} {fs ? "Thoát toàn màn hình" : "Toàn màn hình"}
      </button>
    </nav>
  );
}
