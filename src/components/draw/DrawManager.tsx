"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, MonitorPlay, Plus, Trash2 } from "lucide-react";
import { ErrorBox, btnDanger, btnPrimary, card, input, useRpc } from "@/components/admin/ui";

export type DrawRow = { id: string; name: string; created_at: string; total: number; filled: number };

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Tạo lượt bốc thăm: số bảng (A, B, …) × số vị trí mỗi bảng → các ô A1, A2, …
export default function DrawManager({ draws, teamCount }: { draws: DrawRow[]; teamCount: number }) {
  const { busy, error, call, router } = useRpc();
  const [f, setF] = useState({ name: "Chung kết xếp hạng", groups: 4, slots: 4 });
  const total = f.groups * f.slots;

  const create = async () => {
    const r = await call<string>("create", "admin_save_draw", { p_id: null, p_name: f.name, p_groups: LETTERS.slice(0, f.groups), p_slots: f.slots }, { refresh: false });
    if (r.data) router.push(`/admin/draw/${r.data}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className={card}>
        <h2 className="font-display text-xl uppercase text-navy">Lượt bốc thăm mới</h2>
        <label className="mt-4 block text-sm font-semibold text-navy">Tên lượt
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={80} className={`${input} mt-1`} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-navy">Số bảng
            <select value={f.groups} onChange={(e) => setF({ ...f, groups: Number(e.target.value) })} className={`${input} mt-1`}>
              {LETTERS.map((l, i) => <option key={l} value={i + 1}>{i + 1} (A{i ? `–${l}` : ""})</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-navy">Vị trí / bảng
            <input type="number" min={1} max={32} value={f.slots} onChange={(e) => setF({ ...f, slots: Math.max(1, Math.min(32, Number(e.target.value) || 1)) })} className={`${input} mt-1`} />
          </label>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Tạo <b>{total}</b> vị trí: {LETTERS.slice(0, Math.min(f.groups, 3)).map((l) => `${l}1…${l}${f.slots}`).join(", ")}{f.groups > 3 ? ", …" : ""}.
          {total < teamCount && <span className="text-mech-red"> Ít hơn số đội đã duyệt ({teamCount}).</span>}
        </p>
        <button onClick={create} disabled={!f.name.trim() || busy !== null} className={`${btnPrimary} mt-4 w-full`}>
          {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Tạo và mở màn hình bốc thăm
        </button>
        <ErrorBox error={error} />
      </section>

      <section className={card}>
        <h2 className="font-display text-xl uppercase text-navy">Các lượt đã tạo</h2>
        {draws.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Chưa có lượt bốc thăm nào.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {draws.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <b className="min-w-0 flex-1 truncate text-navy">{d.name}</b>
                <span className="rounded-full bg-ice px-2.5 py-0.5 text-xs font-bold text-navy">{d.filled}/{d.total} vị trí</span>
                <Link href={`/admin/draw/${d.id}`} className="inline-flex items-center gap-1 rounded-md bg-navy px-3 py-1.5 text-xs font-bold text-white"><MonitorPlay className="h-3.5 w-3.5" /> Màn hình bốc thăm</Link>
                <Link href={`/boc-tham?id=${d.id}`} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold text-navy"><ExternalLink className="h-3.5 w-3.5" /> Trang công khai</Link>
                <button onClick={() => call(`del-${d.id}`, "admin_delete_draw", { p_id: d.id }, { confirm: `Xóa lượt "${d.name}" cùng toàn bộ kết quả bốc thăm?` })} disabled={busy !== null} className={`${btnDanger} h-8 px-2`} aria-label={`Xóa ${d.name}`}>
                  {busy === `del-${d.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
