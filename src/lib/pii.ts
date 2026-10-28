import { detectCN, idCard18Valid } from "@/lib/pii-cn";
import {
  collect,
  hasAlnumBoundary,
  hasDigitBoundary,
  isDigitAt,
  luhnValid,
  resolveOverlaps,
  type PiiMatch,
} from "@/lib/pattern-utils";

export type { PiiMatch };
export type PiiType =
  | "email"
  | "us_phone"
  | "ssn"
  | "credit_card"
  | "ipv4"
  | "api_key"
  | "cn_phone"
  | "cn_id";

/**
 * Stronger, narrower signals win when two patterns claim overlapping
 * characters, so a card number that contains an SSN-shaped slice is reported
 * once, as a card number.
 */
const PRIORITY: Record<string, number> = {
  api_key: 0,
  email: 1,
  credit_card: 2,
  ssn: 3,
  cn_id: 4,
  us_phone: 5,
  cn_phone: 6,
  ipv4: 7,
};

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

// (415) 555-0132 | 415-555-0132 | 415.555.0132 | +1 415 555 0132
const US_PHONE =
  /(?:\+?1[\s.-]?)?(?:\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}|\d{3}[\s.-]\d{3}[\s.-]\d{4})/g;

// Only the separated forms count; a bare run of 9 digits is not an SSN here.
const SSN = /\d{3}[- ]\d{2}[- ]\d{4}/g;

// 13-19 digits, optionally separated by single spaces or dashes. Covers UnionPay
// PANs as well as Visa/Mastercard, since both are validated by Luhn.
const CREDIT_CARD = /\d(?:[ -]?\d){12,18}/g;

const IPV4 = /\d{1,3}(?:\.\d{1,3}){3}/g;

const API_KEYS = [
  /sk-[A-Za-z0-9]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /ghp_[A-Za-z0-9]{36}/g,
  // Google API keys and Stripe live/test keys: both are long fixed-prefix runs.
  /AIza[0-9A-Za-z_-]{35}/g,
  /(?:sk|pk)_live_[A-Za-z0-9]{16,}/g,
];

function octetsInRange(value: string): boolean {
  return value.split(".").every((part) => {
    const octet = Number(part);
    return octet >= 0 && octet <= 255 && part.length <= 3;
  });
}

/**
 * Finds privacy-sensitive text patterns in one line of plain text. Offsets are
 * character indices into `text`; the caller maps them back onto word boxes.
 *
 * Callers should hand this a single OCR line rather than a whole page joined
 * with spaces: every pattern here is line-local, and a page-wide string lets a
 * number at the end of one row fuse with digits at the start of the next.
 */
export function detectPII(text: string): PiiMatch[] {
  if (text.length === 0) {
    return [];
  }

  const found: PiiMatch[] = [];

  for (const pattern of API_KEYS) {
    found.push(...collect(text, pattern, "api_key", (_v, start, end) =>
      hasAlnumBoundary(text, start, end),
    ));
  }

  found.push(...collect(text, EMAIL, "email", () => true));

  found.push(
    ...collect(text, CREDIT_CARD, "credit_card", (value, start, end) => {
      const digits = value.replace(/[ -]/g, "");
      if (digits.length < 13 || digits.length > 19) {
        return false;
      }
      // An 18-digit run that satisfies the resident-ID checksum is an ID
      // number, not a card whose first 18 digits happen to pass Luhn. The card
      // rule is longer-reaching, so it has to yield here explicitly.
      if (digits.length === 18 && idCard18Valid(digits)) {
        return false;
      }
      return hasDigitBoundary(text, start, end) && luhnValid(digits);
    }),
  );

  found.push(
    ...collect(text, SSN, "ssn", (_v, start, end) =>
      hasDigitBoundary(text, start, end),
    ),
  );

  found.push(
    ...collect(text, US_PHONE, "us_phone", (_v, start, end) =>
      hasDigitBoundary(text, start, end),
    ),
  );

  found.push(
    ...collect(text, IPV4, "ipv4", (value, start, end) => {
      // A trailing dot only disqualifies the match when another number follows
      // it, which means a slice of a longer dotted run such as 1.2.3.4.5. A
      // sentence-final period must not break the match.
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

  // Chinese mobile numbers and resident ID numbers, then one shared pass to
  // decide which type owns each stretch of characters.
  found.push(...detectCN(text));

  return resolveOverlaps(found, PRIORITY);
}
