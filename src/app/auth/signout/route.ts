import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicOrigin } from "@/lib/publicOrigin";

export async function POST(request: Request) {
  await createClient().auth.signOut();
  const to = String((await request.formData().catch(() => null))?.get("to") ?? "");
  const target = to.startsWith("/") && !to.startsWith("//") ? to : "/register";
  return NextResponse.redirect(new URL(target, publicOrigin(request)), { status: 303 });
}
