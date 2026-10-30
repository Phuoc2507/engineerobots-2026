"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Color = "RED" | "BLUE";
export type LiveTeam = { id: string; team_name: string; logo_url: string | null; inspection_passed: boolean } | null;
export type LiveEvent = {
  id: string; team_color: Color; event_type: string; point_value: number; target_point_index: number | null;
  match_timestamp_seconds: number | null; notes: string | null; created_at: string; rule_name: string | null;
};
export type LiveMatch = {
  server_now: string;
  match: {
    id: string; match_code: string; stage: string; status: string; start_time: string | null;
    duration_seconds: number; remaining_seconds: number; clock_started_at: string | null; live_remaining: number;
    timeout_until: string | null; timeout_team: Color | null; red_timeout_used: boolean; blue_timeout_used: boolean;
    red_score: number; blue_score: number; finished_at: string | null; winner: Color | null;
  };
  red: LiveTeam;
  blue: LiveTeam;
  points: { index: number; owner: Color | "NEUTRAL" | null; golden: boolean }[];
  events: LiveEvent[];
  fouls: { RED: number; BLUE: number };
};

// Dữ liệu trận trực tiếp: Realtime + polling dự phòng 3s, đồng hồ đếm theo giờ server
export function useMatchLive(matchId: string | null) {
  const [data, setData] = useState<LiveMatch | null>(null);
  const [missing, setMissing] = useState(false);
  const fetchedAt = useRef(0);
  const [, setTick] = useState(0);

  const refresh = useCallback(async () => {
    if (!matchId) return;
    const { data: d } = await createClient().rpc("get_match_live", { p_match: matchId });
    if (!d) { setMissing(true); return; }
    fetchedAt.current = Date.now();
    setMissing(false);
    setData(d as LiveMatch);
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    refresh();
    const supabase = createClient();
    const ch = supabase
      .channel(`match-${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `id=eq.${matchId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${matchId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "arena_control_points", filter: `match_id=eq.${matchId}` }, refresh)
      .subscribe();
    const poll = setInterval(refresh, 3000);
    const tick = setInterval(() => setTick((n) => n + 1), 250);
    return () => { clearInterval(poll); clearInterval(tick); supabase.removeChannel(ch); };
  }, [matchId, refresh]);

  let remaining = 0;
  let timeoutLeft = 0;
  if (data) {
    const elapsed = (Date.now() - fetchedAt.current) / 1000;
    remaining = data.match.status === "RUNNING" ? Math.max(0, data.match.live_remaining - elapsed) : data.match.live_remaining;
    if (data.match.timeout_until) {
      const serverNow = new Date(data.server_now).getTime() + (Date.now() - fetchedAt.current);
      timeoutLeft = Math.max(0, (new Date(data.match.timeout_until).getTime() - serverNow) / 1000);
    }
  }
  return { data, missing, remaining, timeoutLeft, refresh };
}

// Tên cứ điểm của thể lệ cũ (24/10) — chỉ để hiển thị sự kiện FLIP trong dữ liệu trận cũ
const POINT_NAMES: Record<number, string> = { 1: "Năng động", 2: "Sáng tạo", 3: "Hội nhập", 4: "Bền vững", 5: "Cứ điểm Vinh quang" };

// Lộ trình Chặng 3 (ENGINEERING PATH 2026): mỗi bước là 1 rule_key trọng tài ghi
export const STAGE3_STEPS = [
  { key: "STAGE3_BRIDGE", short: "Cầu" },
  { key: "STAGE3_TERRAIN", short: "Thử thách" },
  { key: "STAGE3_PROJECT", short: "Đồ án" },
  { key: "STAGE3_LAMP", short: "Đèn" },
] as const;

const SPECIAL: Record<string, string> = {
  ADJUST: "Chỉnh điểm (trọng tài chính)", KNOCKOUT: "Chiến thắng tuyệt đối", COIN_TOSS: "Thắng tung đồng xu", FORFEIT: "Xử thắng (đối thủ bị loại)",
};

export const evLabel = (e: LiveEvent) =>
  e.event_type === "FLIP" ? `Lật ${POINT_NAMES[e.target_point_index ?? 0] ?? `ô ${e.target_point_index}`}` : SPECIAL[e.event_type] ?? e.rule_name ?? e.event_type;

export const countEv = (events: LiveEvent[], color: Color, type: string) =>
  events.filter((e) => e.team_color === color && e.event_type === type).length;

export const fmtClock = (s: number) => {
  const n = Math.ceil(Math.max(0, s));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
};

// Tiếng bíp ngắn (WebAudio) cho 10 giây cuối / hết giờ
export function beep(freq = 880, ms = 150) {
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = W.AudioContext ?? W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.value = 0.15;
    o.connect(g).connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, ms);
  } catch {}
}
