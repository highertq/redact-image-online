/**
 * Duplicate-box detection for repeated auto-detect passes.
 *
 * Running detection twice on the same image produces identical boxes, and
 * stacking them on top of each other doubles the label count and makes the
 * editor look broken. A new box counts as a duplicate when it overlaps an
 * existing box enough that a second one adds nothing.
 */

export type Box = { x: number; y: number; w: number; h: number };

/** A new box must overlap this share of the smaller box to count as a repeat. */
export const OVERLAP_THRESHOLD = 0.5;

function area(box: Box): number {
  return Math.max(0, box.w) * Math.max(0, box.h);
}

function intersectionArea(a: Box, b: Box): number {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  if (right <= left || bottom <= top) {
    return 0;
  }
  return (right - left) * (bottom - top);
}

/**
 * True when `candidate` duplicates `existing`: the overlap covers at least half
 * of the smaller of the two boxes. Measuring against the *smaller* area is what
 * makes a box fully inside a much larger one count as a duplicate, while a big
 * box merely grazing a small one does not.
 *
 * Degenerate boxes (zero width or height) can never overlap, so they never match.
 */
export function isSameBox(candidate: Box, existing: Box): boolean {
  const smaller = Math.min(area(candidate), area(existing));
  if (smaller <= 0) {
    return false;
  }
  return intersectionArea(candidate, existing) / smaller >= OVERLAP_THRESHOLD;
}

/**
 * Filters `found` down to the boxes that are not already covered by `existing`
 * nor by an earlier entry of `found` itself.
 *
 * The same-batch comparison matters: a single OCR pass occasionally reports two
 * overlapping matches, and letting both through would reintroduce exactly the
 * stacking this function exists to prevent.
 */
export function dedupeBoxes<T extends Box>(
  existing: readonly Box[],
  found: readonly T[],
): T[] {
  const accepted: Box[] = [...existing];
  const result: T[] = [];

  for (const box of found) {
    if (accepted.some((other) => isSameBox(box, other))) {
      continue;
    }
    accepted.push(box);
    result.push(box);
  }

  return result;
}
