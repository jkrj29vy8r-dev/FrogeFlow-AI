import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log("[diag] SUPABASE_URL:", JSON.stringify(url), "len=", url?.length);
  console.log("[diag] SUPABASE_ANON_KEY present:", !!key, "len=", key?.length);

  return createServerClient<Database>(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies can only be set in Route Handlers / Server Actions
          }
        },
      },
    }
  );
}
