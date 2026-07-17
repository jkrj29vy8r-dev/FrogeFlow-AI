import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildCoverGenerationPrompt } from "@/features/covers/lib/prompts";
import { generationRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { checkCredits, deductCredits } from "@/lib/credits";
import type { CoverInput, CoverVariation } from "@/types/covers";

const AI_MODEL = "claude-sonnet-5";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await generationRateLimit(`cover:${user.id}`);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, {
      status: 429,
      headers: rateLimitHeaders(rl),
    });
  }

  const { ok: hasCredits } = await checkCredits(supabase, user.id, 1);
  if (!hasCredits) {
    return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
  }

  let input: CoverInput;
  try {
    input = await req.json() as CoverInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: buildCoverGenerationPrompt(input) }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text ?? "";
    const clean = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(clean) as { variations: CoverVariation[] };

    await deductCredits(supabase, user.id, "cover_generated", { cover_name: input.title });

    return NextResponse.json({ variations: parsed.variations });
  } catch (err) {
    console.error("Cover generation error:", err);
    return NextResponse.json({ error: "Failed to generate cover designs" }, { status: 500 });
  }
}
