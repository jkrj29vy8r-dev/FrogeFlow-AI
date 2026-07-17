import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/resend/emails";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Send welcome email to users who just confirmed their email (created < 10 min ago)
      const user = data.user;
      const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
      const isNew = Date.now() - createdAt < 10 * 60 * 1000;
      if (isNew && user.email) {
        const name = (user.user_metadata?.full_name as string | undefined) ?? "";
        void sendWelcomeEmail(user.email, name);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
