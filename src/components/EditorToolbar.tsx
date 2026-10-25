"use client";

import type { FillStyle } from "@/lib/image";

const STYLE_OPTIONS: { value: FillStyle; label: string }[] = [
  { value: "black", label: "Solid black" },
  { value: "white", label: "Solid white" },
  { value: "pixelate", label: "Pixelate" },
];

type ToolbarProps = {
  fillStyle: FillStyle;
  onFillStyleChange: (style: FillStyle) => void;
  hasImage: boolean;
  hasRects: boolean;
  canUndo: boolean;
  canRedo: boolean;
  selectedIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  onStartOver: () => void;
  onDownload: () => void;
  detecting: boolean;
  detectProgress: number;
  detectResult: string | null;
  onAutoDetect: () => void;
};

const buttonClass =
  "min-h-11 min-w-0 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900";

export default function EditorToolbar({
  fillStyle,
  onFillStyleChange,
  hasImage,
  hasRects,
  canUndo,
  canRedo,
  selectedIndex,
  onUndo,
  onRedo,
  onRemoveSelected,
  onClearAll,
  onStartOver,
  onDownload,
  detecting,
  detectProgress,
  detectResult,
  onAutoDetect,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-900">
          Fill style
        </legend>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                fillStyle === option.value
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <input
                type="radio"
                name="fill-style"
                value={option.value}
                checked={fillStyle === option.value}
                onChange={() => onFillStyleChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-neutral-600">
          Solid fill is the safest option. Pixelate can be less secure for small
          text.
        </p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onAutoDetect}
          disabled={!hasImage || detecting}
          aria-label="Auto-detect sensitive text"
          aria-busy={detecting}
          className="min-h-11 w-full rounded-md border border-neutral-900 bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:w-auto"
        >
          {detecting
            ? `Scanning for text… ${Math.round(detectProgress * 100)}%`
            : "Auto-detect sensitive text"}
        </button>
        {detecting ? (
          <div
            role="progressbar"
            aria-label="Text detection progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(detectProgress * 100)}
            className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-neutral-200"
          >
            <div
              className="h-full rounded-full bg-neutral-900 transition-[width] duration-200"
              style={{ width: `${Math.round(detectProgress * 100)}%` }}
            />
          </div>
        ) : null}
        {detectResult && !detecting ? (
          <p role="status" className="text-sm leading-relaxed text-neutral-700">
            {detectResult}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last change"
          className={buttonClass}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo last undone change"
          className={buttonClass}
        >
          Redo
        </button>
        <button
          type="button"
          onClick={onRemoveSelected}
          disabled={selectedIndex < 0}
          aria-label="Remove selected box"
          className={buttonClass}
        >
          Remove selected
        </button>
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasRects}
          aria-label="Clear all boxes"
          className={buttonClass}
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={onStartOver}
          disabled={!hasImage}
          aria-label="Start over with a different image"
          className={buttonClass}
        >
          Start over
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!hasImage}
          aria-label="Download redacted PNG"
          className="min-h-11 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}
