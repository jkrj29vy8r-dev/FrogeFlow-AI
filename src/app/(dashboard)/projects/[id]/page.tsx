import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getProject, deleteProject } from "@/features/projects/actions/projects.actions";
import { ProjectDashboard } from "@/features/projects/components/project-dashboard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Project",
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const { project, error } = await getProject(id);

  if (error || !project) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Link href="/projects" className="flex items-center gap-1 hover:text-[hsl(var(--foreground))]">
              <ArrowLeft className="h-3.5 w-3.5" /> Projects
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{project.name}</h1>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            {project.input.brandName} · {project.input.industry} · {project.input.tone}
          </p>
        </div>
        <form action={async () => {
          "use server";
          await deleteProject(id);
          redirect("/projects");
        }}>
          <Button type="submit" variant="outline" size="sm" className="gap-2 text-red-500 hover:bg-red-500/5 hover:text-red-600 hover:border-red-500/30">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </form>
      </div>

      <ProjectDashboard project={project} />
    </div>
  );
}
