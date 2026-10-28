"use client";

import DetectStatus from "@/components/DetectStatus";
import TypeFilter from "@/components/TypeFilter";
import {
  IconDownload,
  IconRedo,
  IconScan,
  IconTrash,
  IconUndo,
} from "@/components/Icons";
import type { DetectMessage } from "@/hooks/useAutoDetect";
import type { OcrLangsMode, OcrStage } from "@/lib/ocr";
import type { TypeChip } from "@/lib/detect-types";
import type { FillStyle } from "@/lib/image";

const STYLE_OPTIONS: { value: FillStyle; label: string }[] = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
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

/**
 * Recognition languages. "Chinese + English" is the default: the extra 1.7 MB is
 * paid once and cached, while an unrecognised script costs the user a bill they
 * thought was redacted.
 */
const LANG_OPTIONS: { value: OcrLangsMode; label: string; hint: string }[] = [
  {
    value: "both",
    label: "EN + 中文",
    hint: "Reads English and Simplified Chinese text. Downloads both models on first use.",
  },
  {
    value: "en",
    label: "English",
    hint: "English only, which downloads less data and runs faster.",
  },
  {
    value: "zh",
    label: "中文",
    hint: "Simplified Chinese only. Latin digits and addresses are still read.",
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
  langs: OcrLangsMode;
  onLangsChange: (langs: OcrLangsMode) => void;
  showModeSwitch: boolean;
  canvasMode: CanvasMode;
  onCanvasModeChange: (mode: CanvasMode) => void;
};

const ghostButton =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md px-2 text-body-sm font-medium text-ink transition-hover hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-ink-3 disabled:opacity-60 disabled:hover:bg-transparent";

const iconButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-paper px-3 text-body-sm font-medium text-ink transition-hover hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40";

/** Segmented-control option. The label is the target, so the radio itself can
 * stay visually hidden while its focus ring lands on the visible chip. */
function segmentClass(active: boolean) {
  return `flex min-h-11 cursor-pointer items-center justify-center rounded-sm px-2 text-body-sm font-medium transition-state has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
    active ? "bg-paper text-ink shadow-card" : "text-ink-2 hover:text-ink"
  }`;
}

/**
 * The tool panel. One instance is rendered: on desktop it sits in the right
 * column, on a phone it becomes the contents of the bottom drawer. The download
 * button is desktop-only because the phone gets a persistent action bar.
 */
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
  langs,
  onLangsChange,
  showModeSwitch,
  canvasMode,
  onCanvasModeChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-label font-semibold tracking-wide text-ink-3 uppercase">
          Fill style
        </legend>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-surface-2 p-1">
          {STYLE_OPTIONS.map((option) => (
            <label key={option.value} className={segmentClass(fillStyle === option.value)}>
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
        <p className="text-label leading-relaxed text-ink-3">
          Solid fill replaces the pixels. Pixelate is weaker for small text.
        </p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onAutoDetect}
          disabled={!hasImage || detecting}
          aria-label="Auto-detect sensitive text"
          aria-busy={detecting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-line-strong bg-paper px-3 text-body-sm font-semibold text-ink transition-hover hover:border-accent hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:bg-paper disabled:hover:text-ink"
        >
          <IconScan className="h-4 w-4" />
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
        <p className="text-label leading-relaxed text-ink-3">
          After a scan, tap any text on the image to cover that line — useful for
          anything the patterns miss.
        </p>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-label font-semibold tracking-wide text-ink-3 uppercase">
            Recognition language
          </legend>
          <div className="grid grid-cols-3 gap-1 rounded-md bg-surface-2 p-1">
            {LANG_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={segmentClass(langs === option.value)}
              >
                <input
                  type="radio"
                  name="ocr-langs"
                  value={option.value}
                  checked={langs === option.value}
                  onChange={() => onLangsChange(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="text-label leading-relaxed text-ink-3">
            {LANG_OPTIONS.find((option) => option.value === langs)?.hint}
          </p>
        </fieldset>
      </div>

      <div className="h-px bg-line" />

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo last change"
            className={iconButton}
          >
            <IconUndo className="h-4 w-4" />
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo last undone change"
            className={iconButton}
          >
            <IconRedo className="h-4 w-4" />
            Redo
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {selectedIndex >= 0 ? (
            <button
              type="button"
              onClick={onRemoveSelected}
              aria-label="Remove selected box"
              className={ghostButton}
            >
              <IconTrash className="h-4 w-4" />
              Remove selected
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasRects}
            aria-label="Clear all boxes"
            className={ghostButton}
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
                ? "inline-flex min-h-11 items-center justify-center rounded-md border border-danger bg-danger-soft px-2 text-body-sm font-semibold text-danger transition-hover hover:brightness-95"
                : ghostButton
            }
          >
            {startOverArmed ? "Click again to confirm" : "Start over"}
          </button>
        </div>
      </div>

      {showModeSwitch ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-label font-semibold tracking-wide text-ink-3 uppercase">
            Canvas mode
          </legend>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-surface-2 p-1">
            {MODE_OPTIONS.map((option) => (
              <label key={option.value} className={segmentClass(canvasMode === option.value)}>
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
          <p className="text-label leading-relaxed text-ink-3">
            {MODE_OPTIONS.find((option) => option.value === canvasMode)?.hint}
          </p>
        </fieldset>
      ) : null}

      <div className="hidden flex-col gap-2 lg:flex">
        <button
          type="button"
          onClick={onDownload}
          disabled={!hasImage}
          aria-label="Download redacted PNG"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-body font-semibold text-paper transition-hover hover:bg-redact disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconDownload className="h-5 w-5" />
          Download PNG
        </button>
        <p className="text-label leading-relaxed text-ink-3">
          Rebuilt on a canvas at full resolution, so EXIF is dropped.
        </p>
      </div>
    </div>
  );
}
