import type { FillStyle } from "@/lib/image";

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** PII type label when the box came from auto-detection. */
  label?: string;
  /** True when the box was produced by OCR rather than drawn by hand. */
  auto?: boolean;
  /**
   * Per-box fill override. When absent the box follows the toolbar default, so
   * changing that global still affects every box the user never customised.
   */
  style?: FillStyle;
  /**
   * True when the user switched redaction off for this box. The box stays on
   * the canvas as a visual marker but contributes nothing to the export.
   */
  skip?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function toFinite(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/**
 * Builds a rect with a positive width and height from two drag anchors.
 * Works for any drag direction, including right-to-left and bottom-to-top.
 */
export function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Rect {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
  };
}

/**
 * Confines a rect to the image bounds. The rect may be inverted; it is
 * normalized first. A rect fully outside the bounds collapses to zero size at
 * the nearest edge instead of disappearing, so callers can still inspect it.
 */
export function clampRect(rect: Rect, width: number, height: number): Rect {
  if (!(width > 0) || !(height > 0)) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  const bounds = normalizeRect(
    toFinite(rect.x),
    toFinite(rect.y),
    toFinite(rect.x) + toFinite(rect.w),
    toFinite(rect.y) + toFinite(rect.h),
  );
  const left = clamp(bounds.x, 0, width);
  const top = clamp(bounds.y, 0, height);
  const right = clamp(bounds.x + bounds.w, 0, width);
  const bottom = clamp(bounds.y + bounds.h, 0, height);

  return {
    x: left,
    y: top,
    w: Math.max(0, right - left),
    h: Math.max(0, bottom - top),
  };
}

/**
 * Returns the index of the topmost rect containing the point, or -1.
 * Rects are indexed in draw order, so the last one wins when they overlap.
 * Edges are half-open: left/top count as inside, right/bottom do not.
 */
export function hitTest(rects: readonly Rect[], x: number, y: number): number {
  for (let index = rects.length - 1; index >= 0; index -= 1) {
    const rect = rects[index];
    if (
      x >= rect.x &&
      x < rect.x + rect.w &&
      y >= rect.y &&
      y < rect.y + rect.h
    ) {
      return index;
    }
  }
  return -1;
}
