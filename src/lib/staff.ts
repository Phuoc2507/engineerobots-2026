import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "BTC" | "HEAD_REFEREE" | "REFEREE";
export type Staff = { email: string; full_name: string | null; role: StaffRole };

// Đọc tài khoản BTC/trọng tài của người đang đăng nhập (null nếu không phải staff)
export async function getStaff(): Promise<Staff | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.rpc("get_my_staff");
  return ((data as Staff[] | null) ?? [])[0] ?? null;
}

// Chặn trang theo vai trò; quyền thật vẫn nằm ở các RPC phía DB
export async function requireStaff(roles?: StaffRole[]): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/referee/login");
  if (roles && !roles.includes(staff.role)) redirect(staff.role === "BTC" ? "/admin" : "/referee");
  return staff;
}

export const isHead = (s: Staff) => s.role === "BTC" || s.role === "HEAD_REFEREE";
