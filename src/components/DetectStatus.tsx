"use client";

import type { DetectMessage } from "@/hooks/useAutoDetect";
import type { OcrStage } from "@/lib/ocr";

const STAGE_LABEL: Record<OcrStage, string> = {
  "loading-engine": "Loading recognition engine…",
  "loading-language": "Loading language data…",
  reading: "Reading text…",
};

const FIRST_RUN_NOTE =
  "The first run downloads text-recognition data (several MB).";

type Props = {
  running: boolean;
  stage: OcrStage;
  progress: number;
  message: DetectMessage | null;
  hasRun: boolean;
  onRetry: () => void;
};

/**
 * Everything the user sees around an auto-detect pass: stage text, a percentage
 * that only belongs to the reading phase, the outcome message, and a retry
 * affordance when something failed.
 */
export default function DetectStatus({
  running,
  stage,
  progress,
  message,
  hasRun,
  onRetry,
}: Props) {
  const showPercent = running && stage === "reading";
  const percent = Math.round(progress * 100);
  // Shown before the first run and while the assets are still downloading. Once
  // recognition is actually running the note has served its purpose.
  const showFirstRunNote = !hasRun || (running && stage !== "reading");

  return (
    <div className="flex flex-col gap-2">
      {showFirstRunNote ? (
        <p className="text-xs leading-relaxed text-neutral-600">{FIRST_RUN_NOTE}</p>
      ) : null}

      {running ? (
        <div className="flex flex-col gap-2">
          <p role="status" className="text-sm font-medium text-neutral-900">
            {STAGE_LABEL[stage]}
          </p>
          {showPercent ? (
            <div
              role="progressbar"
              aria-label="Text detection progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-neutral-200"
            >
              <div
                className="h-full rounded-full bg-neutral-900 transition-[width] duration-200"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {message && !running ? (
        message.kind === "error" ? (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2"
          >
            <p className="text-sm font-medium leading-relaxed text-red-900">
              {message.text}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 self-start rounded-md border border-red-700 bg-white px-3 py-2 text-sm font-semibold text-red-900 transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <p role="status" className="text-sm leading-relaxed text-neutral-700">
            {message.text}
          </p>
        )
      ) : null}
    </div>
  );
}
