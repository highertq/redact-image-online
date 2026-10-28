import { describe, expect, it } from "vitest";

import { detectIntl, ibanValid } from "@/lib/pii-intl";
import { detectPII } from "@/lib/pii";

describe("ibanValid", () => {
  it("accepts real formats across regions", () => {
    for (const value of [
      "GB82WEST12345698765432",
      "DE89 3704 0044 0532 0130 00",
      "FR1420041010050500013M02606",
      "SA0380000000608010167519",
      "AE070331234567890123456",
      "NO9386011117947",
      "MT84MALT011000012345MTLCAST001S",
    ]) {
      expect(ibanValid(value)).toBe(true);
    }
  });

  it("rejects a broken checksum", () => {
    expect(ibanValid("GB82WEST12345698765433")).toBe(false);
    expect(ibanValid("DE89370400440532013001")).toBe(false);
  });

  it("rejects runs that are too short or malformed", () => {
    expect(ibanValid("AB12CDEF")).toBe(false);
    expect(ibanValid("XX1420041010050500013M02606")).toBe(false);
  });
});

describe("detectIntl", () => {
  it("finds an IBAN printed in four-character groups", () => {
    const found = detectIntl("IBAN: DE89 3704 0044 0532 0130 00");
    expect(found).toHaveLength(1);
    expect(found[0].type).toBe("iban");
  });

  it("does not carve an IBAN out of a longer reference code", () => {
    expect(detectIntl("REF-XX1420041010050500013M02606YY")).toEqual([]);
  });
});

describe("IBAN inside detectPII", () => {
  it("is reported once, as an IBAN", () => {
    const found = detectPII("DE89370400440532013000");
    expect(found.map((m) => m.type)).toEqual(["iban"]);
  });

  it("still reports a card number on the same line", () => {
    const found = detectPII("GB82WEST12345698765432 4111 1111 1111 1111");
    expect(found.map((m) => m.type)).toEqual(["iban", "credit_card"]);
  });
});
