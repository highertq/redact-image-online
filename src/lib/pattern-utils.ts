/**
 * Shared primitives for the pattern rules in `pii.ts` and `pii-cn.ts`.
 *
 * These live apart from the pattern lists because both files need them, and a
 * boundary rule that differs between two modules is how a phone number ends up
 * matching inside an ID number on one path but not the other.
 */

export type PiiMatch = {
  type: string;
  start: number;
  end: number;
  value: string;
};

export function isDigitAt(text: string, index: number): boolean {
  const char = text[index];
  return char !== undefined && char >= "0" && char <= "9";
}

export function isAlnumAt(text: string, index: number): boolean {
  const char = text[index];
  if (char === undefined) {
    return false;
  }
  return (
    (char >= "0" && char <= "9") ||
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z")
  );
}

/**
 * True when the match is not glued to further digits on either side. Without
 * this, an 11-digit slice of a 19-digit card number would read as a phone
 * number.
 */
export function hasDigitBoundary(
  text: string,
  start: number,
  end: number,
): boolean {
  return !isDigitAt(text, start - 1) && !isDigitAt(text, end);
}

export function hasAlnumBoundary(
  text: string,
  start: number,
  end: number,
): boolean {
  return !isAlnumAt(text, start - 1) && !isAlnumAt(text, end);
}

/** Luhn checksum, the standard validation for card numbers worldwide. */
export function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits.charCodeAt(index) - 48;
    if (digit < 0 || digit > 9) {
      return false;
    }
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/**
 * Runs one pattern over `text` and keeps the hits `accept` approves. The regex
 * is cloned so a caller's `/g` lastIndex can never leak between runs.
 */
export function collect(
  text: string,
  pattern: RegExp,
  type: string,
  accept: (value: string, start: number, end: number) => boolean,
): PiiMatch[] {
  const results: PiiMatch[] = [];
  const regex = new RegExp(pattern.source, pattern.flags);
  let hit = regex.exec(text);
  while (hit !== null) {
    const value = hit[0];
    const start = hit.index;
    const end = start + value.length;
    if (accept(value, start, end)) {
      results.push({ type, start, end, value });
    }
    if (value.length === 0) {
      regex.lastIndex += 1;
    }
    hit = regex.exec(text);
  }
  return results;
}

/**
 * Resolves overlapping claims: `priority` decides which type wins, and a
 * survivor must not overlap an earlier survivor.
 */
export function resolveOverlaps(
  candidates: readonly PiiMatch[],
  priority: Record<string, number>,
): PiiMatch[] {
  const ordered = [...candidates].sort((a, b) => {
    const rank = (priority[a.type] ?? 99) - (priority[b.type] ?? 99);
    if (rank !== 0) {
      return rank;
    }
    return a.start - b.start;
  });

  const accepted: PiiMatch[] = [];
  for (const candidate of ordered) {
    const overlaps = accepted.some(
      (existing) =>
        candidate.start < existing.end && candidate.end > existing.start,
    );
    if (!overlaps) {
      accepted.push(candidate);
    }
  }
  return accepted.sort((a, b) => a.start - b.start);
}
