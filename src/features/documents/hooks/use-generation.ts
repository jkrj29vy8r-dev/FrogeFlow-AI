"use client";

import { useState, useCallback, useRef } from "react";
import type { OutlineStreamEvent, SectionStreamEvent } from "@/features/documents/types";
import type { Section } from "@/types/database";
import { updateDocumentStatus, deductGenerationCredit } from "@/features/documents/actions/sections.actions";

export type GenerationPhase =
  | "idle"
  | "generating_outline"
  | "outline_ready"
  | "generating_content"
  | "completed"
  | "failed"
  | "cancelled";

export interface SectionProgress {
  sectionId: string;
  title: string;
  status: "pending" | "generating" | "completed" | "failed";
  content: string;
}

export interface UseGenerationReturn {
  phase: GenerationPhase;
  outlineText: string;
  sections: Section[];
  sectionProgress: SectionProgress[];
  currentSectionIndex: number;
  error: string | null;
  generateOutline: () => Promise<void>;
  generateContent: (sections: Section[]) => Promise<void>;
  cancel: () => void;
  retry: () => void;
}

export function useGeneration(
  documentId: string,
  initialPhase: GenerationPhase = "idle",
  onOutlineComplete?: (sections: Section[]) => void,
  onContentComplete?: () => void
): UseGenerationReturn {
  const [phase, setPhase] = useState<GenerationPhase>(initialPhase);
  const [outlineText, setOutlineText] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastActionRef = useRef<(() => Promise<void>) | null>(null);

  const readStream = useCallback(
    async <T>(
      url: string,
      body: object,
      onEvent: (event: T) => void
    ): Promise<void> => {
      abortRef.current = new AbortController();

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
            onEvent(JSON.parse(raw) as T);
          } catch {
            // ignore malformed chunks
          }
        }
      }
    },
    []
  );

  const generateOutline = useCallback(async () => {
    setPhase("generating_outline");
    setOutlineText("");
    setError(null);

    const action = async () => {
      try {
        let parsedSections: Section[] = [];

        await readStream<OutlineStreamEvent>(
          "/api/ai/generate-outline",
          { documentId },
          (event) => {
            if (event.type === "token") {
              setOutlineText((prev) => prev + event.text);
            } else if (event.type === "done") {
              parsedSections = event.sections as unknown as Section[];
              setSections(parsedSections);
              setPhase("outline_ready");
              onOutlineComplete?.(parsedSections);
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          }
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setPhase("cancelled");
          await updateDocumentStatus(documentId, "cancelled");
        } else {
          setError(err instanceof Error ? err.message : "Generation failed");
          setPhase("failed");
        }
      }
    };

    lastActionRef.current = action;
    await action();
  }, [documentId, readStream, onOutlineComplete]);

  const generateContent = useCallback(
    async (sectionsToGenerate: Section[]) => {
      // Deduct 1 credit before starting
      const creditResult = await deductGenerationCredit(documentId);
      if (creditResult.error) {
        setError(creditResult.error);
        return;
      }

      setPhase("generating_content");
      setError(null);
      await updateDocumentStatus(documentId, "generating_content");

      // Initialize progress
      const progress: SectionProgress[] = sectionsToGenerate.map((s) => ({
        sectionId: s.id,
        title: s.title,
        status: "pending",
        content: s.content,
      }));
      setSectionProgress(progress);

      const action = async () => {
        try {
          for (let i = 0; i < sectionsToGenerate.length; i++) {
            const section = sectionsToGenerate[i];
            setCurrentSectionIndex(i);

            setSectionProgress((prev) =>
              prev.map((p, idx) =>
                idx === i ? { ...p, status: "generating", content: "" } : p
              )
            );

            let sectionContent = "";

            try {
              await readStream<SectionStreamEvent>(
                "/api/ai/generate-section",
                { sectionId: section.id, documentId },
                (event) => {
                  if (event.type === "token") {
                    sectionContent += event.text;
                    setSectionProgress((prev) =>
                      prev.map((p, idx) =>
                        idx === i ? { ...p, content: sectionContent } : p
                      )
                    );
                  } else if (event.type === "done") {
                    setSectionProgress((prev) =>
                      prev.map((p, idx) =>
                        idx === i ? { ...p, status: "completed", content: sectionContent } : p
                      )
                    );
                  } else if (event.type === "error") {
                    throw new Error(event.message);
                  }
                }
              );
            } catch (sectionErr) {
              if ((sectionErr as Error).name === "AbortError") throw sectionErr;

              // Mark section as failed but continue with others
              setSectionProgress((prev) =>
                prev.map((p, idx) =>
                  idx === i ? { ...p, status: "failed" } : p
                )
              );
            }
          }

          await updateDocumentStatus(documentId, "completed");
          setPhase("completed");
          onContentComplete?.();
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            setPhase("cancelled");
            await updateDocumentStatus(documentId, "cancelled");
          } else {
            setError(err instanceof Error ? err.message : "Generation failed");
            setPhase("failed");
            await updateDocumentStatus(documentId, "failed");
          }
        }
      };

      lastActionRef.current = action;
      await action();
    },
    [documentId, readStream, onContentComplete]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    setError(null);
    if (lastActionRef.current) {
      void lastActionRef.current();
    }
  }, []);

  return {
    phase,
    outlineText,
    sections,
    sectionProgress,
    currentSectionIndex,
    error,
    generateOutline,
    generateContent,
    cancel,
    retry,
  };
}
