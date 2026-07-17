import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Plus, Zap, Clock, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjects, deleteProject } from "@/features/projects/actions/projects.actions";
import { ProjectsView } from "@/features/dashboard/components/projects-view";
import type { Document } from "@/types/database";
import { formatRelativeTime } from "@/lib/utils";
import type { Project } from "@/types/projects";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  generating: "bg-blue-500/10 text-blue-600",
  completed: "bg-green-500/10 text-green-600",
  failed: "bg-red-500/10 text-red-600",
  cancelled: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  let documents: Document[] = [];
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  documents = data ?? [];

  const { projects } = await getProjects();

  return (
    <div className="space-y-8">
      {/* Flagship CTA */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Zap className="h-5 w-5 text-white/90" />
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Flagship Feature</span>
            </div>
            <h2 className="text-xl font-bold text-white">Generate a Complete Digital Business</h2>
            <p className="mt-1 text-sm text-white/80">
              One click generates 14 assets: eBook, landing page, email sequence, social pack, and more.
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 bg-white text-[hsl(var(--primary))] hover:bg-white/90"
            size="sm"
          >
            <Link href="/generate" className="gap-2 flex items-center">
              <Zap className="h-4 w-4" /> Generate Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Business Projects */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Digital Business Projects</h2>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/generate">
                <Plus className="h-3.5 w-3.5" /> New Project
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
              >
                {/* Color dot */}
                <div
                  className="h-10 w-10 shrink-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${project.input.primaryColor || "#6366f1"}, ${project.input.secondaryColor || "#8b5cf6"})` }}
                />
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">{project.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" /> {project.input.industry}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatRelativeTime(project.updated_at)}
                    </span>
                  </div>
                </div>
                {/* Status + actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", STATUS_STYLES[project.status])}>
                    {project.status}
                  </span>
                  <Button asChild variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 text-xs">
                    <Link href={`/projects/${project.id}`}>Open</Link>
                  </Button>
                  <form action={async () => {
                    "use server";
                    await deleteProject(project.id);
                  }}>
                    <button
                      type="submit"
                      className="flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
                      title="Delete project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents (existing) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Documents</h2>
        <ProjectsView documents={documents} />
      </div>
    </div>
  );
}
