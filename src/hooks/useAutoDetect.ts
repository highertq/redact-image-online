"use client";

import { useCallback, useState } from "react";

import type { Rect } from "@/lib/geometry";
import { recognizeWords } from "@/lib/ocr";
import { wordsToBoxes, type PiiBox } from "@/lib/pii-boxes";

export type DetectState = {
  running: boolean;
  progress: number;
  result: string | null;
  run: (canvas: HTMLCanvasElement | null) => Promise<Rect[]>;
  clearResult: () => void;
};

/**
 * Drives the OCR pass. Boxes come back as ordinary rects carrying a `label` and
 * `auto` flag so the editor can style them and the user can still delete them.
 */
export default function useAutoDetect(): DetectState {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const clearResult = useCallback(() => setResult(null), []);

  const run = useCallback(async (canvas: HTMLCanvasElement | null) => {
    if (!canvas) {
      return [];
    }

    setRunning(true);
    setProgress(0);
    setResult(null);

    try {
      const words = await recognizeWords(canvas, setProgress);
      const boxes: PiiBox[] = wordsToBoxes(words);
      const rects: Rect[] = boxes.map((box) => ({
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
        label: box.type,
        auto: true,
      }));
      setResult(
        `Found ${rects.length} ${rects.length === 1 ? "item" : "items"}. Always review every box before downloading.`,
      );
      return rects;
    } catch {
      setResult(
        "Text detection failed. You can still draw boxes manually.",
      );
      return [];
    } finally {
      setRunning(false);
      setProgress(0);
    }
  }, []);

  return { running, progress, result, run, clearResult };
}
