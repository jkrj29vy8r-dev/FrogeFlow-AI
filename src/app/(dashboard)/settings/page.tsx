import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/features/dashboard/components/settings-view";
import type { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, username, language, timezone, last_login, plan, credits, created_at, updated_at")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return <SettingsView user={user as User} profile={profile} />;
}
