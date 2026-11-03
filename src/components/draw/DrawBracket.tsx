import type { Draw } from "@/lib/draw";

// Bảng đấu sau bốc thăm: mỗi cột 1 bảng, mỗi dòng 1 vị trí
export default function DrawBracket({ draw, fresh, onUndo, dark = false }: { draw: Draw; fresh?: string | null; onUndo?: (id: string, label: string) => void; dark?: boolean }) {
  const bySlot = new Map(draw.results.map((r) => [r.slot_code, r]));
  return (
    <div className="grid items-start gap-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${draw.slots_per_group > 6 ? 200 : 170}px, 1fr))` }}>
      {draw.groups.map((g) => (
        <section key={g} className={`overflow-hidden rounded-xl ${dark ? "bg-white/10 ring-1 ring-white/15" : "bg-white ring-1 ring-slate-200"}`}>
          <h3 className={`px-3 py-1.5 font-display text-lg uppercase tracking-wide ${dark ? "bg-mech-gold text-navy" : "bg-navy text-white"}`}>Bảng {g}</h3>
          <ol>
            {Array.from({ length: draw.slots_per_group }, (_, i) => {
              const code = `${g}${i + 1}`;
              const r = bySlot.get(code);
              const isNew = fresh === code;
              return (
                <li key={code} className={`flex items-center gap-2 border-t px-3 py-1.5 text-sm ${dark ? "border-white/10" : "border-slate-100"} ${isNew ? "animate-pulse bg-mech-gold/30" : ""}`}>
                  <b className={`w-8 font-display text-base ${dark ? "text-mech-gold" : "text-mech-red"}`}>{code}</b>
                  <span className={`min-w-0 flex-1 truncate font-semibold ${r ? "" : dark ? "text-white/30" : "text-slate-300"}`}>{r ? r.team_name : "—"}</span>
                  {r && onUndo && (
                    <button type="button" onClick={() => onUndo(r.id, `${code} – ${r.team_name}`)} aria-label={`Hủy kết quả ${code}`} className={`text-xs ${dark ? "text-white/30 hover:text-mech-red" : "text-slate-300 hover:text-mech-red"}`}>✕</button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
