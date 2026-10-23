import { createBrowserClient } from "@supabase/ssr";

// Client dùng trong Client Components (Realtime, form đăng ký...)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
