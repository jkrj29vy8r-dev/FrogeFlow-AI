"use server";

import { createClient } from "@/lib/supabase/server";
import type { LandingPage, LandingPageSection, SectionType } from "@/types/landing-pages";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getLandingPages(): Promise<{ pages: LandingPage[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pages: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("landing_pages" as never)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as { data: LandingPage[] | null; error: unknown };

  if (error) return { pages: [], error: "Failed to load landing pages" };
  return { pages: data ?? [] };
}

export async function getLandingPage(id: string): Promise<{ page: LandingPage | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { page: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("landing_pages" as never)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as { data: LandingPage | null; error: unknown };

  if (error || !data) return { page: null, error: "Page not found" };
  return { page: data };
}

export async function getLandingPageSections(pageId: string): Promise<{ sections: LandingPageSection[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { sections: [] };

  const { data } = await supabase
    .from("landing_page_sections" as never)
    .select("*")
    .eq("page_id", pageId)
    .eq("user_id", user.id)
    .order("position", { ascending: true }) as { data: LandingPageSection[] | null; error: unknown };

  return { sections: data ?? [] };
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function updateLandingPage(
  id: string,
  updates: { name?: string; status?: 'draft' | 'published'; seo?: LandingPage['seo'] }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("landing_pages" as never)
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update page" };
  return {};
}

export async function updateSection(
  sectionId: string,
  updates: { content?: Record<string, unknown>; is_visible?: boolean }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("landing_page_sections" as never)
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", sectionId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update section" };
  return {};
}

export async function reorderSections(pageId: string, orderedIds: string[]): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates = orderedIds.map((id, index) => ({
    id,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  for (const upd of updates) {
    await supabase
      .from("landing_page_sections" as never)
      .update({ position: upd.position, updated_at: upd.updated_at } as never)
      .eq("id", upd.id)
      .eq("user_id", user.id);
  }

  return {};
}

export async function duplicateSection(sectionId: string): Promise<{ section?: LandingPageSection; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: original } = await supabase
    .from("landing_page_sections" as never)
    .select("*")
    .eq("id", sectionId)
    .eq("user_id", user.id)
    .single() as { data: LandingPageSection | null; error: unknown };

  if (!original) return { error: "Section not found" };

  const { data: inserted } = await supabase
    .from("landing_page_sections" as never)
    .insert({
      page_id: original.page_id,
      user_id: user.id,
      section_type: original.section_type,
      position: original.position + 1,
      is_visible: original.is_visible,
      content: original.content,
    } as never)
    .select()
    .single() as { data: LandingPageSection | null; error: unknown };

  if (!inserted) return { error: "Failed to duplicate section" };
  return { section: inserted };
}

export async function addSection(
  pageId: string,
  sectionType: SectionType,
  position: number
): Promise<{ section?: LandingPageSection; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify the page belongs to this user before writing a section into it
  const { data: page } = await supabase
    .from("landing_pages" as never)
    .select("id")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .single();
  if (!page) return { error: "Page not found" };

  const defaultContent = getDefaultContent(sectionType);

  const { data } = await supabase
    .from("landing_page_sections" as never)
    .insert({
      page_id: pageId,
      user_id: user.id,
      section_type: sectionType,
      position,
      is_visible: true,
      content: defaultContent,
    } as never)
    .select()
    .single() as { data: LandingPageSection | null; error: unknown };

  if (!data) return { error: "Failed to add section" };
  return { section: data };
}

export async function deleteSection(sectionId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("landing_page_sections" as never)
    .delete()
    .eq("id", sectionId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete section" };
  return {};
}

export async function deleteLandingPage(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("landing_pages" as never)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete page" };
  return {};
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDefaultContent(type: SectionType): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return { headline: 'New Hero Section', subheadline: 'Add your subheadline here.', primaryCta: { text: 'Get Started', href: '#' } };
    case 'pain_points':
      return { headline: 'Challenges You Face', items: [{ emoji: '😤', title: 'Challenge 1', description: 'Describe this challenge.' }] };
    case 'solution':
      return { headline: 'The Solution', description: 'Describe your solution.', points: ['Point 1', 'Point 2', 'Point 3'] };
    case 'features':
      return { headline: 'Features', items: [{ title: 'Feature 1', description: 'Describe this feature.' }] };
    case 'benefits':
      return { headline: 'Benefits', items: [{ icon: '⚡', title: 'Benefit 1', description: 'Describe this benefit.' }] };
    case 'how_it_works':
      return { headline: 'How It Works', steps: [{ step: '1', title: 'Step One', description: 'Describe this step.' }] };
    case 'testimonials':
      return { headline: 'What Our Customers Say', items: [{ name: 'Customer Name', role: 'Role', quote: 'Great product!', rating: 5 }] };
    case 'pricing':
      return { headline: 'Simple Pricing', plans: [{ name: 'Pro', price: '$49', period: '/month', description: 'Everything you need', features: ['Feature 1', 'Feature 2'], cta: 'Get Started', highlighted: true }] };
    case 'faq':
      return { headline: 'Frequently Asked Questions', items: [{ question: 'Sample question?', answer: 'Sample answer.' }] };
    case 'guarantee':
      return { headline: 'Money-Back Guarantee', description: 'Try risk-free for 30 days.', period: '30 days' };
    case 'about':
      return { headline: 'About Us', description: 'Tell your story here.' };
    case 'cta':
      return { headline: 'Ready to Get Started?', subheadline: 'Join thousands of customers today.', primaryCta: { text: 'Start Now', href: '#' } };
    case 'footer':
      return { companyName: 'Company', copyright: `© ${new Date().getFullYear()} Company. All rights reserved.` };
    default:
      return {};
  }
}
