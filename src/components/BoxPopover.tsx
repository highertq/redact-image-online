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
 * Floating editor for a single box. Rendered in a fixed layer so it is not
 * clipped by the canvas container's overflow, and positioned from the measured
 * box rect rather than from the pointer.
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
      aria-label={
        typeName ? `Edit ${typeName} box` : "Edit hand-drawn box"
      }
      className="fixed z-50 w-72 max-w-[calc(100vw-24px)] rounded-lg border border-neutral-300 bg-white p-3 shadow-lg"
      style={
        position
          ? { left: position.left, top: position.top }
          : { left: 0, top: 0, visibility: "hidden" }
      }
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {typeName ? (
            <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-800">
              {typeName}
            </span>
          ) : (
            <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-700">
              Hand-drawn
            </span>
          )}
          <span className="truncate text-xs text-neutral-500 tabular-nums">
            {Math.round(rect.w)} × {Math.round(rect.h)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close box editor"
          className="-mr-1 -mt-1 shrink-0 rounded p-1 text-lg leading-none text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-between border-y border-neutral-200 py-2">
        <label
          htmlFor="popover-redact"
          className="flex flex-1 cursor-pointer flex-col gap-0.5"
        >
          <span className="text-sm font-medium text-neutral-900">
            Redact this area
          </span>
          <span className="text-xs text-neutral-500">
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
          className={`relative ml-3 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${
            skipped ? "bg-neutral-300" : "bg-neutral-900"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
              skipped ? "left-0.5" : "left-[22px]"
            }`}
          />
        </button>
      </div>

      <fieldset
        className="mt-3 flex flex-col gap-1.5"
        disabled={skipped}
        aria-describedby={skipped ? "popover-style-disabled" : undefined}
      >
        <legend className="text-xs font-medium text-neutral-600">Fill style</legend>
        <div className={`flex flex-wrap gap-1.5 ${skipped ? "opacity-40" : ""}`}>
          {STYLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`min-h-9 cursor-pointer rounded border px-2.5 py-1.5 text-xs font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-900 ${
                currentStyle === option.value
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
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
          <p id="popover-style-disabled" className="text-xs text-neutral-500">
            Turn redaction back on to choose a style.
          </p>
        ) : hasOverride ? (
          <button
            type="button"
            onClick={onResetStyle}
            className="min-h-8 self-start text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            Use toolbar default instead
          </button>
        ) : (
          <p className="text-xs text-neutral-500">Following the toolbar default.</p>
        )}
      </fieldset>

      <button
        type="button"
        onClick={onDelete}
        className="mt-3 min-h-9 w-full rounded border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-900 transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        Delete this box
      </button>
    </div>
  );
}
