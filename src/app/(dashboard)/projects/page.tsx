import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProjectsView } from "@/features/dashboard/components/projects-view";
import type { Document } from "@/types/database";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let documents: Document[] = [];
  if (user) {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    documents = data ?? [];
  }

  return <ProjectsView documents={documents} />;
}
