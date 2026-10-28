import { LABEL_TERMS } from "@/lib/label-terms";

/**
 * Label-driven detection: when a line reads "Phone: 415 555 0132" or
 * "交易单号 2026..." or "رقم الجوال 0555123456", cover the value even if no
 * number pattern recognises it.
 *
 * This is the rule that makes auto-detect useful on documents the pattern list
 * was never written for — a Japanese delivery note, a German invoice, a Brazilian
 * utility bill. It fires on the words a form uses, and those are stable even when
 * the document numbers in them are not. The vocabulary lives in `label-terms.ts`;
 * the matcher here is language-independent by construction.
 *
 * Only the value is covered, never the label, so a redacted screenshot still
 * reads as "交易单号 ███████" and the recipient can tell what was hidden.
 */

export type LabelMatch = {
  type: "labelled";
  start: number;
  end: number;
  value: string;
};

/**
 * True when a term is made only of ASCII letters, digits, spaces and punctuation.
 *
 * Word boundaries decide the anchoring: `\b` in JavaScript is ASCII-only, so it
 * works for "total" and silently mis-anchors on "número" or "şifre" (the accent
 * is not a word character, so `\b` would match in the middle of the word). Those
 * are matched as substrings instead, at the cost of a few extra false positives
 * in languages that glue words together — the cheaper error.
 */
function isAsciiWordTerm(term: string): boolean {
  return /^[a-z0-9 .#-]+$/i.test(term);
}

function escapeTerm(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPattern(): RegExp {
  const anchored: string[] = [];
  const literal: string[] = [];
  for (const term of LABEL_TERMS) {
    (isAsciiWordTerm(term) ? anchored : literal).push(escapeTerm(term));
  }
  const parts: string[] = [];
  if (literal.length > 0) {
    parts.push(literal.join("|"));
  }
  if (anchored.length > 0) {
    parts.push(`\\b(?:${anchored.join("|")})\\b`);
  }
  return new RegExp(`(?:${parts.join("|")})`, "gi");
}

const LABEL_PATTERN = buildPattern();

/** Separators that sit between a label and its value. */
const SEPARATOR = /^[\s:：=＝\-–—、,，./]+/;

/**
 * A bare abbreviation standing where the rest of the label's name would be:
 * "Account No. 1234", "Card Nº 5678". Without this the value region starts at
 * "No." and the box swallows a word that is part of the label.
 */
const CONNECTOR = /^(?:no\.?|nr\.?|nº|#)[\s:：]+/i;

/** A value must carry at least one digit, letter, or script character. */
const HAS_CONTENT =
  /[0-9A-Za-z\u00aa\u00b5\u00c0-\u02ff\u0370-\u03ff\u0400-\u04ff\u0590-\u05ff\u0600-\u06ff\u0900-\u097f\u0e00-\u0e7f\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\ub000-\ub11f\uff00-\uffef]/;

/**
 * Where a label's value begins: past the separator, and past a label
 * abbreviation if one follows. A connector is only skipped when something is
 * still left after it, so "Card no" at the end of a line stays a no-op.
 */
function valueStart(line: string, labelEnd: number): number {
  const afterLabel = line.slice(labelEnd);
  const separator = SEPARATOR.exec(afterLabel)?.[0].length ?? 0;
  const connector = CONNECTOR.exec(afterLabel.slice(separator));
  if (connector && afterLabel.slice(separator + connector[0].length).trim() !== "") {
    return labelEnd + separator + connector[0].length;
  }
  return labelEnd + separator;
}

/**
 * Finds every "label followed by a value" region in one line of text and
 * returns the character range of each value.
 *
 * A value ends at the next label on the same line, so
 * "姓名 张三 手机号 13800138000" yields two separate regions instead of one
 * box swallowing the line.
 */
export function detectLabelledFields(line: string): LabelMatch[] {
  const pattern = new RegExp(LABEL_PATTERN.source, LABEL_PATTERN.flags);
  const matches: LabelMatch[] = [];

  const labels: { start: number; end: number }[] = [];
  let hit = pattern.exec(line);
  while (hit !== null) {
    labels.push({ start: hit.index, end: hit.index + hit[0].length });
    if (hit[0].length === 0) {
      pattern.lastIndex += 1;
    }
    hit = pattern.exec(line);
  }

  labels.forEach((label, index) => {
    const next = labels[index + 1];
    const from = valueStart(line, label.end);
    const to = next ? next.start : line.length;
    if (to <= from) {
      return;
    }
    const value = line.slice(from, to).trim();
    if (!HAS_CONTENT.test(value)) {
      return;
    }
    matches.push({ type: "labelled", start: from, end: to, value });
  });

  return matches;
}
