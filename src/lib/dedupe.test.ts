import { describe, expect, it } from "vitest";

import { dedupeBoxes, isSameBox, OVERLAP_THRESHOLD } from "@/lib/dedupe";

const base = { x: 100, y: 100, w: 200, h: 40 };

describe("isSameBox", () => {
  it("treats an identical box as a duplicate", () => {
    expect(isSameBox(base, { ...base })).toBe(true);
  });

  it("treats a fully contained box as a duplicate", () => {
    expect(isSameBox({ x: 120, y: 110, w: 50, h: 20 }, base)).toBe(true);
  });

  it("treats a box that contains the other as a duplicate", () => {
    expect(isSameBox({ x: 0, y: 0, w: 900, h: 900 }, base)).toBe(true);
  });

  it("ignores a box that only grazes the edge", () => {
    // 10 px of a 40 px tall box -> 25% of the smaller area.
    expect(isSameBox({ ...base, y: 130 }, base)).toBe(false);
  });

  it("ignores completely disjoint boxes", () => {
    expect(isSameBox({ x: 700, y: 700, w: 100, h: 20 }, base)).toBe(false);
  });

  it("uses the smaller box as the denominator", () => {
    // A 400x80 box overlapping the 200x40 box by 200x40 = 8000.
    // Against the smaller area (8000) that is 100%, so it is a duplicate.
    expect(isSameBox({ x: 100, y: 100, w: 400, h: 80 }, base)).toBe(true);
  });

  it("respects the threshold boundary", () => {
    // Shift down so only half the height overlaps: exactly 50%.
    const half = { ...base, y: base.y + base.h / 2 };
    expect(isSameBox(half, base)).toBe(true);
    expect(OVERLAP_THRESHOLD).toBe(0.5);

    // Just under half.
    const under = { ...base, y: base.y + base.h / 2 + 1 };
    expect(isSameBox(under, base)).toBe(false);
  });

  it("never matches degenerate boxes", () => {
    expect(isSameBox({ ...base, h: 0 }, base)).toBe(false);
    expect(isSameBox(base, { x: 0, y: 0, w: 0, h: 0 })).toBe(false);
  });
});

describe("dedupeBoxes", () => {
  it("drops a second identical detection", () => {
    const result = dedupeBoxes([base], [{ ...base, label: "email" }]);
    expect(result).toEqual([]);
  });

  it("keeps boxes that do not overlap", () => {
    const other = { x: 100, y: 300, w: 200, h: 40, label: "us_phone" };
    const result = dedupeBoxes([base], [other]);
    expect(result).toEqual([other]);
  });

  it("returns everything when there is nothing to compare against", () => {
    const found = [
      { ...base, label: "email" },
      { x: 700, y: 700, w: 50, h: 20, label: "ssn" },
    ];
    expect(dedupeBoxes([], found)).toEqual(found);
  });

  it("preserves the original order of the surviving boxes", () => {
    const a = { x: 0, y: 0, w: 10, h: 10, label: "a" };
    const b = { x: 500, y: 500, w: 10, h: 10, label: "b" };
    const c = { x: 900, y: 900, w: 10, h: 10, label: "c" };
    expect(dedupeBoxes([], [a, b, c])).toEqual([a, b, c]);
  });

  it("deduplicates within a single batch", () => {
    const first = { ...base, label: "email" };
    const second = { ...base, label: "email" };
    expect(dedupeBoxes([], [first, second])).toEqual([first]);
  });

  it("does not mutate its inputs", () => {
    const existing = [{ ...base }];
    const found = [{ ...base, label: "email" }];
    dedupeBoxes(existing, found);
    expect(existing).toEqual([base]);
    expect(found).toEqual([{ ...base, label: "email" }]);
  });

  it("keeps a partially overlapping box that adds new area", () => {
    // Only 25% of the smaller box overlaps, so it is new information.
    const shifted = { ...base, y: base.y + 30, label: "email" };
    expect(dedupeBoxes([base], [shifted])).toEqual([shifted]);
  });

  it("checks against every already-accepted box, not just the first", () => {
    const existing = [
      { x: 0, y: 0, w: 100, h: 20 },
      { x: 0, y: 100, w: 100, h: 20 },
    ];
    const duplicates = [
      { x: 0, y: 0, w: 100, h: 20, label: "a" },
      { x: 0, y: 100, w: 100, h: 20, label: "b" },
    ];
    expect(dedupeBoxes(existing, duplicates)).toEqual([]);
  });
});
