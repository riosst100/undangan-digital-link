"use client";

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { EMPTY_FORM, type TahlilFormState } from "./form-state";

/**
 * Autosaves the form to localStorage so an accidental refresh doesn't lose
 * what was typed. Pass `key = null` to disable (e.g. when editing a saved
 * submission). The draft is restored after mount to keep SSR markup stable.
 */
export function useFormDraft(key: string | null, form: TahlilFormState, setForm: Dispatch<SetStateAction<TahlilFormState>>) {
  const restored = useRef(false);

  useEffect(() => {
    if (!key) return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setForm({ ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<TahlilFormState>) });
    } catch {
      // Storage blocked or corrupt draft: start fresh.
    }
    restored.current = true;
  }, [key, setForm]);

  useEffect(() => {
    // Don't overwrite a stored draft with the initial values before it's restored.
    if (!key || !restored.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(form));
    } catch {
      // Ignore quota / private-mode errors.
    }
  }, [key, form]);

  return useCallback(() => {
    if (!key) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  }, [key]);
}
