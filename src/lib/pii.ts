export type PiiType =
  | "email"
  | "us_phone"
  | "ssn"
  | "credit_card"
  | "ipv4"
  | "api_key";

export type PiiMatch = {
  type: string;
  start: number;
  end: number;
  value: string;
};

/** Stronger signals win when two patterns claim overlapping characters. */
const PRIORITY: Record<string, number> = {
  api_key: 0,
  email: 1,
  credit_card: 2,
  ssn: 3,
  us_phone: 4,
  ipv4: 5,
};

function isDigitAt(text: string, index: number): boolean {
  const char = text[index];
  return char !== undefined && char >= "0" && char <= "9";
}

function isAlnumAt(text: string, index: number): boolean {
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

function hasDigitBoundary(text: string, start: number, end: number): boolean {
  return !isDigitAt(text, start - 1) && !isDigitAt(text, end);
}

function hasAlnumBoundary(text: string, start: number, end: number): boolean {
  return !isAlnumAt(text, start - 1) && !isAlnumAt(text, end);
}

function luhnValid(digits: string): boolean {
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

function collect(
  text: string,
  pattern: RegExp,
  type: PiiType,
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

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

// (415) 555-0132 | 415-555-0132 | 415.555.0132 | +1 415 555 0132
const US_PHONE =
  /(?:\+?1[\s.-]?)?(?:\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}|\d{3}[\s.-]\d{3}[\s.-]\d{4})/g;

// Only the separated forms count; a bare run of 9 digits is not an SSN here.
const SSN = /\d{3}[- ]\d{2}[- ]\d{4}/g;

// 13-19 digits, optionally separated by single spaces or dashes.
const CREDIT_CARD = /\d(?:[ -]?\d){12,18}/g;

const IPV4 = /\d{1,3}(?:\.\d{1,3}){3}/g;

const API_KEYS = [
  /sk-[A-Za-z0-9]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /ghp_[A-Za-z0-9]{36}/g,
];

function octetsInRange(value: string): boolean {
  return value.split(".").every((part) => {
    const octet = Number(part);
    return octet >= 0 && octet <= 255 && part.length <= 3;
  });
}

/**
 * Finds privacy-sensitive text patterns in a plain string. Offsets are
 * character indices into `text`. Overlapping claims are resolved by priority so
 * a single region is never reported twice.
 */
export function detectPII(text: string): PiiMatch[] {
  if (text.length === 0) {
    return [];
  }

  const found: PiiMatch[] = [];

  for (const pattern of API_KEYS) {
    found.push(
      ...collect(text, pattern, "api_key", (_value, start, end) =>
        hasAlnumBoundary(text, start, end),
      ),
    );
  }

  found.push(...collect(text, EMAIL, "email", () => true));

  found.push(
    ...collect(text, CREDIT_CARD, "credit_card", (value, start, end) => {
      const digits = value.replace(/[ -]/g, "");
      if (digits.length < 13 || digits.length > 19) {
        return false;
      }
      return hasDigitBoundary(text, start, end) && luhnValid(digits);
    }),
  );

  found.push(
    ...collect(text, SSN, "ssn", (_value, start, end) =>
      hasDigitBoundary(text, start, end),
    ),
  );

  found.push(
    ...collect(text, US_PHONE, "us_phone", (_value, start, end) =>
      hasDigitBoundary(text, start, end),
    ),
  );

  found.push(
    ...collect(text, IPV4, "ipv4", (value, start, end) => {
      // A trailing dot is only disqualifying when another number follows it
      // (that means we captured a slice of a longer dotted run, e.g. 1.2.3.4.5).
      // A sentence-final period must not break the match.
      if (text[end] === "." && isDigitAt(text, end + 1)) {
        return false;
      }
      if (isDigitAt(text, end)) {
        return false;
      }
      if (text[start - 1] === "." && isDigitAt(text, start - 2)) {
        return false;
      }
      return octetsInRange(value) && hasDigitBoundary(text, start, end);
    }),
  );

  found.sort((a, b) => {
    const priority = (PRIORITY[a.type] ?? 99) - (PRIORITY[b.type] ?? 99);
    if (priority !== 0) {
      return priority;
    }
    return a.start - b.start;
  });

  const accepted: PiiMatch[] = [];
  for (const candidate of found) {
    const overlaps = accepted.some(
      (existing) => candidate.start < existing.end && candidate.end > existing.start,
    );
    if (!overlaps) {
      accepted.push(candidate);
    }
  }

  return accepted.sort((a, b) => a.start - b.start);
}
