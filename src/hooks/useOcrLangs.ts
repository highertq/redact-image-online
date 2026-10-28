"use client";

import { useCallback, useEffect, useState } from "react";

import {
  isOcrLangsMode,
  OCR_LANGS_DEFAULT,
  type OcrLangsMode,
} from "@/lib/ocr";

const STORAGE_KEY = "redactmy.ocr-langs";

/**
 * The recognition language setting, remembered between visits.
 *
 * Someone who redacts Chinese bills every week should not have to say so every
 * week. Reading is guarded because Safari in private mode throws on any
 * localStorage access, and a preference is never a reason to break the editor.
 */
export default function useOcrLangs(): {
  mode: OcrLangsMode;
  setMode: (mode: OcrLangsMode) => void;
} {
  const [mode, setModeState] = useState<OcrLangsMode>(() => {
    if (typeof window === "undefined") {
      return OCR_LANGS_DEFAULT;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return isOcrLangsMode(stored) ? stored : OCR_LANGS_DEFAULT;
    } catch {
      return OCR_LANGS_DEFAULT;
    }
  });

  const setMode = useCallback((next: OcrLangsMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Still applied for this session.
    }
  }, []);

  // Cross-tab sync: a second tab changing the language should not leave this one
  // silently running a different set of models.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isOcrLangsMode(event.newValue)) {
        setModeState(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { mode, setMode };
}
