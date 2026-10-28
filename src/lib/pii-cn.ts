import {
  collect,
  hasDigitBoundary,
  type PiiMatch,
} from "@/lib/pattern-utils";

/**
 * Mainland-China document numbers.
 *
 * The patterns are strict on purpose. An 18-digit ID number carries a date of
 * birth and a checksum, and a card number carries a Luhn check, so a random
 * order number almost never passes. False positives cost the user trust; the
 * review pass before download is the only safety net, so it should not be
 * asked to catch a wall of misfires.
 */

// 1[3-9] + 9 digits, optionally with a country code or one space/dash every
// 3-4 digits, which is how numbers are printed on receipts: 138 0013 8000.
const CN_PHONE =
  /(?:\+?86[\s-]?)?1[3-9]\d(?:[\s-]?\d{4}){2}|1[3-9]\d{9}/g;

// 18-digit resident ID: 6 region digits, 8 birth digits, 3 sequence digits, 1
// check digit (a digit or X). 15-digit legacy IDs appear on older documents.
const CN_ID = /\d{17}[0-9Xx]|\d{15}/g;

const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CHECK_CHARS = "10X98765432";

function isRealDate(
  year: number,
  month: number,
  day: number,
  century: number,
): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const full = century + year;
  // Anyone holding an ID today was born after 1900; a run of digits implying an
  // impossible birth year is an order number, not a document number.
  if (full < 1900 || full > 2030) {
    return false;
  }
  const daysInMonth = new Date(full, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Validates an 18-digit resident ID: birth date in the right place, then the
 * published checksum over the first 17 digits. `x` is accepted in either case.
 */
export function idCard18Valid(value: string): boolean {
  const year = Number(value.slice(6, 10));
  const month = Number(value.slice(10, 12));
  const day = Number(value.slice(12, 14));
  if (!isRealDate(year, month, day, 0)) {
    return false;
  }
  let sum = 0;
  for (let index = 0; index < 17; index += 1) {
    const digit = value.charCodeAt(index) - 48;
    if (digit < 0 || digit > 9) {
      return false;
    }
    sum += digit * ID_WEIGHTS[index];
  }
  return ID_CHECK_CHARS[sum % 11] === value[17].toUpperCase();
}

/** 15-digit legacy ID: YYMMDD birth, no checksum, so the date is all we have. */
export function idCard15Valid(value: string): boolean {
  return isRealDate(
    Number(value.slice(6, 8)),
    Number(value.slice(8, 10)),
    Number(value.slice(10, 12)),
    1900,
  );
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^86/, "");
}

/**
 * Detects Chinese phone numbers and resident ID numbers in a single line of
 * text. Card numbers are not duplicated here — the length-agnostic Luhn rule in
 * `pii.ts` already covers UnionPay PANs.
 */
export function detectCN(text: string): PiiMatch[] {
  const found: PiiMatch[] = [];

  found.push(
    ...collect(text, CN_PHONE, "cn_phone", (value, start, end) => {
      // A separator-free run must be exactly 11 digits, otherwise this is a
      // slice of a longer number. Separated runs may not sit inside digits.
      const digits = phoneDigits(value);
      return digits.length === 11 && hasDigitBoundary(text, start, end);
    }),
  );

  found.push(
    ...collect(text, CN_ID, "cn_id", (value, start, end) => {
      if (!hasDigitBoundary(text, start, end)) {
        return false;
      }
      return value.length === 18
        ? idCard18Valid(value)
        : idCard15Valid(value);
    }),
  );

  return found;
}
