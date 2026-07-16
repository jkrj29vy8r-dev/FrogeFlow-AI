"use client";

import { useState, useCallback, useRef } from "react";

export type AiEditAction =
  | "rewrite"
  | "expand"
  | "shorten"
  | "improve"
  | "tone"
  | "translate"
  | "summarize"
  | "examples"
  | "faq"
  | "continue";

export interface UseEditorAiReturn {
  isLoading: boolean;
  error: string | null;
  runAction: (
    action: AiEditAction,
    text: string,
    opts?: { tone?: string; language?: string }
  ) => Promise<string>;
  cancel: () => void;
  clearError: () => void;
}

export function useEditorAi(): UseEditorAiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runAction = useCallback(
    async (
      action: AiEditAction,
      text: string,
      opts?: { tone?: string; language?: string }
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);
      abortRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai/edit-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, text, ...opts }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          const err = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(err.error ?? "AI request failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let result = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const event = JSON.parse(raw) as {
                type: string;
                text?: string;
                message?: string;
              };
              if (event.type === "token" && event.text) result += event.text;
              if (event.type === "error") throw new Error(event.message);
            } catch {
              // ignore malformed chunks
            }
          }
        }

        return result;
      } catch (err) {
        if ((err as Error).name === "AbortError") return "";
        const msg = err instanceof Error ? err.message : "AI failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, runAction, cancel, clearError };
}
