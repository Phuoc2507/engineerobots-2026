"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronRight, Copy, ExternalLink, FileText, FolderOpen, Loader2, Plus, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CONTENT_SECTIONS, DEFAULT_CONTENT, GROUPS, type Content, type ContentKey, type Field, type ListField } from "@/lib/content";
import MinutesDoc, { SAMPLE_MINUTES } from "@/components/referee/MinutesDoc";
import { ErrorBox, btn, btnGhost, btnPrimary, card, input } from "@/components/admin/ui";

const BUCKET = "site-assets";
const TZ = "Asia/Ho_Chi_Minh";
type Obj = Record<string, unknown>;

const toLocal = (s: string) => (s ? new Date(s).toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T").slice(0, 16) : "");
const fromLocal = (v: string) => (v ? `${v}:00+07:00` : "");
const slug = (name: string) => {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "tep";
  return `${base}${dot > 0 ? name.slice(dot).toLowerCase() : ""}`;
};
const kind = (url: string) => (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) ? "image" : /\.(mp4|webm)(\?|$)/i.test(url) ? "video" : /\.pdf(\?|$)/i.test(url) ? "pdf" : "other");

async function upload(file: File, folder: string) {
  const supabase = createClient();
  const path = `${folder}/${Date.now()}-${slug(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message.includes("exceeded") ? "File quá lớn (tối đa 50 MB)." : error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Trang sửa nội dung & giao diện: chọn mục bên trái, sửa form bên phải, Lưu áp dụng ngay cho web
export default function ContentEditor({ content, edited, initial }: { content: Content; edited: string[]; initial?: string }) {
  const router = useRouter();
  const start = (CONTENT_SECTIONS.find((s) => s.key === initial)?.key ?? "site") as ContentKey;
  const [key, setKey] = useState<ContentKey | "library">(start);
  const [draft, setDraft] = useState<Obj>(structuredClone(content[start]) as Obj);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const section = CONTENT_SECTIONS.find((s) => s.key === key);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const open = (k: ContentKey | "library") => {
    if (dirty && !window.confirm("Mục đang sửa chưa lưu. Bỏ các thay đổi?")) return;
    setKey(k); setError(""); setSaved(""); setDirty(false);
    if (k !== "library") setDraft(structuredClone(content[k]) as Obj);
  };
  const set = (f: string, v: unknown) => { setDraft((d) => ({ ...d, [f]: v })); setDirty(true); setSaved(""); };

  const persist = async (value: Obj | null) => {
    setBusy(value ? "save" : "reset"); setError(""); setSaved("");
    const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
    const j = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) { setError(j.error ?? "Không lưu được."); return; }
    setDirty(false);
    setSaved(value ? "Đã lưu — web đã cập nhật." : "Đã khôi phục mặc định.");
    if (!value && key !== "library") setDraft(structuredClone(DEFAULT_CONTENT[key]) as Obj);
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Các mục nội dung" className="lg:sticky lg:top-4 lg:self-start">
        <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {GROUPS.flatMap((g) => [
            <li key={`g-${g}`} className="hidden px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 first:pt-0 lg:block">{g}</li>,
            ...CONTENT_SECTIONS.filter((s) => s.group === g).map((s) => (
            <li key={s.key}>
              <button onClick={() => open(s.key)} aria-current={key === s.key ? "page" : undefined}
                className={`flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-bold transition ${key === s.key ? "bg-navy text-white" : "text-navy hover:bg-white"}`}>
                {s.title}
                {edited.includes(s.key) && <span title="BTC đã chỉnh" className={`h-2 w-2 shrink-0 rounded-full ${key === s.key ? "bg-mech-gold" : "bg-mech-red"}`} />}
              </button>
            </li>
          ))])}
          <li className="lg:mt-3 lg:border-t lg:border-slate-200 lg:pt-3">
            <button onClick={() => open("library")} aria-current={key === "library" ? "page" : undefined}
              className={`flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-bold transition ${key === "library" ? "bg-navy text-white" : "text-navy hover:bg-white"}`}>
              <FolderOpen className="h-4 w-4" /> Kho ấn phẩm
            </button>
          </li>
        </ul>
      </nav>

      {key === "library" ? <Library /> : section && (
        <section className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl uppercase text-navy">{section.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{section.desc}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Hiện ở: {section.where}</p>
            </div>
            {edited.includes(section.key) && (
              <button onClick={() => { if (window.confirm(`Khôi phục mục “${section.title}” về nội dung mặc định?`)) persist(null); }} disabled={busy !== null} className={btnGhost}>
                {busy === "reset" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Về mặc định
              </button>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {section.fields.map((f) => f.type === "list"
              ? <ListInput key={f.k} f={f} value={(draft[f.k] as Obj[]) ?? []} section={section.key} onChange={(v) => set(f.k, v)} />
              : <FieldInput key={f.k} f={f} value={draft[f.k]} def={(DEFAULT_CONTENT[section.key] as Obj)[f.k]} section={section.key} onChange={(v) => set(f.k, v)} />)}
          </div>

          {section.key === "minutes" && (
            <div className="mt-8">
              <p className="text-sm font-bold text-navy">Xem trước (dữ liệu mẫu, cập nhật theo nội dung đang sửa)</p>
              <div className="mt-2 max-h-[80vh] overflow-auto rounded-lg bg-slate-100 p-3 ring-1 ring-slate-200">
                <div className="min-w-[680px]"><MinutesDoc t={draft as Content["minutes"]} d={SAMPLE_MINUTES} /></div>
              </div>
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur md:-mx-7 md:px-7">
            <p className="flex-1 text-sm">
              {saved ? <span className="inline-flex items-center gap-1 font-semibold text-emerald-600"><Check className="h-4 w-4" /> {saved}</span>
                : dirty ? <span className="font-semibold text-mech-red">Có thay đổi chưa lưu.</span> : <span className="text-slate-500">Chưa thay đổi.</span>}
            </p>
            {dirty && <button onClick={() => { setDraft(structuredClone(content[section.key]) as Obj); setDirty(false); }} className={btnGhost}><X className="h-4 w-4" /> Hủy</button>}
            <button onClick={() => persist(draft)} disabled={!dirty || busy !== null} className={btnPrimary}>
              {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Lưu & áp dụng
            </button>
          </div>
          <ErrorBox error={error} />
        </section>
      )}
    </div>
  );
}

function FieldInput({ f, value, def, section, onChange, compact }: { f: Field; value: unknown; def?: unknown; section: string; onChange: (v: unknown) => void; compact?: boolean }) {
  const id = `${section}-${f.k}-${useId()}`;
  const label = (
    <span className="flex items-center justify-between gap-2">
      <span className={compact ? "text-xs font-semibold text-slate-500" : "text-sm font-bold text-navy"}>{f.label}</span>
      {def !== undefined && value !== def && f.type !== "bool" && (
        <button type="button" onClick={() => onChange(def)} className="text-xs font-semibold text-slate-400 hover:text-navy-600">Dùng mặc định</button>
      )}
    </span>
  );
  const hint = f.hint && <span className="mt-1 block text-xs text-slate-500">{f.hint}</span>;
  const str = typeof value === "string" ? value : "";

  if (f.type === "bool") {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-ice px-4 py-3">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-navy-600" />
        <span className="text-sm font-bold text-navy">{f.label}</span>
      </label>
    );
  }
  if (f.type === "file") return <div>{label}<FileInput url={str} accept={f.accept} folder={section} onChange={onChange} />{hint}</div>;
  return (
    <label htmlFor={id} className="block">
      {label}
      {f.type === "textarea" ? (
        <textarea id={id} value={str} onChange={(e) => onChange(e.target.value)} rows={compact ? 2 : 4} className={`${input} mt-1 h-auto py-2`} />
      ) : f.type === "doc" ? (
        <textarea id={id} value={str} onChange={(e) => onChange(e.target.value)} rows={compact ? 14 : 18} spellCheck={false} className={`${input} mt-1 h-auto py-2 font-mono text-[13px] leading-relaxed`} />
      ) : f.type === "select" ? (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={`${input} mt-1`}>
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : f.type === "datetime" ? (
        <input id={id} type="datetime-local" value={toLocal(str)} onChange={(e) => onChange(fromLocal(e.target.value))} className={`${input} mt-1 max-w-xs`} />
      ) : f.type === "color" ? (
        <span className="mt-1 flex items-center gap-2">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(str) ? str : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={f.label} className="h-10 w-14 cursor-pointer rounded border border-slate-300" />
          <input id={id} value={str} onChange={(e) => onChange(e.target.value)} maxLength={7} className={`${input} w-28 font-mono uppercase`} />
        </span>
      ) : (
        <input id={id} type="text" value={str} onChange={(e) => onChange(e.target.value)} className={`${input} mt-1`} />
      )}
      {hint}
    </label>
  );
}

function FileInput({ url, accept, folder, onChange }: { url: string; accept?: string; folder: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true); setError("");
    try { onChange(await upload(file, folder)); } catch (e) { setError((e as Error).message); }
    setBusy(false);
    if (ref.current) ref.current.value = "";
  };
  const k = kind(url);
  return (
    <div className="mt-1 rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap items-start gap-3">
        {url && k === "image" && (/* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" className="h-24 max-w-[180px] rounded object-contain ring-1 ring-slate-200" />)}
        {url && k === "video" && <video src={url} muted className="h-24 rounded ring-1 ring-slate-200" />}
        {url && k === "pdf" && <span className="grid h-24 w-20 place-items-center rounded bg-ice text-mech-red ring-1 ring-slate-200"><FileText className="h-8 w-8" /></span>}
        <div className="min-w-0 flex-1 space-y-2">
          <input value={url} onChange={(e) => onChange(e.target.value)} placeholder="Đường dẫn file hoặc bấm Tải lên" aria-label="Đường dẫn file" className={`${input} font-mono text-xs`} />
          <div className="flex flex-wrap gap-2">
            <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            <button type="button" onClick={() => ref.current?.click()} disabled={busy} className={`${btnGhost} h-9`}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Tải lên file mới
            </button>
            {url && <a href={url} target="_blank" rel="noopener" className={`${btnGhost} h-9`}><ExternalLink className="h-4 w-4" /> Mở</a>}
          </div>
          {error && <p className="text-xs font-semibold text-mech-red">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function ListInput({ f, value, section, onChange }: { f: ListField; value: Obj[]; section: string; onChange: (v: Obj[]) => void }) {
  // Danh sách có nội dung dài (văn bản) thu gọn từng dòng, bấm tên để mở
  const long = f.item.some((x) => x.type === "doc");
  const [openRow, setOpenRow] = useState<number | null>(null);
  const update = (i: number, k: string, v: unknown) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i: number, d: number) => {
    const n = [...value];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    onChange(n);
  };
  const blank = Object.fromEntries(f.item.map((x) => [x.k, x.type === "select" ? x.options?.[0]?.value ?? "" : ""]));
  return (
    <fieldset>
      <legend className="text-sm font-bold text-navy">{f.label}</legend>
      {f.hint && <p className="text-xs text-slate-500">{f.hint}</p>}
      <ol className="mt-2 space-y-2">
        {value.map((row, i) => (
          <li key={i} className="flex gap-2 rounded-lg bg-ice p-3">
            <span className="mt-1 w-5 shrink-0 font-display text-lg text-slate-400">{i + 1}</span>
            {long && openRow !== i ? (
              <button type="button" onClick={() => setOpenRow(i)} className="flex min-w-0 flex-1 items-center gap-2 text-left font-bold text-navy hover:text-navy-600">
                <ChevronRight className="h-4 w-4 shrink-0" />
                <span className="truncate">{String(row[f.item[0].k] ?? "") || "(chưa đặt tên)"}</span>
              </button>
            ) : (
            <div className={`grid min-w-0 flex-1 gap-2 ${f.item.length > 2 ? "md:grid-cols-2" : f.item.length === 2 ? "sm:grid-cols-2" : ""}`}>
              {long && (
                <button type="button" onClick={() => setOpenRow(null)} className="flex items-center gap-1 text-left text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-navy md:col-span-2">
                  <ChevronDown className="h-4 w-4" /> Thu gọn
                </button>
              )}
              {f.item.map((x) => (
                <div key={x.k} className={(x.type === "textarea" || x.type === "doc") && f.item.length > 2 ? "md:col-span-2" : ""}>
                  <FieldInput f={x} value={row[x.k] ?? ""} section={section} onChange={(v) => update(i, x.k, v)} compact />
                </div>
              ))}
            </div>
            )}
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên" className="rounded p-1 text-slate-400 hover:bg-white hover:text-navy disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Xuống" className="rounded p-1 text-slate-400 hover:bg-white hover:text-navy disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Xóa dòng" className="rounded p-1 text-slate-400 hover:bg-white hover:text-mech-red"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => { onChange([...value, { ...blank }]); setOpenRow(value.length); }} className={`${btn} mt-2 h-9 border border-dashed border-slate-300 text-navy hover:border-navy-600`}>
        <Plus className="h-4 w-4" /> Thêm dòng
      </button>
    </fieldset>
  );
}

type Stored = { name: string; url: string; size: number; created: string };

// Kho ấn phẩm: tải poster, ảnh, PDF… lên để lấy đường dẫn dùng ở thông báo, mạng xã hội hoặc các mục trên
function Library() {
  const ref = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Stored[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const load = async () => {
    const supabase = createClient();
    const { data, error: e } = await supabase.storage.from(BUCKET).list("library", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
    if (e) { setError(e.message); setFiles([]); return; }
    setFiles((data ?? []).filter((x) => x.id).map((x) => ({
      name: x.name, url: supabase.storage.from(BUCKET).getPublicUrl(`library/${x.name}`).data.publicUrl,
      size: (x.metadata as { size?: number } | null)?.size ?? 0, created: x.created_at ?? "",
    })));
  };
  useEffect(() => { load(); }, []);

  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy("up"); setError("");
    try { for (const f of Array.from(list)) await upload(f, "library"); } catch (e) { setError((e as Error).message); }
    setBusy(null);
    if (ref.current) ref.current.value = "";
    load();
  };
  const remove = async (name: string) => {
    if (!window.confirm(`Xóa vĩnh viễn “${name}”? Liên kết tới file này sẽ không mở được nữa.`)) return;
    setBusy(name);
    const { error: e } = await createClient().storage.from(BUCKET).remove([`library/${name}`]);
    setBusy(null);
    if (e) setError(e.message); else load();
  };
  const copy = async (url: string) => { await navigator.clipboard.writeText(url); setCopied(url); setTimeout(() => setCopied(""), 1500); };

  return (
    <section className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl uppercase text-navy">Kho ấn phẩm</h2>
          <p className="mt-1 text-sm text-slate-600">Poster, ảnh, video, PDF công khai (tối đa 50 MB/file). Sao chép đường dẫn để dán vào thông báo, lịch trình hoặc gửi các đội.</p>
        </div>
        <input ref={ref} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,video/mp4,video/webm" className="hidden" onChange={(e) => add(e.target.files)} />
        <button onClick={() => ref.current?.click()} disabled={busy !== null} className={btnPrimary}>
          {busy === "up" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Tải lên
        </button>
      </div>
      <ErrorBox error={error} />
      {!files ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải…</p>
      ) : files.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Chưa có ấn phẩm nào.</p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((x) => {
            const k = kind(x.url);
            return (
              <li key={x.name} className="overflow-hidden rounded-lg ring-1 ring-slate-200">
                <a href={x.url} target="_blank" rel="noopener" className="grid h-36 place-items-center bg-ice">
                  {k === "image" ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={x.url} alt={x.name} className="h-full w-full object-contain" />)
                    : k === "video" ? <video src={x.url} muted className="h-full w-full object-contain" />
                    : <FileText className="h-10 w-10 text-mech-red" />}
                </a>
                <div className="flex items-center gap-2 p-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy" title={x.name}>{x.name.replace(/^\d+-/, "")}</span>
                    <span className="text-xs text-slate-500">{(x.size / 1024 / 1024).toFixed(x.size > 1048576 ? 1 : 2)} MB</span>
                  </span>
                  <button onClick={() => copy(x.url)} aria-label="Sao chép đường dẫn" className="rounded p-1.5 text-slate-500 hover:bg-ice hover:text-navy">
                    {copied === x.url ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button onClick={() => remove(x.name)} disabled={busy !== null} aria-label={`Xóa ${x.name}`} className="rounded p-1.5 text-slate-500 hover:bg-ice hover:text-mech-red">
                    {busy === x.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
