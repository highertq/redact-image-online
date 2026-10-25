import type { Rect } from "@/lib/geometry";

/**
 * Display names for the PII types that auto-detect can produce. Kept beside the
 * filtering logic so the chips and any other surface agree on wording.
 */
export const TYPE_LABELS: Record<string, string> = {
  email: "Email",
  us_phone: "Phone",
  ssn: "SSN",
  credit_card: "Card number",
  api_key: "API key",
  ipv4: "IP address",
};

/** Canonical chip order: most common first, unknown types after. */
export const TYPE_ORDER = [
  "email",
  "us_phone",
  "ssn",
  "credit_card",
  "api_key",
  "ipv4",
];

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export type TypeChip = {
  type: string;
  label: string;
  count: number;
};

/**
 * Identity for a box, used to tell "already present" from "needs adding back".
 * Coordinates are rounded because a re-created rect may differ in the last
 * float digit without being a different box.
 */
export function rectKey(rect: Rect): string {
  const round = (value: number) => Math.round(value * 100) / 100;
  return [
    round(rect.x),
    round(rect.y),
    round(rect.w),
    round(rect.h),
    rect.label ?? "",
  ].join("|");
}

/**
 * One chip per auto-detected type present in `rects`, in canonical order.
 * Manual boxes carry no `label`, so they never contribute a chip.
 */
export function countByType(rects: readonly Rect[]): TypeChip[] {
  const counts = new Map<string, number>();

  for (const rect of rects) {
    if (!rect.auto || !rect.label) {
      continue;
    }
    counts.set(rect.label, (counts.get(rect.label) ?? 0) + 1);
  }

  const rank = (type: string) => {
    const index = TYPE_ORDER.indexOf(type);
    return index === -1 ? TYPE_ORDER.length : index;
  };

  return [...counts.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
    .map(([type, count]) => ({ type, label: typeLabel(type), count }));
}

/** Adds every type present in `rects` to the enabled list, preserving order. */
export function enableTypes(
  enabled: readonly string[],
  rects: readonly Rect[],
): string[] {
  const next = [...enabled];
  for (const rect of rects) {
    if (rect.label && !next.includes(rect.label)) {
      next.push(rect.label);
    }
  }
  return next;
}

/** Flips one type on or off without mutating the input. */
export function toggleType(
  enabled: readonly string[],
  type: string,
): string[] {
  return enabled.includes(type)
    ? enabled.filter((entry) => entry !== type)
    : [...enabled, type];
}

/** Appends boxes that are not already present, matching on `rectKey`. */
export function mergeUnique(
  existing: readonly Rect[],
  incoming: readonly Rect[],
): Rect[] {
  const seen = new Set(existing.map(rectKey));
  const merged = [...existing];
  for (const rect of incoming) {
    const key = rectKey(rect);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(rect);
  }
  return merged;
}

/**
 * Rebuilds the box list for a new set of enabled types.
 *
 * Two phases, and the order matters:
 * 1. Drop auto boxes whose type is now off. Manual boxes (`auto` falsy) are
 *    never touched — the user drew them by hand and no chip owns them.
 * 2. Add back every known auto box whose type is on and that is not already in
 *    the list. The `knownAuto` pool is why re-checking a type restores the
 *    original boxes instead of losing them.
 *
 * Existing order is preserved; restored boxes append at the end.
 */
export function applyTypeFilter(
  current: readonly Rect[],
  knownAuto: readonly Rect[],
  enabled: readonly string[],
): Rect[] {
  const isOn = (label: string | undefined) =>
    label !== undefined && enabled.includes(label);

  const kept = current.filter((rect) => !rect.auto || isOn(rect.label));
  const present = new Set(kept.map(rectKey));
  const restored = knownAuto.filter(
    (rect) => isOn(rect.label) && !present.has(rectKey(rect)),
  );

  return [...kept, ...restored];
}
