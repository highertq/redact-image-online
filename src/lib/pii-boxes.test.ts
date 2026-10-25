import { describe, expect, it } from "vitest";

import { wordsToBoxes, type OcrWord } from "@/lib/pii-boxes";

function word(
  text: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  lineId: number,
): OcrWord {
  return { text, x0, y0, x1, y1, lineId };
}

function types(boxes: { type: string }[]): string[] {
  return boxes.map((box) => box.type);
}

describe("wordsToBoxes", () => {
  it("returns nothing for an empty word list", () => {
    expect(wordsToBoxes([])).toEqual([]);
  });

  it("returns nothing when no word looks sensitive", () => {
    const words = [
      word("hello", 0, 0, 40, 20, 0),
      word("world", 50, 0, 90, 20, 0),
    ];
    expect(wordsToBoxes(words)).toEqual([]);
  });

  it("boxes a single word match with 4 px padding", () => {
    const words = [
      word("contact", 0, 0, 60, 20, 0),
      word("bob@site.io", 70, 0, 160, 20, 0),
    ];
    const boxes = wordsToBoxes(words);
    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toEqual({
      type: "email",
      x: 66,
      y: -4,
      w: 98,
      h: 28,
    });
  });

  it("unions two adjacent words that form one match", () => {
    const words = [
      word("call", 0, 0, 40, 20, 0),
      word("(415)", 50, 0, 100, 20, 0),
      word("555-0132", 110, 0, 190, 20, 0),
    ];
    const boxes = wordsToBoxes(words);
    expect(boxes).toHaveLength(1);
    expect(types(boxes)).toEqual(["us_phone"]);
    expect(boxes[0].x).toBe(46);
    expect(boxes[0].y).toBe(-4);
    expect(boxes[0].w).toBe(148);
    expect(boxes[0].h).toBe(28);
  });

  it("emits one box per line when a match spans two lines", () => {
    const words = [
      word("card", 0, 0, 40, 20, 0),
      word("4111", 50, 0, 90, 20, 0),
      word("1111", 0, 30, 40, 50, 1),
      word("1111", 50, 30, 90, 50, 1),
      word("1111", 100, 30, 140, 50, 1),
    ];
    const boxes = wordsToBoxes(words);
    expect(boxes).toHaveLength(2);
    expect(types(boxes)).toEqual(["credit_card", "credit_card"]);
    expect(boxes[0]).toEqual({
      type: "credit_card",
      x: 46,
      y: -4,
      w: 48,
      h: 28,
    });
    expect(boxes[1]).toEqual({
      type: "credit_card",
      x: -4,
      y: 26,
      w: 148,
      h: 28,
    });
  });

  it("keeps separate matches in separate boxes", () => {
    const words = [
      word("bob@site.io", 0, 0, 90, 20, 0),
      word("10.0.0.1", 100, 0, 160, 20, 0),
    ];
    const boxes = wordsToBoxes(words);
    expect(boxes).toHaveLength(2);
    expect(types(boxes)).toEqual(["email", "ipv4"]);
  });

  it("does not box words that only touch the match boundary", () => {
    const words = [
      word("x", 0, 0, 10, 20, 0),
      word("bob@site.io", 20, 0, 110, 20, 0),
      word("y", 120, 0, 130, 20, 0),
    ];
    const boxes = wordsToBoxes(words);
    expect(boxes).toHaveLength(1);
    expect(boxes[0].x).toBe(16);
    expect(boxes[0].w).toBe(98);
  });

  it("handles a match at the very start and end of the text", () => {
    const words = [
      word("bob@site.io", 0, 0, 90, 20, 0),
      word("then", 100, 0, 140, 20, 0),
      word("10.0.0.1", 150, 0, 210, 20, 0),
    ];
    const boxes = wordsToBoxes(words);
    expect(types(boxes)).toEqual(["email", "ipv4"]);
    expect(boxes[0].x).toBe(-4);
    expect(boxes[1].x).toBe(146);
  });

  it("gives every box a positive width and height", () => {
    const words = [
      word("ssn", 0, 0, 30, 20, 0),
      word("123-45-6789", 40, 0, 150, 20, 0),
    ];
    for (const box of wordsToBoxes(words)) {
      expect(box.w).toBeGreaterThan(0);
      expect(box.h).toBeGreaterThan(0);
    }
  });
});
