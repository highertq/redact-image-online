"use client";

import { useCallback, useState } from "react";

/**
 * Whether the image is editable or merely viewable.
 *
 * `draw` sets `touch-action: none` on the canvas: a finger drag paints a
 * rectangle and a tap covers a line, which is exactly what editing needs and
 * exactly what stops a tall screenshot from being panned. `scroll` hands the
 * gesture back to the browser and the image responds to nothing.
 *
 * Scroll is the default on touch devices because the first job on a phone is
 * reading the screenshot, and a screenshot that paints rectangles under a
 * scrolling finger reads as broken. Desktop pointers always draw: a mouse drag
 * costs the user nothing and cannot be confused with a pan.
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
