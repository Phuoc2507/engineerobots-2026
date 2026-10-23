"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Gọi RPC của staff, hiện lỗi tiếng Việt từ DB và làm mới dữ liệu server sau khi xong
export function useRpc() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const call = async <T = unknown,>(key: string, fn: string, args?: Record<string, unknown>, opts?: { confirm?: string; refresh?: boolean }) => {
    if (opts?.confirm && !window.confirm(opts.confirm)) return { data: null as T | null, error: "cancelled" };
    setBusy(key);
    setError("");
    const { data, error } = await createClient().rpc(fn, args);
    setBusy(null);
    if (error) setError(error.message);
    if (opts?.refresh !== false) router.refresh();
    return { data: (data ?? null) as T | null, error: error?.message ?? null };
  };

  return { busy, error, setError, call, router };
}

export function ErrorBox({ error }: { error: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-mech-red/30 bg-red-50 p-3 text-sm text-mech-red">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
    </p>
  );
}

export const card = "rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7";
export const input = "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-600/20";
export const btn = "inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btn} bg-navy-600 text-white hover:bg-navy`;
export const btnDanger = `${btn} bg-mech-red text-white hover:bg-red-700`;
export const btnGhost = `${btn} border border-slate-300 bg-white text-navy hover:border-navy-600`;
