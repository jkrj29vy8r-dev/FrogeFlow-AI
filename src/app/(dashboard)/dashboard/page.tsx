import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import type { Profile, Document } from "@/types/database";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let documents: Document[] = [];

  if (user) {
    const [profileRes, documentsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, username, language, timezone, last_login, plan, credits, created_at, updated_at")
        .eq("id", user.id)
        .single(),
      supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(10),
    ]);
    profile = profileRes.data;
    documents = documentsRes.data ?? [];
  }

  return <DashboardOverview user={user} profile={profile} documents={documents} />;
}
