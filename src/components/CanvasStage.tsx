"use client";

import type { DragEvent, RefObject } from "react";

import { IconClose } from "@/components/Icons";
import { PRIVACY_NOTE } from "@/components/privacy-note";
import type { LoadedImage } from "@/hooks/useImageLoader";

export type FitMode = "fit" | "actual";

type Props = {
  image: LoadedImage;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  handlers: {
    onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  };
  interactive: boolean;
  dragging: boolean;
  dragProps: {
    onDragOver: (event: DragEvent<HTMLElement>) => void;
    onDragLeave: (event: DragEvent<HTMLElement>) => void;
    onDrop: (event: DragEvent<HTMLElement>) => void;
  };
  /** On a phone the stage takes over the viewport until it is collapsed. */
  expanded: boolean;
  onToggleExpanded: () => void;
  fit: FitMode;
  onFitChange: (fit: FitMode) => void;
};

function FitToggle({
  fit,
  onFitChange,
}: {
  fit: FitMode;
  onFitChange: (fit: FitMode) => void;
}) {
  const options: { value: FitMode; label: string; title: string }[] = [
    { value: "fit", label: "Fit", title: "Scale the image to the available width" },
    { value: "actual", label: "100%", title: "Show the image at its original pixels" },
  ];
  return (
    <div
      role="group"
      aria-label="Image size"
      className="flex shrink-0 items-center gap-0.5 rounded-sm border border-line bg-surface p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onFitChange(option.value)}
          aria-pressed={fit === option.value}
          title={option.title}
          className={`min-h-8 rounded-sm px-2 text-label font-medium tabular-nums transition-hover ${
            fit === option.value
              ? "bg-paper text-ink shadow-card"
              : "text-ink-3 hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The canvas plus its chrome. On a phone it becomes a full-height stage between
 * the site header and the persistent action bar, and the image sits in a
 * scroll container so a tall screenshot can be panned. On desktop it is a
 * normal block that also scrolls when "100%" is selected.
 */
export default function CanvasStage({
  image,
  canvasRef,
  handlers,
  interactive,
  dragging,
  dragProps,
  expanded,
  onToggleExpanded,
  fit,
  onFitChange,
}: Props) {
  return (
    <div
      className={
        expanded
          ? "fixed inset-x-0 top-16 bottom-0 z-30 flex flex-col bg-paper pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:static lg:z-auto lg:bg-transparent lg:pb-0"
          : "flex flex-col"
      }
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2 lg:border-0 lg:px-0 lg:pb-2 lg:pt-0">
        <p className="min-w-0 flex-1 truncate text-body-sm text-ink-2">
          <span className="font-medium text-ink">{image.name}</span>
          <span className="text-ink-3">
            {" "}
            · {image.width} × {image.height} px
          </span>
        </p>
        <FitToggle fit={fit} onFitChange={onFitChange} />
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-label={expanded ? "Shrink the editor back into the page" : "Expand the editor to full screen"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-line bg-surface text-ink-2 transition-hover hover:text-ink lg:hidden"
        >
          {expanded ? (
            <IconClose className="h-4 w-4" />
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
            </svg>
          )}
        </button>
      </div>

      {expanded ? (
        <p className="border-b border-line bg-surface px-4 py-2 text-label leading-snug text-ink-2 lg:hidden">
          {PRIVACY_NOTE}
        </p>
      ) : null}

      <p className="hidden px-1 pb-1 text-label text-ink-3 lg:block">
        {interactive
          ? "Drag on the image to draw a box."
          : "Scroll mode: the image does not respond to drags."}
      </p>

      <div
        {...dragProps}
        className={`flex min-h-0 flex-1 overflow-auto overscroll-contain border bg-surface transition-state lg:max-h-[calc(100dvh-13rem)] lg:flex-none lg:rounded-lg ${
          expanded ? "max-lg:flex-1" : "max-lg:max-h-[62dvh] max-lg:flex-none max-lg:rounded-lg"
        } ${dragging ? "border-accent" : "border-line"}`}
      >
        <canvas
          ref={canvasRef}
          width={image.width}
          height={image.height}
          role="img"
          aria-label={`Image being redacted, ${image.width} by ${image.height} pixels`}
          className={`m-auto block h-auto max-w-none ring-1 ring-line ${
            fit === "fit" ? "w-full" : ""
          } ${interactive ? "cursor-crosshair" : "cursor-default"}`}
          style={{
            // "100%" is the only way to judge whether a box really covers a
            // character in a 900px-wide screenshot on a 390px screen.
            width: fit === "actual" ? image.width : undefined,
            // Draw mode swallows touch gestures so a drag draws instead of
            // scrolling. Scroll mode hands panning back to the browser, which
            // is the only way to reach the rest of a tall screenshot.
            touchAction: interactive ? "none" : "pan-y pinch-zoom",
          }}
          {...handlers}
        />
      </div>

      <p className="hidden px-1 pt-2 text-label leading-relaxed text-ink-3 lg:block">
        {PRIVACY_NOTE}
      </p>
    </div>
  );
}
