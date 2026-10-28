import { describe, expect, it } from "vitest";

import {
  groupLines,
  lineAtPoint,
  toRawRange,
  uncoveredBox,
  wordInRect,
} from "@/lib/text-lines";
import type { OcrWord } from "@/lib/pii-boxes";

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

describe("groupLines", () => {
  it("groups words by line id and records character spans", () => {
    const lines = groupLines([
      word("hello", 0, 0, 40, 20, 0),
      word("world", 50, 0, 90, 20, 0),
      word("next", 0, 30, 30, 50, 1),
    ]);
    expect(lines).toHaveLength(2);
    expect(lines[0].text).toBe("hello world");
    expect(lines[0].spans.map((s) => [s.start, s.end])).toEqual([
      [0, 5],
      [6, 11],
    ]);
    expect(lines[1].text).toBe("next");
  });

  it("sorts words inside a line by horizontal position", () => {
    // The engine can emit a word out of order; the assembled text has to read
    // left to right or a label ends up after the value it labels.
    const lines = groupLines([
      word("415-555-0132", 100, 0, 200, 20, 0),
      word("phone", 0, 0, 90, 20, 0),
    ]);
    expect(lines[0].text).toBe("phone 415-555-0132");
  });

  it("computes the union box of the line", () => {
    const lines = groupLines([
      word("a", 10, 5, 20, 25, 0),
      word("b", 30, 8, 60, 30, 0),
    ]);
    expect(lines[0]).toMatchObject({ x: 10, y: 5, w: 50, h: 25 });
  });

  it("returns nothing for an empty word list", () => {
    expect(groupLines([])).toEqual([]);
  });
});

describe("groupLines with Chinese text", () => {
  // This is the case that made a Chinese bill unredactable: the engine reports
  // 证件号 as three separate "words", and no field-name rule can match a string
  // with spaces inside it.
  const cjk = groupLines([
    word("证", 0, 0, 20, 20, 0),
    word("件", 25, 0, 45, 20, 0),
    word("号", 50, 0, 70, 20, 0),
    word("330281199807154323", 80, 0, 260, 20, 0),
  ])[0];

  it("removes the spaces between Han characters", () => {
    expect(cjk.text).toBe("证 件 号 330281199807154323");
    expect(cjk.compact).toBe("证件号 330281199807154323");
  });

  it("keeps the boundary between Han text and a number", () => {
    // Dropping this one would glue the label to the digits and turn the ID into
    // a 20-character alphanumeric run that matches nothing.
    expect(cjk.compact).toContain("号 3302");
  });

  it("maps a compact range back onto the raw offsets", () => {
    // compact "证件号 330281199807154323": index 3 is the surviving space, raw
    // index 5 is the same space before the digits start.
    expect(toRawRange(cjk, 3, 17)).toEqual([5, 19]);
    expect(cjk.text.slice(...toRawRange(cjk, 4, 22))).toBe("330281199807154323");
  });

  it("maps a range ending at the line end to the end of the raw line", () => {
    const [start, end] = toRawRange(cjk, 3, cjk.compact.length);
    expect(end).toBe(cjk.text.length);
    expect(cjk.text.slice(start, end).trim()).toBe("330281199807154323");
  });
});

describe("groupLines with other tightly-set scripts", () => {
  it("joins Japanese kana and kanji the same way as Han", () => {
    const line = groupLines([
      word("電", 0, 0, 20, 20, 0),
      word("話", 25, 0, 45, 20, 0),
      word("番", 50, 0, 70, 20, 0),
      word("号", 75, 0, 95, 20, 0),
      word("0312345678", 100, 0, 200, 20, 0),
    ])[0];
    expect(line.compact).toBe("電話番号 0312345678");
  });

  it("joins Hangul syllables", () => {
    const line = groupLines([
      word("주", 0, 0, 20, 20, 0),
      word("소", 25, 0, 45, 20, 0),
      word("지", 50, 0, 70, 20, 0),
      word("번", 75, 0, 95, 20, 0),
    ])[0];
    expect(line.compact).toBe("주소지번");
  });

  it("leaves spaced scripts alone", () => {
    // Cyrillic and Latin words are separated by real spaces. Compacting them
    // would produce "Телефон4155550132" and break every rule instead.
    const line = groupLines([
      word("Телефон", 0, 0, 70, 20, 0),
      word("+79161234567", 80, 0, 200, 20, 0),
    ])[0];
    expect(line.compact).toBe("Телефон +79161234567");
  });
});

