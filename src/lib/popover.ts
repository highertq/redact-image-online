/**
 * Placement maths for the per-box popover.
 *
 * Pure so it can be tested without a DOM: the component measures the anchor and
 * the popover, then this decides where the panel goes.
 */

export type Anchor = { left: number; top: number; width: number; height: number };
export type Size = { width: number; height: number };
export type Viewport = { width: number; height: number };

/** Gap between the box and the panel. */
export const GAP = 10;
/** Minimum distance the panel keeps from the viewport edges. */
export const MARGIN = 12;

function clamp(value: number, min: number, max: number): number {
  // A viewport smaller than the panel would otherwise invert the range.
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Picks a spot for a `panel` next to `anchor` inside `viewport`.
 *
 * Preferred order is below, then above, then whichever side has more room. The
 * panel is always clamped into the viewport, so a box near an edge still shows
 * a fully reachable panel. Horizontal alignment centres on the box.
 */
export function placePopover(
  anchor: Anchor,
  panel: Size,
  viewport: Viewport,
): { left: number; top: number; side: "below" | "above" } {
  const spaceBelow = viewport.height - (anchor.top + anchor.height) - GAP - MARGIN;
  const spaceAbove = anchor.top - GAP - MARGIN;

  const fitsBelow = panel.height <= spaceBelow;
  const fitsAbove = panel.height <= spaceAbove;
  const side: "below" | "above" =
    fitsBelow || (!fitsAbove && spaceBelow >= spaceAbove) ? "below" : "above";

  const desiredTop =
    side === "below" ? anchor.top + anchor.height + GAP : anchor.top - panel.height - GAP;

  const desiredLeft = anchor.left + anchor.width / 2 - panel.width / 2;

  return {
    left: clamp(desiredLeft, MARGIN, viewport.width - panel.width - MARGIN),
    top: clamp(desiredTop, MARGIN, viewport.height - panel.height - MARGIN),
    side,
  };
}
