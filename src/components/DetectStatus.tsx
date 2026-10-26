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
        <p className="text-label leading-relaxed text-ink-3">{FIRST_RUN_NOTE}</p>
      ) : null}

      {running ? (
        <div className="flex flex-col gap-2">
          <p role="status" className="text-body-sm font-medium text-ink">
            {STAGE_LABEL[stage]}
          </p>
          {showPercent ? (
            <div
              role="progressbar"
              aria-label="Text detection progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="h-1.5 w-full overflow-hidden rounded-full bg-line"
            >
              <div
                className="h-full rounded-full bg-accent transition-state"
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
            className="flex flex-col gap-2 rounded-md border border-danger bg-danger-soft px-3 py-2"
          >
            <p className="text-body-sm font-medium leading-relaxed text-danger">
              {message.text}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-11 self-start items-center rounded-md border border-danger bg-paper px-3 text-body-sm font-semibold text-danger transition-hover hover:bg-danger-soft"
            >
              Retry
            </button>
          </div>
        ) : (
          <p role="status" className="text-body-sm leading-relaxed text-ink-2">
            {message.text}
          </p>
        )
      ) : null}
    </div>
  );
}
