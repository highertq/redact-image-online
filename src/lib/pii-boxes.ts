import { detectPII } from "@/lib/pii";

export type OcrWord = {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  lineId: number;
};

export type PiiBox = {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const PADDING = 4;

type WordSpan = {
  start: number;
  end: number;
  word: OcrWord;
};

/**
 * Joins word texts with single spaces (matching how the OCR text is searched),
 * then maps each PII match back onto the words it covers. Each affected line
 * yields one union box, expanded by 4 px on every side.
 */
export function wordsToBoxes(words: OcrWord[]): PiiBox[] {
  if (words.length === 0) {
    return [];
  }

  const spans: WordSpan[] = [];
  const parts: string[] = [];
  let cursor = 0;

  words.forEach((word, index) => {
    if (index > 0) {
      parts.push(" ");
      cursor += 1;
    }
    parts.push(word.text);
    spans.push({ start: cursor, end: cursor + word.text.length, word });
    cursor += word.text.length;
  });

  const text = parts.join("");
  const matches = detectPII(text);
  if (matches.length === 0) {
    return [];
  }

  const boxes: PiiBox[] = [];

  for (const match of matches) {
    const covered = spans.filter(
      (span) => span.end > match.start && span.start < match.end,
    );
    if (covered.length === 0) {
      continue;
    }

    const byLine = new Map<number, WordSpan[]>();
    for (const span of covered) {
      const line = span.word.lineId;
      const bucket = byLine.get(line);
      if (bucket) {
        bucket.push(span);
      } else {
        byLine.set(line, [span]);
      }
    }

    for (const lineSpans of byLine.values()) {
      let left = Number.POSITIVE_INFINITY;
      let top = Number.POSITIVE_INFINITY;
      let right = Number.NEGATIVE_INFINITY;
      let bottom = Number.NEGATIVE_INFINITY;

      for (const { word } of lineSpans) {
        left = Math.min(left, word.x0);
        top = Math.min(top, word.y0);
        right = Math.max(right, word.x1);
        bottom = Math.max(bottom, word.y1);
      }

      boxes.push({
        type: match.type,
        x: left - PADDING,
        y: top - PADDING,
        w: right - left + PADDING * 2,
        h: bottom - top + PADDING * 2,
      });
    }
  }

  return boxes;
}
