"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, Sheet, Trash2 } from "lucide-react";
import { ErrorBox, btnDanger, btnGhost, btnPrimary, card, useRpc } from "@/components/admin/ui";

const DATASETS = [
  { id: "teams", label: "Đội thi", note: "Trạng thái duyệt, kiểm tra KT, liên hệ đội trưởng" },
  { id: "members", label: "Thành viên", note: "MSSV, họ tên, email, SĐT từng thành viên" },
  { id: "matches", label: "Trận đấu", note: "Lịch, đội Đỏ / Xanh, điểm, đội thắng" },
  { id: "standings", label: "Xếp hạng", note: "Thắng / hòa / thua, điểm xếp hạng theo vòng" },
  { id: "practice", label: "Thử sa bàn", note: "Slot đã đặt, check-in" },
  { id: "votes", label: "Bình chọn", note: "Lượt bình chọn khán giả theo đội" },
];

type KeyInfo = { key: string; created_at: string; created_by: string | null } | null;

// Liên kết Google Sheet: mỗi bảng là một công thức IMPORTDATA đọc CSV từ web (Google tự làm mới khoảng 1 giờ/lần)
export default function SheetLink({ initial }: { initial: KeyInfo }) {
  const { busy, error, call } = useRpc();
  const [info, setInfo] = useState<KeyInfo>(initial);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  const rotate = async () => {
    const { data, error } = await call<string>("rotate", "admin_rotate_sheet_key", undefined, {
      confirm: info ? "Tạo khóa mới? Các Google Sheet đang dùng khóa cũ sẽ ngừng cập nhật cho tới khi dán công thức mới." : undefined,
      refresh: false,
    });
    if (!error && data) setInfo({ key: data, created_at: new Date().toISOString(), created_by: null });
  };
  const revoke = async () => {
    const { error } = await call("revoke", "admin_revoke_sheet_key", undefined, { confirm: "Thu hồi khóa? Mọi Google Sheet liên kết sẽ ngừng nhận dữ liệu.", refresh: false });
    if (!error) setInfo(null);
  };
  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  return (
    <section className={`${card} mt-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl uppercase text-navy"><Sheet className="h-5 w-5" /> Liên kết Google Sheet</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Tạo một Google Sheet, mỗi trang tính dán một công thức bên dưới vào ô <b>A1</b>. Dữ liệu chỉ đi một chiều từ web sang Sheet,
            Google tự làm mới khoảng mỗi giờ (xóa rồi dán lại công thức để cập nhật ngay).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={rotate} disabled={!!busy} className={info ? btnGhost : btnPrimary}>
            <KeyRound className="h-4 w-4" /> {info ? "Đổi khóa" : "Tạo khóa liên kết"}
          </button>
          {info && (
            <button onClick={revoke} disabled={!!busy} className={btnDanger} aria-label="Thu hồi khóa">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <ErrorBox error={error} />

      {info ? (
        <>
          <p className="mt-4 rounded-lg border-l-4 border-mech-gold bg-amber-50 p-3 text-xs text-slate-700">
            Ai có công thức là đọc được dữ liệu (kể cả email, SĐT). Chỉ chia sẻ Sheet cho người trong BTC; lộ khóa thì bấm <b>Đổi khóa</b>.
            Khóa tạo lúc {new Date(info.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}{info.created_by ? ` bởi ${info.created_by}` : ""}.
          </p>
          <ul className="mt-4 divide-y divide-slate-100">
            {DATASETS.map((d) => {
              const formula = `=IMPORTDATA("${origin}/api/sheets/${d.id}?key=${info.key}")`;
              return (
                <li key={d.id} className="grid gap-2 py-3 md:grid-cols-[12rem_1fr_auto] md:items-center">
                  <div>
                    <b className="text-navy">{d.label}</b>
                    <div className="text-xs text-slate-500">{d.note}</div>
                  </div>
                  <code className="block min-w-0 truncate rounded bg-slate-100 px-2 py-1.5 text-xs text-slate-700" title={formula}>{formula}</code>
                  <button onClick={() => copy(d.id, formula)} className={btnGhost}>
                    {copied === d.id ? <><Check className="h-4 w-4" /> Đã chép</> : <><Copy className="h-4 w-4" /> Chép</>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Chưa có khóa liên kết. Bấm “Tạo khóa liên kết” để lấy công thức.</p>
      )}
    </section>
  );
}
