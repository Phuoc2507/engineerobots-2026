"use client";

/* eslint-disable @next/next/no-img-element -- ấn phẩm do BTC tải lên kho ấn phẩm */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarClock, Expand, Images, Radio, Shrink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MATCH_STATUS } from "@/lib/site";
import type { Content } from "@/lib/content";
import StageBoard from "@/components/stage/StageBoard";

export type StageContent = Content["stage"];
export type StageView = "auto" | "lich" | "anpham";
export type SchedRow = {
  id: string; match_code: string | null; stage: string | null; status: string; start_time: string | null;
  red_team: string | null; blue_team: string | null; red_score: number; blue_score: number; winner: "RED" | "BLUE" | null;
};

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

// Màn hình chiếu sân khấu: tự chuyển giữa bảng điểm trận đang đấu và màn chờ (ấn phẩm + lịch thi đấu)
export default function StageScreen({ s, siteName, view, matchId }: { s: StageContent; siteName: string; view: StageView; matchId?: string }) {
  const { rows, upcoming, results } = useSchedule();
  const [autoId, setAutoId] = useState<string | null>(null);
  // Trận vừa hiển thị trước đó: giữ bảng kết quả thêm một lúc dù hệ thống đã chuyển sang trận kế (chưa bắt đầu)
  const [prevId, setPrevId] = useState<string | null>(null);
  const shown = useRef<string | null>(null);
  useEffect(() => {
    if (autoId && shown.current && autoId !== shown.current) setPrevId(shown.current);
    shown.current = autoId;
  }, [autoId]);

  useEffect(() => {
    if (matchId || view !== "auto") return;
    const load = async () => {
      const { data } = await createClient().rpc("get_current_match_id");
      setAutoId((data as string | null) ?? null);
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [matchId, view]);

  const slides = s.slides.map((x) => x.image).filter(Boolean);
  const idle = <IdleScreen s={s} siteName={siteName} upcoming={upcoming} slides={slides} />;
  const autoLive = LIVE.includes(rows.find((r) => r.id === autoId)?.status ?? "");
  const id = matchId ?? (!autoLive && prevId ? prevId : autoId);

  return (
    <>
      {view === "lich" ? <ScheduleScreen s={s} siteName={siteName} upcoming={upcoming} results={results} />
        : view === "anpham" ? <Slideshow images={slides.length ? slides : [s.poster]} seconds={Number(s.slideSeconds) || 10} full />
        : (
          <StageBoard matchId={id} siteName={siteName} idleView={idle}
            autoIdleSeconds={matchId ? undefined : Number(s.resultSeconds) || 120}
            next={s.showNext ? nextInfo(upcoming.find((r) => r.id !== id && !LIVE.includes(r.status))) : null} nextLabel={s.nextLabel} />
        )}
      <ControlBar view={view} matchId={matchId} />
    </>
  );
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className="font-display text-3xl tabular-nums">{now?.toLocaleTimeString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }) ?? ""}</span>;
}

function TopBar({ siteName, label }: { siteName: string; label?: string }) {
  return (
    <header className="flex items-center justify-between gap-6 px-10 py-5">
      <p className="font-display text-2xl uppercase tracking-wide">{siteName}</p>
      {label && <p className="text-lg font-bold uppercase tracking-widest text-mech-gold">{label}</p>}
      <Clock />
    </header>
  );
}

