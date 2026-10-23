import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client dùng trong Server Components / Route Handlers / Server Actions
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Gọi từ Server Component thì không set được cookie — middleware sẽ làm mới session.
          }
        },
      },
    },
  );
}
