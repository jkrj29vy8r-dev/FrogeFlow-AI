"use client";

import { useState, useCallback } from "react";

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isPending: boolean;
}

export function useAsync<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isPending: false,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, error: null, isPending: true });
      try {
        const data = await fn(...args);
        setState({ data, error: null, isPending: false });
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setState({ data: null, error: message, isPending: false });
        return null;
      }
    },
    [fn]
  );

  return { ...state, execute };
}
