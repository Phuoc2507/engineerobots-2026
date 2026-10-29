import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Bỏ qua file tĩnh, ảnh/video/mô hình 3D và API Google Sheet (dùng khóa riêng, không cần session)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/sheets|.*\.(?:svg|png|jpg|jpeg|gif|webp|mp4|glb)$).*)"],
};
