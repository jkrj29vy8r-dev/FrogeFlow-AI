"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { saveSectionContent } from "@/features/documents/actions/sections.actions";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseAutosaveReturn {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
}

export function useAutosave(
  sectionId: string,
  documentId: string,
  content: string,
  enabled = true
): UseAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const debouncedContent = useDebounce(content, 1500);
  // Track the last content that was successfully saved to avoid redundant saves
  const lastSavedContentRef = useRef<string>("");
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (debouncedContent === lastSavedContentRef.current) return;
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setStatus("saving");

    saveSectionContent(sectionId, documentId, debouncedContent)
      .then((result) => {
        if (result.error) {
          setStatus("error");
        } else {
          lastSavedContentRef.current = debouncedContent;
          setStatus("saved");
          setLastSavedAt(new Date());
          // Reset to idle after 2s
          setTimeout(() => setStatus("idle"), 2000);
        }
      })
      .catch(() => setStatus("error"))
      .finally(() => {
        isSavingRef.current = false;
      });
  }, [debouncedContent, sectionId, documentId, enabled]);

  return { status, lastSavedAt };
}
