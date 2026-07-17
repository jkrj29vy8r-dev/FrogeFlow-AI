import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCover } from "@/features/covers/actions/covers.actions";
import { CoverEditor } from "@/features/covers/components/cover-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { cover } = await getCover(id);
  return { title: cover ? `Edit: ${cover.name}` : "Cover Editor" };
}

export default async function CoverEditorPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const { cover } = await getCover(id);
  if (!cover) notFound();

  return <CoverEditor cover={cover} />;
}
