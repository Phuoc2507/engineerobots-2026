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

type KeyInfo = {
  key: string; created_at: string; created_by: string | null;
  sheet_id?: string | null; last_sync_at?: string | null; last_sync_error?: string | null;
} | null;

const fmtTime = (s: string) => new Date(s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
const sheetIdOf = (v: string) => v.match(/\/d\/([A-Za-z0-9_-]{20,})/)?.[1] ?? v.trim();

// Liên kết Google Sheet: mỗi bảng là một công thức IMPORTDATA đọc CSV từ web (Google tự làm mới khoảng 1 giờ/lần)
export default function SheetLink({ initial, serviceEmail }: { initial: KeyInfo; serviceEmail: string | null }) {
  const { busy, error, call } = useRpc();
  const [info, setInfo] = useState<KeyInfo>(initial);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [sheetInput, setSheetInput] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  const rotate = async () => {
    const { data, error } = await call<string>("rotate", "admin_rotate_sheet_key", undefined, {
      confirm: info ? "Tạo khóa mới? Công thức IMPORTDATA cũ sẽ ngừng chạy cho tới khi dán công thức mới (tự cập nhật mỗi phút vẫn chạy tiếp)." : undefined,
      refresh: false,
    });
    if (!error && data) setInfo((i) => ({ ...i, key: data, created_at: new Date().toISOString(), created_by: null }));
  };
  const revoke = async () => {
    const { error } = await call("revoke", "admin_revoke_sheet_key", undefined, { confirm: "Thu hồi khóa? Mọi Google Sheet liên kết sẽ ngừng nhận dữ liệu.", refresh: false });
    if (!error) setInfo(null);
  };
  const setTarget = async (id: string | null) => {
    const { error } = await call("target", "admin_set_sheet_target", { p_sheet_id: id }, {
      confirm: id ? undefined : "Ngắt tự cập nhật? Dữ liệu đã có trong Sheet vẫn giữ nguyên.",
      refresh: false,
    });
    if (!error && info) { setInfo({ ...info, sheet_id: id, last_sync_at: null, last_sync_error: null }); setSheetInput(""); }
    if (!error && id) syncNow();
  };
  const syncNow = async () => {
    if (!info) return;
    setSyncing(true); setSyncMsg(null);
    const res = await fetch(`/api/sheets/sync?key=${info.key}`, { method: "POST" }).catch(() => null);
    const body = await res?.json().catch(() => ({})) as { at?: string; error?: string } | undefined;
    setSyncing(false);
    if (res?.ok && body?.at) setInfo((i) => (i ? { ...i, last_sync_at: body.at, last_sync_error: null } : i));
    else setSyncMsg(body?.error ?? "Không gọi được máy chủ.");
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
            Khóa tạo lúc {fmtTime(info.created_at)}{info.created_by ? ` bởi ${info.created_by}` : ""}.
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

          <div className="mt-6 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
            <b className="text-navy">Tự cập nhật mỗi phút</b>
            <p className="mt-1 max-w-2xl text-xs text-slate-600">
              Dùng thay cho công thức ở trên khi cần số liệu gần như tức thì: mỗi phút web tự ghi 6 trang tính
              (Đội thi, Thành viên, Trận đấu…) vào Sheet. Không cần Apps Script hay cấp quyền Google.
            </p>
            {!serviceEmail ? (
              <p className="mt-3 text-xs text-mech-red">
                Chưa cấu hình tài khoản dịch vụ Google: thêm biến môi trường <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> trên Vercel rồi deploy lại.
              </p>
            ) : (
              <>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-slate-700">
                  <li>
                    Trong Sheet bấm <b>Chia sẻ</b>, thêm email này với quyền <b>Người chỉnh sửa</b>:{" "}
                    <code className="break-all rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">{serviceEmail}</code>{" "}
                    <button onClick={() => copy("sa", serviceEmail)} className="font-semibold text-navy-600 hover:underline">
                      {copied === "sa" ? "Đã chép" : "Chép"}
                    </button>
                  </li>
                  <li>Dán đường link của Sheet vào ô dưới rồi bấm <b>Liên kết</b>.</li>
                </ol>
                {info.sheet_id ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <a href={`https://docs.google.com/spreadsheets/d/${info.sheet_id}`} target="_blank" rel="noreferrer" className="font-semibold text-navy-600 hover:underline">
                      Mở Sheet đã liên kết ↗
                    </a>
                    <button onClick={syncNow} disabled={syncing} className={btnPrimary}>{syncing ? "Đang ghi…" : "Đồng bộ ngay"}</button>
                    <button onClick={() => setTarget(null)} disabled={!!busy} className={btnGhost}>Ngắt</button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); if (sheetInput.trim()) setTarget(sheetIdOf(sheetInput)); }} className="mt-3 flex flex-wrap gap-2">
                    <input value={sheetInput} onChange={(e) => setSheetInput(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…"
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="Link Google Sheet" />
                    <button type="submit" disabled={!!busy} className={btnPrimary}>Liên kết</button>
                  </form>
                )}
                {info.sheet_id && (
                  <p className="mt-2 text-xs text-slate-600">
                    {info.last_sync_error
                      ? <span className="text-mech-red">Lỗi lần gần nhất: {info.last_sync_error}</span>
                      : info.last_sync_at ? <>Đã ghi lúc {fmtTime(info.last_sync_at)}</> : "Chưa ghi lần nào."}
                  </p>
                )}
                {syncMsg && <p className="mt-2 text-xs text-mech-red">{syncMsg}</p>}
              </>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Chưa có khóa liên kết. Bấm “Tạo khóa liên kết” để lấy công thức.</p>
      )}
    </section>
  );
}
