"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "member-photos";
const MAX_SIDE = 800; // đủ rõ mặt để đối chiếu, file chỉ còn ~100–200 KB

// Thu nhỏ ảnh điện thoại (thường 3–8 MB) thành JPEG trước khi tải lên
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không đọc được ảnh."))), "image/jpeg", 0.85));
}

// Khung ảnh chân dung của một thành viên; đội trưởng bấm vào để tải / chụp ảnh mới.
// Quyền thật nằm ở RPC set_member_photo và policy của bucket member-photos.
export default function MemberPhoto({ teamId, email, name, url, canEdit }: { teamId: string; email: string; name: string; url: string | null; canEdit: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const blob = await shrink(file);
      const supabase = createClient();
      const path = `${teamId}/${crypto.randomUUID()}.jpg`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: old, error: rpcErr } = await supabase.rpc("set_member_photo", { p_email: email, p_path: path });
      if (rpcErr) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw rpcErr;
      }
      if (old) await supabase.storage.from(BUCKET).remove([old as string]);
      router.refresh();
    } catch (e) {
      window.alert(`Không tải được ảnh của ${name}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const face = url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={`Ảnh của ${name}`} className="h-full w-full object-cover" />
  ) : canEdit ? (
    <Camera className="h-6 w-6 text-mech-gold" />
  ) : (
    <UserRound className="h-7 w-7 text-slate-400" />
  );
  const frame = `relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-ice ring-2 ${url ? "ring-emerald-400" : "ring-mech-gold"}`;

  if (!canEdit) return <span className={frame}>{face}</span>;
  return (
    <>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} title={url ? "Đổi ảnh" : "Tải ảnh rõ mặt"} aria-label={`${url ? "Đổi" : "Tải"} ảnh của ${name}`} className={`${frame} group`}>
        {face}
        <span className={`absolute inset-0 grid place-items-center bg-navy/60 text-white transition ${busy ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        </span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
    </>
  );
}