export function IdleScreen({ s, siteName, upcoming, slides }: { s: StageContent; siteName: string; upcoming: SchedRow[]; slides: string[] }) {
  const list = s.showSchedule ? upcoming.slice(0, Number(s.scheduleCount) || 6) : [];
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-part-stage bg-tech-grid bg-grid-40 text-white">
      <TopBar siteName={siteName} />
      <main className={`grid min-h-0 flex-1 gap-8 px-10 pb-6 ${list.length ? "grid-cols-[3fr_2fr]" : ""}`}>
        <div className="flex min-h-0 flex-col">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/10">
            <Slideshow images={slides.length ? slides : [s.poster]} seconds={Number(s.slideSeconds) || 10} />
          </div>
          {(s.idleTitle || s.idleText) && (
            <div className="mt-5 text-center">
              {s.idleTitle && <p className="font-display text-5xl uppercase leading-tight">{s.idleTitle}</p>}
              {s.idleText && <p className="mt-1 text-2xl text-white/75">{s.idleText}</p>}
            </div>
          )}
        </div>
        {list.length > 0 && (
          <section className="flex min-h-0 flex-col rounded-3xl bg-black/25 p-6 ring-1 ring-white/10">
            <h2 className="flex items-center gap-3 font-display text-3xl uppercase tracking-wide text-mech-gold">
              <CalendarClock className="h-8 w-8" /> {s.scheduleTitle}
            </h2>
            <ol className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
              {list.map((r, i) => <MatchRow key={r.id} r={r} first={i === list.findIndex((x) => !LIVE.includes(x.status))} />)}
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}

function MatchRow({ r, first, result }: { r: SchedRow; first?: boolean; result?: boolean }) {
  const live = LIVE.includes(r.status);
  return (
    <li className={`rounded-2xl px-5 py-3 ${live ? "bg-mech-red/90" : first ? "bg-white/15 ring-2 ring-mech-gold" : "bg-white/5"}`}>
      <div className="flex items-center justify-between gap-3 text-base font-bold uppercase tracking-wider">
        <span className="tabular-nums text-mech-gold">{result ? "Kết quả" : fmtStart(r.start_time)}</span>
        <span className="text-white/70">{r.match_code}{r.stage ? ` · ${r.stage}` : ""}</span>
        {live && <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-xs text-mech-red"><Radio className="h-3.5 w-3.5" /> {MATCH_STATUS[r.status]}</span>}
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className={`truncate rounded-lg bg-team-red px-3 py-1.5 text-center text-xl font-bold ${result && r.winner === "RED" ? "ring-4 ring-mech-gold" : ""}`}>{r.red_team ?? "Chờ xác định"}</span>
        <span className="font-display text-2xl tabular-nums text-white/80">{result ? `${r.red_score} – ${r.blue_score}` : "VS"}</span>
        <span className={`truncate rounded-lg bg-team-blue px-3 py-1.5 text-center text-xl font-bold ${result && r.winner === "BLUE" ? "ring-4 ring-mech-gold" : ""}`}>{r.blue_team ?? "Chờ xác định"}</span>
      </div>
    </li>
  );
}

// Toàn màn hình lịch thi đấu: các trận sắp tới + kết quả gần nhất
export function ScheduleScreen({ s, siteName, upcoming, results }: { s: StageContent; siteName: string; upcoming: SchedRow[]; results: SchedRow[] }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-part-stage bg-tech-grid bg-grid-40 text-white">
      <TopBar siteName={siteName} label={s.scheduleTitle} />
      <main className={`grid min-h-0 flex-1 gap-8 px-10 pb-8 ${results.length ? "grid-cols-[3fr_2fr]" : ""}`}>
        <section className="min-h-0 overflow-hidden">
          {upcoming.length ? (
            <ol className="grid gap-3 xl:grid-cols-2">{upcoming.slice(0, 12).map((r, i) => <MatchRow key={r.id} r={r} first={i === upcoming.findIndex((x) => !LIVE.includes(x.status))} />)}</ol>
          ) : <p className="pt-20 text-center text-3xl text-white/60">Chưa có trận nào sắp diễn ra.</p>}
        </section>
        {results.length > 0 && (
          <section className="min-h-0 overflow-hidden">
            <h2 className="mb-3 font-display text-2xl uppercase tracking-wide text-white/80">Kết quả gần nhất</h2>
            <ol className="space-y-3">{results.map((r) => <MatchRow key={r.id} r={r} result />)}</ol>
          </section>
        )}
      </main>
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

// Thanh điều khiển cho người vận hành: hiện khi di chuột, tự ẩn sau 3 giây
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
  const items: { v: StageView; label: string; icon: typeof Radio }[] = [
    { v: "auto", label: matchId ? "Bảng điểm" : "Tự động", icon: Radio },
    { v: "lich", label: "Lịch thi đấu", icon: CalendarClock },
    { v: "anpham", label: "Ấn phẩm", icon: Images },
  ];
  return (
    <nav aria-label="Chế độ màn hình chiếu"
      className={`fixed right-4 top-4 z-50 flex gap-1 rounded-xl bg-black/70 p-1 text-sm font-bold text-white shadow-xl backdrop-blur transition-opacity ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {items.map((x) => (
        <Link key={x.v} href={x.v === "auto" ? base : `${base}?view=${x.v}`} aria-current={view === x.v ? "page" : undefined}
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
