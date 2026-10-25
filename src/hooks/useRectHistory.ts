"use client";

import { useCallback, useState } from "react";

import type { Rect } from "@/lib/geometry";

export type History = {
  past: Rect[][];
  present: Rect[];
  future: Rect[][];
};

export const EMPTY_HISTORY: History = { past: [], present: [], future: [] };

export type RectHistory = {
  rects: Rect[];
  canUndo: boolean;
  canRedo: boolean;
  commit: (next: Rect[]) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
};

/** A closed undo stack over the list of boxes. Every mutation is a commit. */
export default function useRectHistory(): RectHistory {
  const [history, setHistory] = useState<History>(EMPTY_HISTORY);

  const commit = useCallback((next: Rect[]) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: next,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }
      return {
        past: prev.past.slice(0, -1),
        present: prev.past[prev.past.length - 1],
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) {
        return prev;
      }
      const [next, ...rest] = prev.future;
      return { past: [...prev.past, prev.present], present: next, future: rest };
    });
  }, []);

  const reset = useCallback(() => {
    setHistory(EMPTY_HISTORY);
  }, []);

  return {
    rects: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    commit,
    undo,
    redo,
    reset,
  };
}
