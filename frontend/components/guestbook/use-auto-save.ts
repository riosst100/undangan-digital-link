"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type SaveTracker = {
  begin: () => void;
  end: (ok: boolean) => void;
};

/**
 * Aggregates every auto-saving field on the page into one status line, and
 * warns before leaving the page while anything is still unsaved.
 */
export function useSaveTracker(): { status: SaveStatus; tracker: SaveTracker } {
  const pendingRef = useRef(0);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const tracker = useMemo<SaveTracker>(
    () => ({
      begin() {
        pendingRef.current += 1;
        setStatus("saving");
      },
      end(ok) {
        pendingRef.current = Math.max(0, pendingRef.current - 1);
        if (!ok) setStatus("error");
        else if (pendingRef.current === 0) setStatus((prev) => (prev === "error" ? prev : "saved"));
      },
    }),
    [],
  );

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (pendingRef.current > 0) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { status, tracker };
}

/**
 * Debounced, serialized auto-save: only the latest queued value is saved,
 * and never two saves at once (so a not-yet-created record can't be
 * created twice). Pending changes are flushed on unmount.
 */
export function useAutoSave<T>(save: (value: T) => Promise<void>, tracker: SaveTracker, delay = 700) {
  const saveRef = useRef(save);
  const latest = useRef<{ value: T } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const running = useRef(false);
  const holding = useRef(false);

  useEffect(() => {
    saveRef.current = save;
  });

  const run = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = undefined;
    if (running.current || !latest.current) return;

    running.current = true;
    let ok = true;

    // Values queued while a save is in flight are saved right after it.
    while (latest.current) {
      const { value } = latest.current;
      latest.current = null;
      try {
        await saveRef.current(value);
      } catch {
        // Keep the value so the next flush (e.g. on blur) retries it.
        latest.current ??= { value };
        ok = false;
        break;
      }
    }

    running.current = false;
    holding.current = false;
    tracker.end(ok);
  }, [tracker]);

  const queue = useCallback(
    (value: T) => {
      latest.current = { value };
      if (!holding.current) {
        holding.current = true;
        tracker.begin();
      }
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void run(), delay);
    },
    [delay, run, tracker],
  );

  const flush = useCallback(() => {
    if (!latest.current) return;
    if (!holding.current) {
      holding.current = true;
      tracker.begin();
    }
    void run();
  }, [run, tracker]);

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    latest.current = null;
    if (holding.current && !running.current) {
      holding.current = false;
      tracker.end(true);
    }
  }, [tracker]);

  useEffect(() => () => void run(), [run]);

  return { queue, flush, cancel };
}
