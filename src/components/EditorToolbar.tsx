"use client";

import DetectStatus from "@/components/DetectStatus";
import TypeFilter from "@/components/TypeFilter";
import type { DetectMessage } from "@/hooks/useAutoDetect";
import type { OcrStage } from "@/lib/ocr";
import type { TypeChip } from "@/lib/detect-types";
import type { FillStyle } from "@/lib/image";

const STYLE_OPTIONS: { value: FillStyle; label: string }[] = [
  { value: "black", label: "Solid black" },
  { value: "white", label: "Solid white" },
  { value: "pixelate", label: "Pixelate" },
];

export type CanvasMode = "draw" | "scroll";

const MODE_OPTIONS: { value: CanvasMode; label: string; hint: string }[] = [
  { value: "draw", label: "Draw", hint: "Drag on the image to draw boxes." },
  {
    value: "scroll",
    label: "Scroll",
    hint: "The page scrolls normally. Switch to Draw to add boxes.",
  },
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
  startOverArmed: boolean;
  onDownload: () => void;
  detecting: boolean;
  detectStage: OcrStage;
  detectProgress: number;
  detectMessage: DetectMessage | null;
  detectHasRun: boolean;
  onAutoDetect: () => void;
  typeChips: TypeChip[];
  enabledTypes: readonly string[];
  onToggleType: (type: string) => void;
  showModeSwitch: boolean;
  canvasMode: CanvasMode;
  onCanvasModeChange: (mode: CanvasMode) => void;
};

const buttonClass =
  "min-h-11 min-w-0 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900";

const segmentedActive =
  "border-neutral-900 bg-neutral-900 text-white";
const segmentedIdle =
  "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100";

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
  startOverArmed,
  onDownload,
  detecting,
  detectStage,
  detectProgress,
  detectMessage,
  detectHasRun,
  onAutoDetect,
  typeChips,
  enabledTypes,
  onToggleType,
  showModeSwitch,
  canvasMode,
  onCanvasModeChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      {showModeSwitch ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-neutral-900">
            Canvas mode
          </legend>
          <div className="flex gap-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-900 ${
                  canvasMode === option.value ? segmentedActive : segmentedIdle
                }`}
              >
                <input
                  type="radio"
                  name="canvas-mode"
                  value={option.value}
                  checked={canvasMode === option.value}
                  onChange={() => onCanvasModeChange(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-neutral-600">
            {MODE_OPTIONS.find((option) => option.value === canvasMode)?.hint}
          </p>
        </fieldset>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-900">
          Fill style
        </legend>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-900 ${
                fillStyle === option.value ? segmentedActive : segmentedIdle
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
          {detecting ? "Scanning for text…" : "Auto-detect sensitive text"}
        </button>
        <DetectStatus
          running={detecting}
          stage={detectStage}
          progress={detectProgress}
          message={detectMessage}
          hasRun={detectHasRun}
          onRetry={onAutoDetect}
        />
        <TypeFilter
          chips={typeChips}
          enabled={enabledTypes}
          onToggle={onToggleType}
        />
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
          aria-label={
            startOverArmed
              ? "Confirm starting over, discarding this image and all boxes"
              : "Start over with a different image"
          }
          className={
            startOverArmed
              ? "min-h-11 min-w-0 rounded-md border border-red-700 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
              : buttonClass
          }
        >
          {startOverArmed ? "Click again to confirm" : "Start over"}
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
