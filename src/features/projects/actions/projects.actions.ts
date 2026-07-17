"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectAsset, ProjectWithAssets } from "@/types/projects";

type ProjectRow = Project;
type AssetRow = ProjectAsset;

export async function getProjects(): Promise<{ projects: Project[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { projects: [], error: "Unauthorized" };

  const { data, error } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { order: (a: string, b: object) => Promise<{ data: ProjectRow[] | null; error: unknown }> } } }
  }).from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  return { projects: data ?? [], error: error ? String(error) : undefined };
}

export async function getProject(id: string): Promise<{ project: ProjectWithAssets | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { project: null, error: "Unauthorized" };

  const { data: project } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { single: () => Promise<{ data: ProjectRow | null; error: unknown }> } } }
  }).from("projects").select("*").eq("id", id).single();

  if (!project) return { project: null, error: "Not found" };
  if (project.user_id !== user.id) return { project: null, error: "Unauthorized" };

  const { data: assets } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { order: (a: string, b: object) => Promise<{ data: AssetRow[] | null; error: unknown }> } } }
  }).from("project_assets").select("*").eq("project_id", id).order("created_at", { ascending: true });

  return { project: { ...project, assets: assets ?? [] } };
}

export async function updateProjectStatus(id: string, status: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as never as {
    from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<unknown> } } }
  }).from("projects").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);

  revalidatePath("/projects");
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as never as {
    from: (t: string) => { delete: () => { eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<unknown> } } }
  }).from("projects").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/projects");
}

export async function updateAsset(assetId: string, content: object): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await (supabase as never as {
    from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<{ error: unknown }> } } }
  }).from("project_assets").update({ content, status: "completed", updated_at: new Date().toISOString() }).eq("id", assetId).eq("user_id", user.id);

  return { error: error ? String(error) : undefined };
}

export async function renameAsset(assetId: string, name: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as never as {
    from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<unknown> } } }
  }).from("project_assets").update({ name, updated_at: new Date().toISOString() }).eq("id", assetId).eq("user_id", user.id);
}

export async function deleteAsset(assetId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as never as {
    from: (t: string) => { delete: () => { eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<unknown> } } }
  }).from("project_assets").delete().eq("id", assetId).eq("user_id", user.id);
}
