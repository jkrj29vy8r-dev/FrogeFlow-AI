"use client";

import { useState } from "react";

export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    } catch {
      setCopied(false);
    }
  }

  return { copied, copy };
}
