export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL (got: "${url ?? "undefined"}"). ` +
        "This usually means the Supabase URL and anon key env vars were swapped " +
        "in your deployment settings — NEXT_PUBLIC_SUPABASE_URL must be the " +
        "https://<project-ref>.supabase.co URL, not the anon/publishable key."
    );
  }

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  }

  return { url, anonKey };
}
