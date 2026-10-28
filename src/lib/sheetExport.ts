import { createClient } from "@supabase/supabase-js";

export const DATASETS = [
  { id: "teams", label: "Đội thi" },
  { id: "members", label: "Thành viên" },
  { id: "matches", label: "Trận đấu" },
  { id: "standings", label: "Xếp hạng" },
  { id: "practice", label: "Thử sa bàn" },
  { id: "votes", label: "Bình chọn" },
];

// Client anon không session; quyền đọc nằm ở khóa truyền vào RPC. Tắt cache fetch của Next.
export const anonClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });

// Hàng đầu là tiêu đề cột (theo thứ tự SQL trả về)
export function toRows(data: unknown): unknown[][] {
  const rows = (data ?? []) as Record<string, unknown>[];
  if (!rows.length) return [["Chưa có dữ liệu"]];
  const head = Object.keys(rows[0]);
  return [head, ...rows.map((r) => head.map((h) => r[h] ?? ""))];
}
