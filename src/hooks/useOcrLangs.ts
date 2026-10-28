"use client";

import { useCallback, useEffect, useState } from "react";

import {
  isOcrPackId,
  OCR_PACKS,
  OCR_PACKS_DEFAULT,
  OCR_PACKS_MAX,
  type OcrPack,
} from "@/lib/ocr";

const STORAGE_KEY = "redactmy.ocr-packs";
/** The three-setting control this replaced; read once so a choice is not lost. */
const LEGACY_KEY = "redactmy.ocr-langs";

function normalize(ids: readonly string[]): string[] {
  const clean = ids.filter(isOcrPackId);
  if (clean.length === 0) {
    return [...OCR_PACKS_DEFAULT];
  }
  return clean.slice(0, OCR_PACKS_MAX);
}

function readStored(): string[] {
  if (typeof window === "undefined") {
    return [...OCR_PACKS_DEFAULT];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return normalize(parsed.map(String));
      }
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy === "en") {
      return ["eng"];
    }
    if (legacy === "zh") {
      return ["chi_sim", "eng"];
    }
  } catch {
    // A preference is never a reason to break the editor — Safari in private
    // mode throws on any localStorage access at all.
  }
  return [...OCR_PACKS_DEFAULT];
}

export type OcrPacksState = {
  ids: string[];
  packs: OcrPack[];
  has: (id: string) => boolean;
  /** Compressed bytes the browser has to pull for the current selection. */
  bytes: number;
  atLimit: boolean;
  toggle: (id: string) => void;
};

/**
 * Which recognition models the editor loads, remembered between visits.
 *
 * Selections are capped at `OCR_PACKS_MAX` rather than offered as "everything":
 * tesseract merges the chosen models into a single recogniser, so past about
 * four languages each pass gets slower and less accurate, which is the opposite
 * of what someone redacting a document wants.
 */
export default function useOcrPacks(): OcrPacksState {
  const [ids, setIds] = useState<string[]>(readStored);

  const toggle = useCallback((id: string) => {
    if (!isOcrPackId(id)) {
      return;
    }
    setIds((current) => {
      if (current.includes(id)) {
        // Never let the list go empty. An unloaded script is how a document
        // quietly reports "nothing sensitive here".
        return current.length > 1 ? current.filter((entry) => entry !== id) : current;
      }
      return current.length >= OCR_PACKS_MAX ? current : [...current, id];
    });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      // Still applied for this session.
    }
  }, [ids]);

  // Cross-tab sync: a second tab changing the languages should not leave this one
  // silently running a different set of models.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }
      try {
        const parsed: unknown = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) {
          setIds(normalize(parsed.map(String)));
        }
      } catch {
        // Ignore a malformed value from another tab.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const packs = OCR_PACKS.filter((pack) => ids.includes(pack.id));

  return {
    ids,
    packs,
    has: (id: string) => ids.includes(id),
    bytes: packs.reduce((total, pack) => total + pack.bytes, 0),
    atLimit: ids.length >= OCR_PACKS_MAX,
    toggle,
  };
}
