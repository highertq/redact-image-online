import {
  collect,
  hasAlnumBoundary,
  type PiiMatch,
} from "@/lib/pattern-utils";

/**
 * IBAN — the international bank account identifier used across Europe, the
 * Gulf, and much of Africa and Asia.
 *
 * Worth a rule of its own because it is the single field that makes a foreign
 * payment receipt sensitive, its format is identical everywhere it is used, and
 * it carries a mod-97 self-check: two letters, two check digits, then up to 30
 * alphanumerics. That checksum is what keeps a product code or a base64 fragment
 * from being reported as a bank account.
 */

/**
 * Two print shapes, matched separately because neither can be expressed without
 * swallowing the neighbouring word:
 *
 * - compact, `DE89370400440532013000`, which is what most web forms show
 * - grouped in fours, `DE89 3704 0044 0532 0130 00`, which is what banks print
 *
 * A single permissive pattern allowing spaces anywhere would happily eat
 * " valid text" after an IBAN and then fail its own checksum, losing the match
 * entirely.
 */
const IBAN_COMPACT = /[A-Z]{2}\d{2}[A-Z0-9]{10,30}/gi;
const IBAN_GROUPED = /[A-Z]{2}\d{2}(?:[ -][A-Z0-9]{4}){1,7}(?:[ -][A-Z0-9]{1,3})?/gi;

/** Country formats run from 15 (Norway) to 34 (Malta) characters. */
const MIN_LENGTH = 15;
const MAX_LENGTH = 34;

/**
 * ISO 7064 MOD 97-10: move the four leading characters to the end, replace each
 * letter with its two-digit value (A = 10 … Z = 35), then the whole number must
 * leave a remainder of 1 when divided by 97.
 *
 * The remainder is folded in chunk by chunk because a 34-character IBAN becomes
 * a ~42-digit decimal number, which is far past `Number.MAX_SAFE_INTEGER`.
 */
export function ibanValid(raw: string): boolean {
  const value = raw.replace(/[ -]/g, "").toUpperCase();
  if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
    return false;
  }
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(value)) {
    return false;
  }

  const rearranged = value.slice(4) + value.slice(0, 4);
  let digits = "";
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    digits += code >= 65 && code <= 90 ? String(code - 55) : char;
  }

  let remainder = 0;
  // Chunks of 7 digits plus the carried remainder stay under 10^8, well inside
  // exact integer range. Longer chunks would silently lose precision and validate
  // an IBAN that is not valid.
  for (const chunk of digits.match(/\d{1,7}/g) ?? []) {
    remainder = Number(`${remainder}${chunk}`) % 97;
  }
  return remainder === 1;
}

/**
 * Finds IBANs in one line of recognised text. The alphanumeric boundary check is
 * what stops a match from being carved out of a longer reference code, which
 * matters because IBAN-shaped runs of letters and digits are exactly what
 * internal order numbers look like.
 */
export function detectIntl(text: string): PiiMatch[] {
  const found = [
    ...collect(text, IBAN_COMPACT, "iban", (value, start, end) =>
      hasAlnumBoundary(text, start, end) && ibanValid(value),
    ),
    ...collect(text, IBAN_GROUPED, "iban", (value, start, end) =>
      hasAlnumBoundary(text, start, end) && ibanValid(value),
    ),
  ];

  // The two shapes cannot describe the same characters, but keep the guard: a
  // duplicated claim would produce two boxes over one field.
  const accepted: PiiMatch[] = [];
  for (const candidate of found.sort((a, b) => a.start - b.start)) {
    const overlaps = accepted.some(
      (existing) =>
        candidate.start < existing.end && candidate.end > existing.start,
    );
    if (!overlaps) {
      accepted.push(candidate);
    }
  }
  return accepted;
}
