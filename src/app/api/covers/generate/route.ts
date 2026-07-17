import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildCoverGenerationPrompt } from "@/features/covers/lib/prompts";
import type { CoverInput, CoverVariation } from "@/types/covers";

const AI_MODEL = "claude-sonnet-5";

export async function POST(req: NextRequest) {
  try {
    const input = await req.json() as CoverInput;

    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: buildCoverGenerationPrompt(input) }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text ?? "";
    const clean = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(clean) as { variations: CoverVariation[] };

    return NextResponse.json({ variations: parsed.variations });
  } catch (err) {
    console.error("Cover generation error:", err);
    return NextResponse.json({ error: "Failed to generate cover designs" }, { status: 500 });
  }
}
