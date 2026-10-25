"use client";

import { useCallback, useRef, useState } from "react";

import { dedupeBoxes } from "@/lib/dedupe";
import type { Rect } from "@/lib/geometry";
import {
  OcrLoadError,
  recognizeWords,
  type OcrProgress,
  type OcrStage,
} from "@/lib/ocr";
import { wordsToBoxes, type PiiBox } from "@/lib/pii-boxes";

export type DetectMessage =
  | { kind: "success"; text: string }
  | { kind: "error"; text: string };

export type DetectState = {
  running: boolean;
  stage: OcrStage;
  /** 0..1, monotonic within a run. Only meaningful while stage is "reading". */
  progress: number;
  message: DetectMessage | null;
  /** True once the user has launched at least one pass. */
  hasRun: boolean;
  run: (canvas: HTMLCanvasElement | null, existing: readonly Rect[]) => Promise<Rect[]>;
  clear: () => void;
};

const REVIEW_NOTE = "Always review every box before downloading.";

const LOAD_ERROR =
  "Couldn't load the text-recognition data. Check your connection and try again.";
const RECOGNIZE_ERROR = "Text recognition failed. Try again.";

/**
 * Drives the OCR pass and owns every piece of feedback around it: the current
 * stage, a monotonic percentage, the outcome message, and the error flavour.
 *
 * Boxes come back as ordinary rects carrying a `label` and `auto` flag so the
 * editor can style them and the user can still delete them.
 */
export default function useAutoDetect(): DetectState {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<OcrStage>("loading-engine");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<DetectMessage | null>(null);
  const [hasRun, setHasRun] = useState(false);

  // tesseract reports progress per phase and it resets to 0 between them. The
  // history high-water mark keeps the bar from jumping backwards.
  const highestRef = useRef(0);

  const clear = useCallback(() => setMessage(null), []);

  const run = useCallback(
    async (canvas: HTMLCanvasElement | null, existing: readonly Rect[]) => {
      if (!canvas) {
        return [];
      }

      setRunning(true);
      setHasRun(true);
      setStage("loading-engine");
      setProgress(0);
      highestRef.current = 0;
      setMessage(null);

      const onProgress = (update: OcrProgress) => {
        setStage(update.stage);
        if (update.stage !== "reading") {
          return;
        }
        if (update.progress <= highestRef.current) {
          return;
        }
        highestRef.current = update.progress;
        setProgress(update.progress);
      };

      try {
        const words = await recognizeWords(canvas, onProgress);
        const boxes: PiiBox[] = wordsToBoxes(words);
        const rects: Rect[] = boxes.map((box) => ({
          x: box.x,
          y: box.y,
          w: box.w,
          h: box.h,
          label: box.type,
          auto: true,
        }));

        const fresh = dedupeBoxes(existing, rects);

        if (words.length === 0) {
          setMessage({
            kind: "success",
            text: "No text was recognized in this image. You can still draw boxes manually.",
          });
        } else if (fresh.length === 0) {
          // Distinguish "nothing sensitive at all" from "all already covered",
          // otherwise a second click looks identical to a failed first one.
          setMessage({
            kind: "success",
            text:
              rects.length === 0
                ? `Read ${words.length} ${words.length === 1 ? "word" : "words"} but found no sensitive patterns. ${REVIEW_NOTE}`
                : "No new items found.",
          });
        } else {
          setMessage({
            kind: "success",
            text: `Found ${fresh.length} new ${
              fresh.length === 1 ? "item" : "items"
            }. ${REVIEW_NOTE}`,
          });
        }

        return fresh;
      } catch (error) {
        // The two failure modes need different advice: one is about the network,
        // the other about the image. Neither may be silently swallowed into a
        // "nothing found" success.
        console.error("Auto-detect failed:", error);
        setMessage({
          kind: "error",
          text: error instanceof OcrLoadError ? LOAD_ERROR : RECOGNIZE_ERROR,
        });
        return [];
      } finally {
        setRunning(false);
      }
    },
    [],
  );

  return { running, stage, progress, message, hasRun, run, clear };
}