describe("groupLines digit normalisation", () => {
  it("rewrites Arabic-Indic digits as ASCII so number rules can fire", () => {
    // One character in, one character out: offsets still line up with the words.
    const line = groupLines([
      word("الرقم", 0, 0, 50, 20, 0),
      word("١٣٨٠٠١٣٨٠٠٠", 60, 0, 160, 20, 0),
    ])[0];
    expect(line.compact).toBe("الرقم 13800138000");
    expect(line.compactMap.length).toBe(line.compact.length);
  });

  it("rewrites Persian, Devanagari and fullwidth digits", () => {
    expect(groupLines([word("۰۱۲۳۴۵۶۷۸۹", 0, 0, 90, 20, 0)])[0].compact).toBe("0123456789");
    expect(groupLines([word("०१२३४", 0, 0, 50, 20, 0)])[0].compact).toBe("01234");
    expect(groupLines([word("８８５０", 0, 0, 50, 20, 0)])[0].compact).toBe("8850");
  });

  it("does not touch Thai baht or other currency characters", () => {
    expect(groupLines([word("฿1,250.00", 0, 0, 90, 20, 0)])[0].compact).toBe("฿1,250.00");
  });
});

describe("lineAtPoint", () => {
  const lines = groupLines([
    word("13800138000", 100, 40, 240, 62, 0),
    word("total", 100, 100, 160, 122, 1),
  ]);

  it("finds the line a point lands on", () => {
    expect(lineAtPoint(lines, 120, 50)?.text).toBe("13800138000");
    expect(lineAtPoint(lines, 120, 110)?.text).toBe("total");
  });

  it("forgives a tap a few pixels above or below the glyphs", () => {
    // OCR boxes are tight against the text. A thumb tap 10 px above the line is
    // still aimed at that line, and silently doing nothing looks like a bug.
    expect(lineAtPoint(lines, 120, 32)?.text).toBe("13800138000");
    expect(lineAtPoint(lines, 120, 70)?.text).toBe("13800138000");
  });

  it("returns null between lines and off the text column", () => {
    expect(lineAtPoint(lines, 120, 85)).toBeNull();
    expect(lineAtPoint(lines, 400, 50)).toBeNull();
  });

  it("chooses the tighter of two overlapping lines", () => {
    const stacked = groupLines([
      word("short", 0, 0, 50, 20, 0),
      word("wide row", 0, 2, 400, 60, 1),
    ]);
    expect(lineAtPoint(stacked, 20, 10)?.text).toBe("short");
  });
});

describe("uncoveredBox", () => {
  const line = groupLines([
    word("bob@site.io", 100, 40, 200, 62, 0),
    word("10.0.0.1", 210, 40, 280, 62, 0),
  ])[0];

  it("pads the union of the remaining words", () => {
    const box = uncoveredBox(line, () => false);
    expect(box).toEqual({ x: 96, y: 36, w: 188, h: 30 });
  });

  it("excludes words already under a box", () => {
    const box = uncoveredBox(line, (w) => wordInRect(w, { x: 100, y: 40, w: 100, h: 22 }));
    expect(box).toEqual({ x: 206, y: 36, w: 78, h: 30 });
  });

  it("returns null when the line is fully covered", () => {
    expect(uncoveredBox(line, () => true)).toBeNull();
  });
});
