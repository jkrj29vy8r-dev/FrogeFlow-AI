import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client — bypasses RLS.
 * Use ONLY in server-side contexts (API routes, webhooks).
 * NEVER expose the service role key to the client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL (got: "${url ?? "undefined"}"). ` +
        "Check that the Supabase URL and key env vars are not swapped."
    );
  }
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY — cannot create admin client");
  }

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
