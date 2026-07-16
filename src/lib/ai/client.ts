import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

let _anthropic: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

export const AI_MODEL = "claude-sonnet-5" as const;
export const AI_MAX_TOKENS = 8192 as const;
