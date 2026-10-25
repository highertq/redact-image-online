"use client";

import type { DragEvent, RefObject } from "react";

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
 * while the native file input stays in the DOM but visually hidden.
 */
export default function ImageIntake({
  dragging,
  dragProps,
  inputRef,
}: Props) {
  return (
    <div
      {...dragProps}
      className={`rounded-lg border-2 border-dashed transition-colors ${
        dragging
          ? "border-neutral-900 bg-neutral-100"
          : "border-neutral-300 bg-neutral-50"
      }`}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-md px-4 py-10 text-center transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      >
        <span className="text-base font-medium text-neutral-900">
          Drop an image here, or click to choose one
        </span>
        <span className="text-sm text-neutral-600">
          PNG, JPEG, or WebP. Up to {formatBytes(MAX_FILE_BYTES)} and 40 million
          pixels.
        </span>
        <span className="text-sm text-neutral-600">
          You can also paste with Ctrl/Cmd+V.
        </span>
      </button>
      <p className="border-t border-neutral-200 px-4 pb-3 pt-3 text-center text-sm leading-relaxed text-neutral-600">
        Your image never leaves this browser tab. Nothing is uploaded.
      </p>
    </div>
  );
}
