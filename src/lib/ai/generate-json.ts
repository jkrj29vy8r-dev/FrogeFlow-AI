import { getAnthropic, AI_MODEL } from "@/lib/ai/client";

/**
 * Runs a prompt and returns the model's text output, accumulated from the
 * stream. Two reasons this streams instead of using messages.create():
 *
 *  1. A large JSON response (the Generate-Business Phase 1 prompt asks for
 *     ~11 rich assets in one object) can exceed a low max_tokens and get
 *     truncated into invalid JSON — the "Failed to parse AI response" bug.
 *     Streaming lets us set a high max_tokens safely without risking an HTTP
 *     timeout on a non-streaming request.
 *  2. claude-sonnet-5 runs adaptive thinking by default, so a non-streaming
 *     response's content[0] can be a (usually empty) thinking block, making
 *     naive `content[0].text` extraction return "". Accumulating only
 *     text_delta events skips thinking entirely.
 */
export async function generateJsonText(
  prompt: string,
  maxTokens = 32000
): Promise<string> {
  const anthropic = getAnthropic();
  const stream = anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  let text = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      text += event.delta.text;
    }
  }
  return text;
}

/**
 * Pulls a JSON object out of a model response. Strips ```json fences and, as a
 * fallback, slices from the first "{" to the last "}" so stray prose the model
 * occasionally adds before/after the object doesn't break JSON.parse.
 */
export function extractJsonObject(raw: string): string {
  const stripped = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  if (stripped.startsWith("{") && stripped.endsWith("}")) return stripped;

  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return stripped.slice(first, last + 1);
  }
  return stripped;
}
