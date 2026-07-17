"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Cover, CoverContent, ProductType } from "@/types/covers";

type DB = {
  from: (t: string) => {
    select: (s: string) => {
      eq: (a: string, b: string) => {
        order: (a: string, b: object) => Promise<{ data: Cover[] | null; error: unknown }>;
        single: () => Promise<{ data: Cover | null; error: unknown }>;
      };
    };
    insert: (d: object) => { select: (s: string) => { single: () => Promise<{ data: Cover | null; error: unknown }> } };
    update: (d: object) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<{ error: unknown }> } };
    delete: () => { eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<unknown> } };
  };
};

export async function getCovers(): Promise<{ covers: Cover[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { covers: [] };

  const { data } = await (supabase as unknown as DB).from("covers")
    .select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return { covers: data ?? [] };
}

export async function getCover(id: string): Promise<{ cover: Cover | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { cover: null, error: "Unauthorized" };

  const { data, error } = await (supabase as unknown as DB).from("covers")
    .select("*").eq("id", id).single();

  if (error || !data) return { cover: null, error: "Not found" };
  if (data.user_id !== user.id) return { cover: null, error: "Unauthorized" };
  return { cover: data };
}

export async function createCover(input: {
  name: string;
  productType: ProductType;
  content: CoverContent;
  projectId?: string;
}): Promise<{ cover: Cover | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { cover: null, error: "Unauthorized" };

  const { data, error } = await (supabase as unknown as DB).from("covers").insert({
    user_id: user.id,
    project_id: input.projectId ?? null,
    name: input.name,
    product_type: input.productType,
    content: input.content,
  }).select("*").single();

  if (error) return { cover: null, error: String(error) };
  revalidatePath("/covers");
  return { cover: data };
}

export async function updateCoverContent(id: string, content: CoverContent): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await (supabase as unknown as DB).from("covers")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", user.id);

  return { error: error ? String(error) : undefined };
}

export async function renameCover(id: string, name: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as unknown as DB).from("covers")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", user.id);

  revalidatePath("/covers");
}

export async function deleteCover(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await (supabase as unknown as DB).from("covers")
    .delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/covers");
}
