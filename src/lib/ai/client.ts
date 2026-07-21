import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your deployment's environment variables."
      );
    }
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

export const AI_MODEL = "claude-sonnet-5" as const;
export const AI_MAX_TOKENS = 8192 as const;
