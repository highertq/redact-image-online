import { describe, expect, it } from "vitest";

import { labelTag, paint } from "@/lib/canvas-paint";
import type { Rect } from "@/lib/geometry";

type Call = string;

/**
 * A CanvasRenderingContext2D stand-in that records what the painter did, method
 * calls and property writes alike — the outline width and the label font are set
 * as properties, so a recorder that only watched calls would miss the two things
 * most likely to break when the scale maths changes.
 */
const PROPERTIES = ["fillStyle", "strokeStyle", "lineWidth", "font", "textBaseline"];

function fakeCtx() {
  const calls: Call[] = [];
  const store: Record<string, unknown> = {};
  const record = (name: string) => (...args: unknown[]) => {
    calls.push(`${name}(${args.map((a) => String(a)).join(",")})`);
  };
  const target = {
    clearRect: record("clearRect"),
    drawImage: record("drawImage"),
    fillRect: record("fillRect"),
    strokeRect: record("strokeRect"),
    setLineDash: record("setLineDash"),
    measureText: (text: string) => ({ width: text.length * 6 }),
    fillText: record("fillText"),
  };
  const ctx = new Proxy(target as Record<string, unknown>, {
    get(obj, key: string) {
      if (key === "calls") {
        return calls;
      }
      if (PROPERTIES.includes(key)) {
        return store[key];
      }
      return obj[key];
    },
    set(obj, key: string, value) {
      if (PROPERTIES.includes(key)) {
        calls.push(`${key}=${String(value)}`);
        store[key] = value;
        return true;
      }
      obj[key] = value;
      return true;
    },
  });
  return ctx as unknown as CanvasRenderingContext2D & { calls: Call[] };
}

const bitmap = { height: 100, width: 200 } as ImageBitmap;

function paintInto(overrides: Partial<Parameters<typeof paint>[0]>) {
  const ctx = fakeCtx();
  paint({
    ctx,
    bitmap,
    canvasWidth: 200,
    canvasHeight: 100,
    imageWidth: 200,
    rects: [],
    ghost: null,
    selectedIndex: -1,
    ...overrides,
  });
  return ctx.calls;
}

describe("labelTag", () => {
  it("translates a known type into words a person can read", () => {
    expect(labelTag({ x: 0, y: 0, w: 1, h: 1, label: "credit_card" })).toBe(
      "Card number",
    );
    expect(labelTag({ x: 0, y: 0, w: 1, h: 1, label: "labelled" })).toBe(
      "Labelled field",
    );
  });

  it("falls back to the raw key for an unknown type rather than hiding it", () => {
    expect(labelTag({ x: 0, y: 0, w: 1, h: 1, label: "face" })).toBe("face");
  });

  it("returns null for a hand-drawn box", () => {
    expect(labelTag({ x: 0, y: 0, w: 1, h: 1 })).toBeNull();
  });
});

describe("paint", () => {
  it("paints the picture before anything else", () => {
    const calls = paintInto({});
    expect(calls[0]).toBe("clearRect(0,0,200,100)");
    expect(calls[1]).toMatch(/^drawImage/);
  });

  it("fills and outlines a normal box", () => {
    const rects: Rect[] = [{ x: 10, y: 20, w: 30, h: 40 }];
    const calls = paintInto({ rects });
    expect(calls).toContain("fillRect(10,20,30,40)");
    expect(calls).toContain("strokeRect(10,20,30,40)");
  });

  it("paints nothing for an empty rectangle", () => {
    const rects: Rect[] = [{ x: 0, y: 0, w: 0, h: 12 }];
    expect(paintInto({ rects })).toEqual([
      "clearRect(0,0,200,100)",
      expect.stringMatching(/^drawImage/),
    ]);
  });

  it("leaves a skipped box unfilled and grey, so the canvas matches the export", () => {
    const rects: Rect[] = [{ x: 1, y: 1, w: 10, h: 10, skip: true, label: "email" }];
    const calls = paintInto({ rects });
    expect(calls).not.toContain("fillRect(1,1,10,10)");
    expect(calls).toContain("strokeStyle=rgba(115, 115, 115, 0.9)");
  });

  it("draws the selected box with a solid outline", () => {
    const rects: Rect[] = [
      { x: 0, y: 0, w: 10, h: 10 },
      { x: 5, y: 5, w: 10, h: 10 },
    ];
    const calls = paintInto({ rects, selectedIndex: 1 });
    // The second box's dash call must be an empty array; the first is dashed.
    const dashes = calls.filter((c) => c.startsWith("setLineDash("));
    expect(dashes[0]).not.toBe("setLineDash()");
    expect(dashes[2]).toBe("setLineDash()");
  });

  it("never tags the ghost rectangle", () => {
    const calls = paintInto({
      rects: [],
      ghost: { x: 0, y: 0, w: 50, h: 20, label: "email" },
    });
    expect(calls.some((c) => c.startsWith("fillText("))).toBe(false);
  });

  it("tags a detected box with readable words, not the internal key", () => {
    const rects: Rect[] = [{ x: 4, y: 40, w: 60, h: 12, label: "cn_id" }];
    const calls = paintInto({ rects });
    const text = calls.find((c) => c.startsWith("fillText("));
    expect(text).toBeDefined();
    expect(text).toContain("ID card (CN)");
    expect(text).not.toContain("cn_id");
  });

  it("scales line width and label font by the canvas factor", () => {
    // The overlay is drawn in image-space pixels. On a canvas showing the image
    // at a quarter width, everything must be four times larger in those pixels to
    // look identical on screen; hard-coding either value breaks one of the two.
    const rects: Rect[] = [{ x: 0, y: 60, w: 40, h: 10, label: "email" }];
    const full = paintInto({ canvasWidth: 200, rects });
    const small = paintInto({ canvasWidth: 50, imageWidth: 200, rects });

    expect(full).toContain("lineWidth=2");
    expect(small).toContain("lineWidth=8");
    expect(small.some((c) => c === "font=48px ui-sans-serif, system-ui, sans-serif")).toBe(
      true,
    );
    expect(full.some((c) => c === "font=12px ui-sans-serif, system-ui, sans-serif")).toBe(
      true,
    );
  });
});
