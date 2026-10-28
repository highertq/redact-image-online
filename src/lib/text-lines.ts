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

/**
 * Scripts whose characters tesseract emits as separate "words", so a line of
 * them arrives riddled with spaces that are not in the document. Han, Kana and
 * Hangul all behave this way; Latin, Cyrillic and Arabic do not.
 */
const TIGHT_SCRIPT =
  /[㐀-䶿一-鿿豈-﫿぀-ゟ゠-ヿ가-힯ᄀ-ᇿ]/;

function isTight(char: string | undefined): boolean {
  return char !== undefined && TIGHT_SCRIPT.test(char);
}

/**
 * Non-ASCII decimal digit blocks mapped onto their ASCII value, longest list
 * first so the ranges stay readable. Offset-safe by construction: every mapping
 * replaces one character with one character, so `compactMap` still lines up with
 * `text` and a match can be traced back to the right word box.
 *
 * Without this, an Arabic receipt printed in Arabic-Indic digits (٣٣٠٢…) fails
 * every number rule in the tool, because each rule is written against 0-9.
 */
const DIGIT_BLOCKS = [
  0x0660, // Arabic-Indic
  0x06f0, // Extended Arabic-Indic (Persian, Urdu)
  0x0966, // Devanagari
  0x09e6, // Bengali
  0x0a66, // Gurmukhi
  0x0ae6, // Gujarati
  0x0b66, // Oriya
  0x0be6, // Tamil
  0x0c66, // Telugu
  0x0ce6, // Kannada
  0x0d66, // Malayalam
  0x0e50, // Thai
  0x0ed0, // Lao
  0x1040, // Myanmar
  0x17e0, // Khmer
];

const DIGIT_MAP = new Map<number, string>();
for (const base of DIGIT_BLOCKS) {
  for (let d = 0; d <= 9; d += 1) {
    DIGIT_MAP.set(base + d, String(d));
  }
}

/** Fullwidth digits (０-９) are a single range and are handled separately. */
const FULLWIDTH_DIGIT_START = 0xff10;

function normalizeChar(char: string): string {
  const code = char.charCodeAt(0);
  const mapped = DIGIT_MAP.get(code);
  if (mapped !== undefined) {
    return mapped;
  }
  if (code >= FULLWIDTH_DIGIT_START && code <= FULLWIDTH_DIGIT_START + 9) {
    return String(code - FULLWIDTH_DIGIT_START);
  }
  return char;
}

/**
 * Builds the string the rules match against: spaces between characters of a
 * tightly-set script are dropped, and any decimal digit is rewritten as ASCII.
 * Every other space survives — a space between a Han label and its number is
 * real separation, and removing it would glue the two into one long alphanumeric
 * run that matches nothing.
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
      if (isTight(chars[prev]) && isTight(chars[next])) {
        return;
      }
    }
    compact += normalizeChar(char);
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
