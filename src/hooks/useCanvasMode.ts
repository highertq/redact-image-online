"use client";

import { useCallback, useState } from "react";

/**
 * How the canvas answers a touch: draw a box, or pan the page.
 *
 * `draw` sets `touch-action: none` on the canvas, which is what makes a finger
 * drag paint a rectangle — and also what makes a phone unable to scroll a tall
 * screenshot, because every pan attempt becomes a rectangle. `scroll` hands the
 * gesture back to the browser.
 *
 * Scroll is the default on touch devices: the common first job on a phone is
 * reviewing a long screenshot, and an accidental rectangle is worse than a
 * deliberate mode change. Desktop pointers draw, always, since a mouse drag
 * costs the user nothing.
 */
export type CanvasMode = "draw" | "scroll";

const STORAGE_KEY = "redactmy.canvas-mode";

function readStored(): CanvasMode {
  if (typeof window === "undefined") {
    return "scroll";
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "draw" || stored === "scroll" ? stored : "scroll";
  } catch {
    return "scroll";
  }
}

export default function useCanvasMode(
  /** Only a touch device can change the mode; elsewhere the canvas always draws. */
  isCoarsePointer: boolean,
): { mode: CanvasMode; setMode: (mode: CanvasMode) => void } {
  const [mode, setModeState] = useState<CanvasMode>(readStored);

  const setMode = useCallback((next: CanvasMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Applied for this session regardless.
    }
  }, []);

  // The stored value only means anything on a touch device: a mouse drag costs
  // the user nothing, so desktop always draws. Deriving it here keeps the effect
  // out of the picture entirely — no state write after mount to fight over.
  return { mode: isCoarsePointer ? mode : "draw", setMode };
}
