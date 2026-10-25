import { describe, expect, it } from "vitest";

import { clampRect, hitTest, normalizeRect } from "@/lib/geometry";

describe("normalizeRect", () => {
  it("keeps a top-left to bottom-right drag as-is", () => {
    expect(normalizeRect(10, 20, 60, 90)).toEqual({ x: 10, y: 20, w: 50, h: 70 });
  });

  it("handles a right-to-left drag", () => {
    expect(normalizeRect(60, 20, 10, 90)).toEqual({ x: 10, y: 20, w: 50, h: 70 });
  });

  it("handles a bottom-to-top drag", () => {
    expect(normalizeRect(10, 90, 60, 20)).toEqual({ x: 10, y: 20, w: 50, h: 70 });
  });

  it("handles a fully inverted drag", () => {
    expect(normalizeRect(60, 90, 10, 20)).toEqual({ x: 10, y: 20, w: 50, h: 70 });
  });

  it("returns a zero-size rect for a click without movement", () => {
    expect(normalizeRect(5, 5, 5, 5)).toEqual({ x: 5, y: 5, w: 0, h: 0 });
  });

  it("produces a purely vertical or horizontal rect", () => {
    expect(normalizeRect(5, 5, 5, 40)).toEqual({ x: 5, y: 5, w: 0, h: 35 });
    expect(normalizeRect(5, 5, 40, 5)).toEqual({ x: 5, y: 5, w: 35, h: 0 });
  });

  it("supports negative anchors", () => {
    expect(normalizeRect(-10, -20, 10, 20)).toEqual({
      x: -10,
      y: -20,
      w: 20,
      h: 40,
    });
  });

  it("never returns a negative width or height", () => {
    const result = normalizeRect(100, 100, 0, 0);
    expect(result.w).toBeGreaterThanOrEqual(0);
    expect(result.h).toBeGreaterThanOrEqual(0);
  });
});

describe("clampRect", () => {
  it("leaves a rect already inside the bounds untouched", () => {
    expect(clampRect({ x: 10, y: 10, w: 20, h: 20 }, 100, 100)).toEqual({
      x: 10,
      y: 10,
      w: 20,
      h: 20,
    });
  });

  it("trims a rect that overflows the right and bottom edges", () => {
    expect(clampRect({ x: 90, y: 90, w: 40, h: 40 }, 100, 100)).toEqual({
      x: 90,
      y: 90,
      w: 10,
      h: 10,
    });
  });

  it("trims a rect that starts outside the top-left corner", () => {
    expect(clampRect({ x: -20, y: -20, w: 50, h: 50 }, 100, 100)).toEqual({
      x: 0,
      y: 0,
      w: 30,
      h: 30,
    });
  });

  it("collapses a rect entirely outside the bounds", () => {
    expect(clampRect({ x: 200, y: 200, w: 10, h: 10 }, 100, 100)).toEqual({
      x: 100,
      y: 100,
      w: 0,
      h: 0,
    });
  });

  it("clamps a rect spanning the whole image to full size", () => {
    expect(clampRect({ x: -50, y: -50, w: 300, h: 300 }, 100, 100)).toEqual({
      x: 0,
      y: 0,
      w: 100,
      h: 100,
    });
  });

  it("normalizes an inverted rect before clamping", () => {
    expect(clampRect({ x: 60, y: 60, w: -30, h: -30 }, 100, 100)).toEqual({
      x: 30,
      y: 30,
      w: 30,
      h: 30,
    });
  });

  it("returns an empty rect for degenerate image dimensions", () => {
    expect(clampRect({ x: 0, y: 0, w: 10, h: 10 }, 0, 100)).toEqual({
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    });
    expect(clampRect({ x: 0, y: 0, w: 10, h: 10 }, 100, -5)).toEqual({
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    });
  });

  it("treats non-finite coordinates as the origin edge", () => {
    expect(clampRect({ x: Number.NaN, y: 10, w: 20, h: 20 }, 100, 100)).toEqual({
      x: 0,
      y: 10,
      w: 20,
      h: 20,
    });
  });
});

describe("hitTest", () => {
  const rects = [
    { x: 0, y: 0, w: 50, h: 50 },
    { x: 40, y: 40, w: 50, h: 50 },
  ];

  it("returns -1 for an empty list", () => {
    expect(hitTest([], 10, 10)).toBe(-1);
  });

  it("returns -1 when the point misses every rect", () => {
    expect(hitTest(rects, 200, 200)).toBe(-1);
  });

  it("finds the containing rect", () => {
    expect(hitTest(rects, 10, 10)).toBe(0);
  });

  it("returns the topmost rect when rects overlap", () => {
    expect(hitTest(rects, 45, 45)).toBe(1);
  });

  it("treats the left and top edges as inside", () => {
    expect(hitTest(rects, 0, 0)).toBe(0);
  });

  it("treats the right and bottom edges as outside", () => {
    expect(hitTest([{ x: 0, y: 0, w: 50, h: 50 }], 50, 50)).toBe(-1);
    expect(hitTest([{ x: 0, y: 0, w: 50, h: 50 }], 49.9, 49.9)).toBe(0);
  });

  it("ignores zero-size rects", () => {
    expect(hitTest([{ x: 10, y: 10, w: 0, h: 0 }], 10, 10)).toBe(-1);
  });

  it("works with negative coordinates", () => {
    expect(hitTest([{ x: -20, y: -20, w: 10, h: 10 }], -15, -15)).toBe(0);
  });
});
