import { describe, expect, it } from "vitest";

import { GAP, MARGIN, placePopover } from "@/lib/popover";

const panel = { width: 300, height: 200 };
const viewport = { width: 1200, height: 800 };

function anchorAt(top: number, left = 400, height = 40, width = 200) {
  return { left, top, width, height };
}

describe("placePopover", () => {
  it("places the panel below the box when there is room", () => {
    const result = placePopover(anchorAt(200), panel, viewport);
    expect(result.side).toBe("below");
    expect(result.top).toBe(200 + 40 + GAP);
  });

  it("centres the panel on the box", () => {
    const result = placePopover(anchorAt(200), panel, viewport);
    expect(result.left).toBe(400 + 200 / 2 - 300 / 2);
  });

  it("flips above when the box sits near the bottom", () => {
    const result = placePopover(anchorAt(740), panel, viewport);
    expect(result.side).toBe("above");
    expect(result.top).toBe(740 - 200 - GAP);
  });

  it("keeps the panel inside the left edge", () => {
    const result = placePopover(anchorAt(200, 0, 40, 40), panel, viewport);
    expect(result.left).toBe(MARGIN);
  });

  it("keeps the panel inside the right edge", () => {
    const result = placePopover(anchorAt(200, 1150, 40, 40), panel, viewport);
    expect(result.left).toBe(viewport.width - panel.width - MARGIN);
  });

  it("clamps vertically when neither side has enough room", () => {
    const tall = { width: 300, height: 700 };
    const result = placePopover(anchorAt(400), tall, viewport);
    expect(result.top).toBeGreaterThanOrEqual(MARGIN);
  });

  it("still returns a usable position in a viewport smaller than the panel", () => {
    const tiny = { width: 120, height: 90 };
    const result = placePopover(anchorAt(10), panel, tiny);
    expect(result.left).toBe(MARGIN);
    expect(result.top).toBe(MARGIN);
  });

  it("prefers below when the box sits above the vertical middle", () => {
    const result = placePopover(anchorAt(100), { width: 300, height: 600 }, viewport);
    expect(result.side).toBe("below");
  });
});
