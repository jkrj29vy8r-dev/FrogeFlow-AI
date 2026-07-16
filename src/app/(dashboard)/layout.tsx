import { createClient } from "@/lib/supabase/server";
import { SidebarProvider } from "@/context/sidebar-context";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { Topbar } from "@/features/dashboard/components/topbar";
import type { Profile } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
        <Sidebar user={user} profile={profile} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar user={user} profile={profile} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
