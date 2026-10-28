import type { Rect } from "@/lib/geometry";
import type { OcrWord } from "@/lib/pii-boxes";

/**
 * One recognised line of text: the words that form it, the string they join
 * into, and the rectangle that covers them in image pixels.
 *
 * Everything downstream works line by line. Pattern rules get a line that is
 * actually a line (so a number at the end of one row cannot fuse with digits at
 * the start of the next), and a tap on the canvas can be answered with "the line
 * you touched" in any language.
 */
export type TextLine = {
  /** The OCR line index, shared by every word on this line. */
  lineId: number;
  text: string;
  /**
   * `text` with the engine's invented spaces between Han characters removed.
   *
   * tesseract reports Chinese as one "word" per character or per small cluster,
   * so a line that reads 证件号 in the image arrives as "证 件 号". Every rule
   * that looks for a field name has to run against this compact form or it never
   * matches, which is the difference between redacting a Chinese bill and
   * silently missing it.
   */
  compact: string;
  /** compact index → index in `text`, so a match can be mapped back to words. */
  compactMap: number[];
  /** Character span of each word inside `text`, in the same order as `words`. */
  spans: { start: number; end: number; word: OcrWord }[];
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Han ranges that tesseract splits with spaces between characters. */
const CJK = /[㐀-䶿一-鿿豈-﫿]/;

function isCJK(char: string | undefined): boolean {
  return char !== undefined && CJK.test(char);
}

/**
 * Drops a space that sits between two Han characters, keeping every other
 * space: "证 件 号 330281" becomes "证件号 330281". A space between a Han
 * character and a digit is real separation and must survive, or a number glued
 * to its label would read as one long digit run.
 */
function compactLine(text: string): { compact: string; map: number[] } {
  const chars = [...text];
  let compact = "";
  const map: number[] = [];

  chars.forEach((char, index) => {
    if (char === " ") {
      let prev = index - 1;
      while (prev >= 0 && chars[prev] === " ") {
        prev -= 1;
      }
      let next = index + 1;
      while (next < chars.length && chars[next] === " ") {
        next += 1;
      }
      if (isCJK(chars[prev]) && isCJK(chars[next])) {
        return;
      }
    }
    compact += char;
    map.push(index);
  });

  return { compact, map };
}

/**
 * Maps a range found in `compact` back onto `text`, so the caller can still
 * resolve matches against the word boxes.
 */
export function toRawRange(line: TextLine, start: number, end: number): [number, number] {
  const rawStart = line.compactMap[start] ?? line.text.length;
  const rawEnd =
    end >= line.compact.length
      ? line.text.length
      : (line.compactMap[end] ?? line.text.length);
  return [rawStart, Math.max(rawEnd, rawStart)];
}

/**
 * Groups words into lines. Words arrive in reading order, but the engine can
 * still emit a stray word out of place inside a line, so each line is sorted by
 * horizontal position before its text is assembled.
 */
export function groupLines(words: readonly OcrWord[]): TextLine[] {
  const buckets = new Map<number, OcrWord[]>();

  for (const word of words) {
    const bucket = buckets.get(word.lineId);
    if (bucket) {
      bucket.push(word);
    } else {
      buckets.set(word.lineId, [word]);
    }
  }

  const lines: TextLine[] = [];
  for (const [lineId, lineWords] of [...buckets.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    const ordered = [...lineWords].sort((a, b) => a.x0 - b.x0);

    const parts: string[] = [];
    const spans: TextLine["spans"] = [];
    let cursor = 0;

    ordered.forEach((word, index) => {
      if (index > 0) {
        parts.push(" ");
        cursor += 1;
      }
      parts.push(word.text);
      spans.push({ start: cursor, end: cursor + word.text.length, word });
      cursor += word.text.length;
    });

    const joined = parts.join("");
    const { compact, map } = compactLine(joined);

    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;
    for (const word of ordered) {
      left = Math.min(left, word.x0);
      top = Math.min(top, word.y0);
      right = Math.max(right, word.x1);
      bottom = Math.max(bottom, word.y1);
    }

    lines.push({
      lineId,
      text: joined,
      compact,
      compactMap: map,
      spans,
      x: left,
      y: top,
      w: right - left,
      h: bottom - top,
    });
  }

  return lines;
}

/**
 * The line under a point, if any. Hit testing uses a vertically inflated box:
 * a single OCR word box is often only as tall as the glyphs, so a thumb tap that
 * lands a few pixels above the text would otherwise miss.
 */
export function lineAtPoint(
  lines: readonly TextLine[],
  x: number,
  y: number,
  slop = 12,
): TextLine | null {
  let best: TextLine | null = null;
  let bestArea = Number.POSITIVE_INFINITY;

  for (const line of lines) {
    if (
      x < line.x - slop ||
      x > line.x + line.w + slop ||
      y < line.y - slop ||
      y > line.y + line.h + slop
    ) {
      continue;
    }
    // Two lines can overlap after inflation (tight leading). The shorter one is
    // the row the user meant, so the smallest area wins.
    const area = line.w * line.h;
    if (area < bestArea) {
      best = line;
      bestArea = area;
    }
  }

  return best;
}

/**
 * The part of a line to cover when a tap lands on it: everything the user has
 * not covered yet. Returns the union box of the remaining words plus `padding`
 * on every side, or null when the line is already fully redacted — in which
 * case a tap must not stack a second box on top of the first.
 */
export function uncoveredBox(
  line: TextLine,
  isCovered: (word: OcrWord) => boolean,
  padding = 4,
): { x: number; y: number; w: number; h: number } | null {
  const remaining = line.spans.map((s) => s.word).filter((w) => !isCovered(w));
  if (remaining.length === 0) {
    return null;
  }
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const word of remaining) {
    left = Math.min(left, word.x0);
    top = Math.min(top, word.y0);
    right = Math.max(right, word.x1);
    bottom = Math.max(bottom, word.y1);
  }
  return {
    x: left - padding,
    y: top - padding,
    w: right - left + padding * 2,
    h: bottom - top + padding * 2,
  };
}

/**
 * True when a word already sits under a box. Half-overlap counts: the purpose of
 * the tap is "hide this text", and a box that covers most of a glyph has done it.
 */
export function wordInRect(word: OcrWord, rect: Rect): boolean {
  return (
    word.x0 < rect.x + rect.w &&
    word.x1 > rect.x &&
    word.y0 < rect.y + rect.h &&
    word.y1 > rect.y
  );
}
