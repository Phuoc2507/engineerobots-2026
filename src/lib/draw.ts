"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type DrawResult = { id: string; slot_code: string; team_id: string; team_name: string; drawn_at: string };
export type Draw = {
  id: string; name: string; groups: string[]; slots_per_group: number;
  current: { id: string; team_name: string } | null; results: DrawResult[];
};

// Vị trí theo thứ tự bảng: A1, A2, …, B1, … (khớp _draw_slots trong DB)
export const drawSlots = (d: Pick<Draw, "groups" | "slots_per_group">) =>
  d.groups.flatMap((g) => Array.from({ length: d.slots_per_group }, (_, i) => `${g}${i + 1}`));

// Lượt bốc thăm trực tiếp: Realtime + polling dự phòng 4s
export function useDraw(drawId: string) {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [missing, setMissing] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await createClient().rpc("get_draw", { p_draw: drawId });
    if (!data) { setMissing(true); return; }
    setDraw(data as Draw);
  }, [drawId]);

  useEffect(() => {
    refresh();
    const supabase = createClient();
    const ch = supabase
      .channel(`draw-${drawId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "draws", filter: `id=eq.${drawId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "draw_results", filter: `draw_id=eq.${drawId}` }, refresh)
      .subscribe();
    const poll = setInterval(refresh, 4000);
    return () => { clearInterval(poll); supabase.removeChannel(ch); };
  }, [drawId, refresh]);

  return { draw, missing, refresh, setDraw };
}
