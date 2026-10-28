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

// Apps Script dán vào Sheet: tải 6 bảng song song (fetchAll) mỗi phút, ghi đè trang tính cùng tên
const appsScript = (origin: string, key: string) => `/** @OnlyCurrentDoc */
// ENGINEEROBOTS 2026 – tự cập nhật dữ liệu từ web vào Sheet này (chỉ xin quyền với đúng file này)
const BASE = "${origin}/api/sheets/";
const KEY = "${key}";
const SHEETS = ${JSON.stringify(Object.fromEntries(DATASETS.map((d) => [d.id, d.label])))};
const TEXT_COLS = /SĐT|MSSV/; // giữ số 0 đầu

function capNhat() {
  const ss = SpreadsheetApp.getActive();
  const ids = Object.keys(SHEETS);
  const res = UrlFetchApp.fetchAll(ids.map((id) => ({ url: BASE + id + "?key=" + KEY, muteHttpExceptions: true })));
  res.forEach((r, i) => {
    const name = SHEETS[ids[i]];
    if (r.getResponseCode() !== 200) throw new Error(name + ": " + r.getContentText());
    const rows = Utilities.parseCsv(r.getContentText("UTF-8"));
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clearContents();
    if (!rows.length) return;
    const w = Math.max(...rows.map((x) => x.length));
    rows.forEach((x) => { while (x.length < w) x.push(""); });
    rows[0].forEach((h, c) => { if (TEXT_COLS.test(h)) sh.getRange(1, c + 1, rows.length).setNumberFormat("@"); });
    sh.getRange(1, 1, rows.length, w).setValues(rows);
    sh.setFrozenRows(1);
  });
}

// Chạy hàm này MỘT LẦN: cấp quyền + bật cập nhật mỗi phút
function batTuDong() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("capNhat").timeBased().everyMinutes(1).create();
  capNhat();
}

function tatTuDong() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("ENGINEEROBOTS")
    .addItem("Cập nhật ngay", "capNhat")
    .addItem("Bật tự cập nhật mỗi phút", "batTuDong")
    .addItem("Tắt tự cập nhật", "tatTuDong")
    .addToUi();
}
`;

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

          <div className="mt-6 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <b className="text-navy">Tự cập nhật mỗi phút (Apps Script)</b>
                <p className="mt-1 max-w-2xl text-xs text-slate-600">
                  Dùng thay cho công thức ở trên khi cần số liệu gần như tức thì. Trong Sheet: <b>Tiện ích mở rộng → Apps Script</b>,
                  xóa hết mã có sẵn, dán đoạn này, bấm Lưu, chọn hàm <b>batTuDong</b> rồi bấm <b>Chạy</b> và cho phép quyền.
                  Script tự tạo 6 trang tính và cập nhật mỗi phút; mở lại Sheet sẽ có menu <b>ENGINEEROBOTS → Cập nhật ngay</b>.
                  Đổi khóa thì phải dán lại script mới.
                </p>
              </div>
              <button onClick={() => copy("script", appsScript(origin, info.key))} className={btnGhost}>
                {copied === "script" ? <><Check className="h-4 w-4" /> Đã chép</> : <><Copy className="h-4 w-4" /> Chép script</>}
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Chưa có khóa liên kết. Bấm “Tạo khóa liên kết” để lấy công thức.</p>
      )}
    </section>
  );
}
