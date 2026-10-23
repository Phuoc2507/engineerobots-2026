import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await createClient().auth.signOut();
  const to = String((await request.formData().catch(() => null))?.get("to") ?? "");
  const target = to.startsWith("/") && !to.startsWith("//") ? to : "/register";
  return NextResponse.redirect(new URL(target, request.url), { status: 303 });
}
