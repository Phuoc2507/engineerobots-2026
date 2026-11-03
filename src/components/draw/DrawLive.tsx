"use client";

import { Loader2 } from "lucide-react";
import { useDraw } from "@/lib/draw";
import DrawBracket from "@/components/draw/DrawBracket";

// Kết quả bốc thăm công khai, tự cập nhật khi BTC đang bốc
export default function DrawLive({ drawId }: { drawId: string }) {
  const { draw, missing } = useDraw(drawId);
  if (missing) return <p className="text-sm text-slate-500">Không tìm thấy lượt bốc thăm.</p>;
  if (!draw) return <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</p>;
  const total = draw.groups.length * draw.slots_per_group;
  const last = draw.results[draw.results.length - 1];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-navy px-5 py-4 text-white">
        <span className="font-display text-2xl uppercase">{draw.name}</span>
        <span className="rounded-full bg-white/15 px-3 py-0.5 text-sm font-bold">{draw.results.length}/{total} vị trí</span>
        <span className="ml-auto text-sm text-white/80">
          {draw.current ? <>Đang bốc thăm: <b className="text-mech-gold">{draw.current.team_name}</b></> : last ? <>Mới nhất: <b className="text-mech-gold">{last.team_name} → {last.slot_code}</b></> : "Chưa bắt đầu"}
        </span>
      </div>
      <DrawBracket draw={draw} fresh={last?.slot_code} />
    </div>
  );
}
