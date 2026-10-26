"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { placePopover, type Anchor } from "@/lib/popover";
import { type FillStyle, resolveStyle } from "@/lib/image";
import type { Rect } from "@/lib/geometry";
import { TYPE_LABELS } from "@/lib/detect-types";

const STYLE_OPTIONS: { value: FillStyle; label: string }[] = [
  { value: "black", label: "Solid black" },
  { value: "white", label: "Solid white" },
  { value: "pixelate", label: "Pixelate" },
];

type Props = {
  rect: Rect;
  /** Where the box sits in viewport coordinates. */
  anchor: Anchor;
  /** Toolbar default, used to label the inherited option. */
  defaultStyle: FillStyle;
  onToggleRedact: (skip: boolean) => void;
  onStyleChange: (style: FillStyle | undefined) => void;
  onResetStyle: () => void;
  onDelete: () => void;
  onClose: () => void;
};

/**
 * Editor for a single box. On desktop it is a floating panel anchored to the
 * box, rendered in a fixed layer so the canvas container cannot clip it. On a
 * phone the same markup becomes a bottom sheet: the anchored position is
 * overridden by a media query, because a 280px panel floating over a 390px
 * screen would cover the box it is editing.
 */
export default function BoxPopover({
  rect,
  anchor,
  defaultStyle,
  onToggleRedact,
  onStyleChange,
  onResetStyle,
  onDelete,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(
    null,
  );

  const currentStyle = resolveStyle(rect, defaultStyle);
  const hasOverride = rect.style !== undefined;
  const skipped = rect.skip === true;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const measured = {
      width: panel.offsetWidth,
      height: panel.offsetHeight,
    };
    const next = placePopover(anchor, measured, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setPosition({ left: next.left, top: next.top });
  }, [anchor]);

  // Escape closes, and the panel keeps focus reachable without trapping the
  // user in a modal loop (this is a lightweight editor, not a dialog).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // A scroll or resize invalidates the measured position; closing is cheaper and
  // less confusing than letting the panel drift away from its box.
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [onClose]);

  // Clicking anywhere outside dismisses the panel. Uses pointerdown in the
  // capture phase so it still fires when the target stops propagation, and
  // ignores clicks on the panel itself.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const panel = panelRef.current;
      if (panel && event.target instanceof Node && panel.contains(event.target)) {
        return;
      }
      onClose();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onClose]);

  const typeName = rect.label ? (TYPE_LABELS[rect.label] ?? rect.label) : null;

  return (
    <div
      ref={panelRef}
      role="group"
      aria-label={typeName ? `Edit ${typeName} box` : "Edit hand-drawn box"}
      className="fixed z-50 w-72 max-w-[calc(100vw-24px)] rounded-lg border border-line bg-paper p-4 shadow-pop max-lg:inset-x-0! max-lg:bottom-[calc(3.75rem+env(safe-area-inset-bottom))]! max-lg:top-auto! max-lg:max-h-[80dvh] max-lg:w-auto! max-lg:max-w-none! max-lg:overflow-y-auto max-lg:rounded-b-none max-lg:border-x-0 max-lg:border-b-0 max-lg:pb-safe-2"
      style={
        position
          ? { left: position.left, top: position.top }
          : { left: 0, top: 0, visibility: "hidden" }
      }
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong lg:hidden"
      />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {typeName ? (
            <span className="shrink-0 rounded-sm bg-accent-soft px-1.5 py-0.5 text-label font-medium text-accent">
              {typeName}
            </span>
          ) : (
            <span className="shrink-0 rounded-sm bg-surface-2 px-1.5 py-0.5 text-label font-medium text-ink-2">
              Hand-drawn
            </span>
          )}
          <span className="truncate font-mono text-label text-ink-3 tabular-nums">
            {Math.round(rect.w)} × {Math.round(rect.h)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close box editor"
          className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-sm text-ink-3 transition-hover hover:bg-surface-2 hover:text-ink"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ×
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between border-y border-line py-3">
        <label
          htmlFor="popover-redact"
          className="flex flex-1 cursor-pointer flex-col gap-0.5"
        >
          <span className="text-body-sm font-medium text-ink">
            Redact this area
          </span>
          <span className="text-label text-ink-3">
            {skipped
              ? "Off. The exported PNG keeps these pixels."
              : "On. These pixels are replaced."}
          </span>
        </label>
        <button
          id="popover-redact"
          type="button"
          role="switch"
          aria-checked={!skipped}
          onClick={() => onToggleRedact(!skipped)}
          className={`relative ml-3 h-6 w-11 shrink-0 rounded-full transition-state ${
            skipped ? "bg-line-strong" : "bg-ink"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow-card transition-state ${
              skipped ? "left-0.5" : "left-[22px]"
            }`}
          />
        </button>
      </div>

      <fieldset
        className="mt-3 flex flex-col gap-2"
        disabled={skipped}
        aria-describedby={skipped ? "popover-style-disabled" : undefined}
      >
        <legend className="text-label font-semibold tracking-wide text-ink-3 uppercase">
          Fill style
        </legend>
        <div className={`flex flex-wrap gap-1.5 ${skipped ? "opacity-40" : ""}`}>
          {STYLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-sm border px-3 text-label font-medium transition-hover has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                currentStyle === option.value
                  ? "border-ink bg-ink text-paper"
                  : "border-line-strong bg-paper text-ink hover:bg-surface-2"
              }`}
            >
              <input
                type="radio"
                name="popover-fill-style"
                value={option.value}
                checked={currentStyle === option.value}
                onChange={() => onStyleChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        {skipped ? (
          <p id="popover-style-disabled" className="text-label text-ink-3">
            Turn redaction back on to choose a style.
          </p>
        ) : hasOverride ? (
          <button
            type="button"
            onClick={onResetStyle}
            className="min-h-9 self-start text-label font-medium text-ink-2 underline underline-offset-2 transition-hover hover:text-ink"
          >
            Use toolbar default instead
          </button>
        ) : (
          <p className="text-label text-ink-3">Following the toolbar default.</p>
        )}
      </fieldset>

      <button
        type="button"
        onClick={onDelete}
        className="mt-3 min-h-11 w-full rounded-sm border border-danger bg-danger-soft px-3 text-label font-semibold text-danger transition-hover hover:brightness-95"
      >
        Delete this box
      </button>
    </div>
  );
}
