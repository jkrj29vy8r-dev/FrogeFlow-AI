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
  isCancelling: boolean;
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
  const [isCancelling, setIsCancelling] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const lastActionRef = useRef<(() => Promise<void>) | null>(null);
  // Tracks a user cancellation so the retry backoff below can bail out
  // immediately instead of waiting out its timer and firing another attempt.
  const cancelledRef = useRef(false);

  const readStream = useCallback(
    async <T>(
      url: string,
      body: object,
      onEvent: (event: T) => void
    ): Promise<void> => {
      abortRef.current = new AbortController();
      const controller = abortRef.current;

      // Stall guard: if no data arrives for this long, abort with a clear
      // error instead of leaving the UI spinning forever (e.g. if the
      // serverless function is killed by a platform timeout without ever
      // sending an SSE "error" event).
      const STALL_TIMEOUT_MS = 90_000;
      let stallTimer: ReturnType<typeof setTimeout> | null = null;
      let timedOut = false;
      const resetStallTimer = () => {
        if (stallTimer) clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, STALL_TIMEOUT_MS);
      };

      try {
        resetStallTimer();

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        resetStallTimer();

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
          resetStallTimer();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            // Only a JSON.parse failure on a malformed/partial chunk should
            // be silently ignored. A deliberate throw from onEvent (e.g. the
            // "error" event handler surfacing a server-side failure) must
            // propagate — it was previously being swallowed by this same
            // catch, which meant a clean server-side error left the UI
            // stuck on the spinner forever with no error and no timeout.
            let parsedEvent: T;
            try {
              parsedEvent = JSON.parse(raw) as T;
            } catch {
              continue;
            }
            onEvent(parsedEvent);
          }
        }
      } catch (err) {
        if (timedOut) {
          throw new Error(
            "Generation timed out waiting for a response. Please try again."
          );
        }
        throw err;
      } finally {
        if (stallTimer) clearTimeout(stallTimer);
      }
    },
    []
  );

  const generateOutline = useCallback(async () => {
    setPhase("generating_outline");
    setOutlineText("");
    setError(null);
    setIsCancelling(false);
    cancelledRef.current = false;

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
          setIsCancelling(false);
          void updateDocumentStatus(documentId, "cancelled");
        } else {
          setError(err instanceof Error ? err.message : "Generation failed");
          setPhase("failed");
          setIsCancelling(false);
        }
      }
    };

    lastActionRef.current = action;
    await action();
  }, [documentId, readStream, onOutlineComplete]);

  const generateContent = useCallback(
    async (sectionsToGenerate: Section[]) => {
      const action = async () => {
        // Verify the balance covers every section up front, so we fail fast
        // with a clear message instead of generating the first section and
        // letting the rest fail one-by-one once credits run out mid-run.
        // This lives inside `action` so the failure screen's "Try again"
        // (which re-runs lastActionRef) re-checks credits after a top-up.
        const creditResult = await deductGenerationCredit(
          documentId,
          sectionsToGenerate.length
        );
        if (creditResult.error) {
          setError(creditResult.error);
          setPhase("failed");
          return;
        }

        setPhase("generating_content");
        setError(null);
        setIsCancelling(false);
        cancelledRef.current = false;
        await updateDocumentStatus(documentId, "generating_content");

        // Initialize progress
        const progress: SectionProgress[] = sectionsToGenerate.map((s) => ({
          sectionId: s.id,
          title: s.title,
          status: "pending",
          content: s.content,
        }));
        setSectionProgress(progress);

        try {
          let failedCount = 0;

          // Retry each section a couple of times before giving up. Section
          // generation calls the Anthropic API, which occasionally returns a
          // transient error (overloaded/529, timeout, a dropped stream) — that
          // was the whole cause of the odd "1 of 8 sections failed" runs, where
          // 7 sections wrote fine and a single unlucky one hit a momentary API
          // blip. A short backoff + retry lets those self-heal instead of
          // dumping the user on a failure screen.
          const MAX_ATTEMPTS = 3;
          // Remember the actual reason a section gave up, so the failure
          // screen can show *why* ("...failed: Anthropic API is overloaded")
          // instead of a bare count the user can't act on.
          let lastSectionError = "";

          for (let i = 0; i < sectionsToGenerate.length; i++) {
            const section = sectionsToGenerate[i];
            setCurrentSectionIndex(i);

            let succeeded = false;
            let sectionError = "";

            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
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
                succeeded = true;
                break;
              } catch (sectionErr) {
                // A user cancel must stop everything immediately — never retry.
                if ((sectionErr as Error).name === "AbortError" || cancelledRef.current) {
                  throw sectionErr;
                }

                // Some failures are deterministic — the app's own credits are
                // spent, the session is gone, or the Anthropic account balance
                // is empty. None of those fix themselves on a retry, and every
                // remaining section would fail the same way, so stop the whole
                // run now and surface the real reason instead of grinding
                // through ~3 pointless retries per section.
                const msg = (sectionErr as Error).message ?? "";
                if (
                  /insufficient credits|unauthorized|upgrade your plan|credit balance|balance is too low|billing/i.test(
                    msg
                  )
                ) {
                  throw sectionErr;
                }

                sectionError = msg || sectionError;

                // Transient failure: wait a beat and retry (unless out of
                // attempts). Backoff grows per attempt but stays interruptible
                // so a cancel mid-wait doesn't kick off another request.
                if (attempt < MAX_ATTEMPTS) {
                  const backoffMs = attempt * 1500;
                  const step = 150;
                  for (let waited = 0; waited < backoffMs; waited += step) {
                    if (cancelledRef.current) break;
                    await new Promise((r) => setTimeout(r, step));
                  }
                  if (cancelledRef.current) {
                    throw sectionErr;
                  }
                }
              }
            }

            if (!succeeded) {
              // Mark section as failed but continue with the others.
              failedCount++;
              if (sectionError) lastSectionError = sectionError;
              setSectionProgress((prev) =>
                prev.map((p, idx) =>
                  idx === i ? { ...p, status: "failed" } : p
                )
              );
            }
          }

          if (failedCount > 0) {
            // Don't silently report success and jump to the editor when some
            // (or all) sections actually failed to generate — that left users
            // staring at a "completed" eBook full of blank chapters with no
            // indication anything went wrong. Surface it as a real failure
            // instead; the sections that did succeed are already saved.
            const reason = lastSectionError ? ` Reason: ${lastSectionError}` : "";
            setError(
              `${failedCount} of ${sectionsToGenerate.length} section${failedCount > 1 ? "s" : ""} failed to generate.${reason} You can retry them individually from the editor, or try generating again.`
            );
            setPhase("failed");
            void updateDocumentStatus(documentId, "failed");
            return;
          }

          await updateDocumentStatus(documentId, "completed");
          setPhase("completed");
          onContentComplete?.();
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            setPhase("cancelled");
            setIsCancelling(false);
            void updateDocumentStatus(documentId, "cancelled");
          } else {
            setError(err instanceof Error ? err.message : "Generation failed");
            setPhase("failed");
            setIsCancelling(false);
            void updateDocumentStatus(documentId, "failed");
          }
        }
      };

      lastActionRef.current = action;
      await action();
    },
    [documentId, readStream, onContentComplete]
  );

  const cancel = useCallback(() => {
    // Give instant visual feedback regardless of network conditions — the
    // actual phase flips to "cancelled" as soon as the abort propagates
    // through the fetch/reader, which doesn't depend on any server round-trip.
    setIsCancelling(true);
    cancelledRef.current = true;
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setIsCancelling(false);
    cancelledRef.current = false;
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
    isCancelling,
    generateOutline,
    generateContent,
    cancel,
    retry,
  };
}
