import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STUDENT_DOMAIN } from "@/lib/site";

// Google OAuth trả về đây với ?code=… — đổi code lấy session rồi chặn email ngoài domain trường (trừ BTC/trọng tài)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/register";

  if (!code) return NextResponse.redirect(`${origin}/register?error=auth`);

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/register?error=auth`);

  if (!data.user.email?.toLowerCase().endsWith(`@${STUDENT_DOMAIN}`)) {
    // Email ngoài trường chỉ được vào nếu nằm trong danh sách BTC/trọng tài
    const { data: staff } = await supabase.rpc("is_staff");
    if (!staff) {
      await supabase.auth.signOut();
      const staffLogin = target.startsWith("/admin") || target.startsWith("/referee");
      return NextResponse.redirect(`${origin}${staffLogin ? "/referee/login?error=not_staff" : "/register?error=domain"}`);
    }
  }

  return NextResponse.redirect(`${origin}${target}`);
}
