import { detectLabelledFields } from "@/lib/label-rules";
import { detectPII } from "@/lib/pii";
import { groupLines, toRawRange, type TextLine } from "@/lib/text-lines";

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

/**
 * Breathing room around a recognised word. OCR boxes are tight against the
 * glyph, which leaves anti-aliased edges and ascenders uncovered; four pixels on
 * an original-resolution screenshot is enough to swallow both.
 */
const PADDING = 4;

/**
 * Union box of the words overlapping a match. `start`/`end` are indices in the
 * line's compact string (what the rules run against) and are mapped back to the
 * word spans, which are indexed in the raw string.
 */
function boxForRange(
  line: TextLine,
  start: number,
  end: number,
): Omit<PiiBox, "type"> | null {
  const [rawStart, rawEnd] = toRawRange(line, start, end);
  const covered = line.spans.filter(
    (span) => span.end > rawStart && span.start < rawEnd,
  );
  if (covered.length === 0) {
    return null;
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const { word } of covered) {
    left = Math.min(left, word.x0);
    top = Math.min(top, word.y0);
    right = Math.max(right, word.x1);
    bottom = Math.max(bottom, word.y1);
  }

  return {
    x: left - PADDING,
    y: top - PADDING,
    w: right - left + PADDING * 2,
    h: bottom - top + PADDING * 2,
  };
}

function contains(outer: PiiBox, inner: PiiBox): boolean {
  return (
    outer.x <= inner.x &&
    outer.y <= inner.y &&
    outer.x + outer.w >= inner.x + inner.w &&
    outer.y + outer.h >= inner.y + inner.h
  );
}

/**
 * Turns recognised words into redaction boxes.
 *
 * Two rules run over every line. Pattern rules catch document numbers
 * (emails, card PANs with a Luhn check, Chinese ID numbers with a checksum).
 * Label rules catch whatever a form calls a sensitive field even when its value
 * matches no pattern, which is most of what is on a real bill. When a pattern
 * box sits inside a label box on the same line, the label box is kept and the
 * pattern box is dropped — one region, one box, so the user is not asked to
 * review the same value twice.
 */
export function wordsToBoxes(words: readonly OcrWord[]): PiiBox[] {
  const boxes: PiiBox[] = [];

  for (const line of groupLines(words)) {
    // Rules read the compact line: tesseract separates Han characters with
    // spaces, and a field name only exists as a word after that is undone.
    const labelBoxes: PiiBox[] = [];
    for (const match of detectLabelledFields(line.compact)) {
      const box = boxForRange(line, match.start, match.end);
      if (box) {
        labelBoxes.push({ ...box, type: match.type });
      }
    }

    const patternBoxes: PiiBox[] = [];
    for (const match of detectPII(line.compact)) {
      const box = boxForRange(line, match.start, match.end);
      if (box) {
        patternBoxes.push({ ...box, type: match.type });
      }
    }

    const keptPattern = patternBoxes.filter(
      (box) => !labelBoxes.some((label) => contains(label, box)),
    );

    boxes.push(...labelBoxes, ...keptPattern);
  }

  // Two rules can land on the same rectangle (a label whose value is also a
  // phone number on a line with no other words). Identical geometry is one box.
  const seen = new Set<string>();
  return boxes.filter((box) => {
    const key = [
      Math.round(box.x),
      Math.round(box.y),
      Math.round(box.w),
      Math.round(box.h),
      box.type,
    ].join("|");
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
