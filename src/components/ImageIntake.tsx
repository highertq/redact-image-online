"use client";

import type { DragEvent, RefObject } from "react";

import { IconUpload } from "@/components/Icons";
import { MAX_FILE_BYTES, formatBytes } from "@/lib/image";

type Props = {
  /** Signals whether a drag is hovering, so the dashed border can react. */
  dragging: boolean;
  dragProps: {
    onDragOver: (event: DragEvent<HTMLElement>) => void;
    onDragLeave: (event: DragEvent<HTMLElement>) => void;
    onDrop: (event: DragEvent<HTMLElement>) => void;
  };
  inputRef: RefObject<HTMLInputElement | null>;
};

/**
 * The empty-state drop zone. Pulled out of Redactor to keep that file under the
 * project's 400-line ceiling; it is self-contained and has no editor state.
 *
 * The dashed area itself is a real button, so it is clickable and focusable,
 * while the native file input stays in the DOM but visually hidden. No disabled
 * control is rendered here: in the empty state there is nothing to undo, clear,
 * or download, so showing greyed-out buttons would only add noise.
 */
export default function ImageIntake({
  dragging,
  dragProps,
  inputRef,
}: Props) {
  return (
    <div data-testid="dropzone" {...dragProps} className="flex flex-col gap-4">
      <div
        className={`overflow-hidden rounded-lg border-2 border-dashed transition-state ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line-strong bg-surface"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-4 px-6 py-12 text-center transition-hover hover:bg-surface-2 sm:py-16"
        >
          <span
            aria-hidden="true"
            className={`grid h-14 w-14 place-items-center rounded-full border transition-state ${
              dragging
                ? "border-accent bg-paper text-accent"
                : "border-line bg-paper text-ink"
            }`}
          >
            <IconUpload className="h-6 w-6" />
          </span>
          <span className="text-h3 font-semibold text-ink">
            Drop an image here, or click to choose one
          </span>
          <span className="flex flex-col gap-1 text-body-sm text-ink-2">
            <span>
              PNG, JPEG, or WebP. Up to {formatBytes(MAX_FILE_BYTES)} and 40
              million pixels.
            </span>
            <span className="text-ink-3">
              You can also paste with Ctrl/Cmd+V.
            </span>
          </span>
        </button>
      </div>

      <p className="text-center text-body-sm text-ink-2">
        Your image never leaves this browser tab. Nothing is uploaded.
      </p>

      <ol className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {["Choose an image", "Draw a box", "Download the PNG"].map(
          (step, index) => (
            <li
              key={step}
              className="flex items-center gap-2 text-label text-ink-3"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full border border-line-strong bg-paper text-label font-semibold text-ink-2 tabular-nums">
                {index + 1}
              </span>
              {step}
            </li>
          ),
        )}
      </ol>
    </div>
  );
}
