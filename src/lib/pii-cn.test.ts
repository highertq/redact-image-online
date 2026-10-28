import { describe, expect, it } from "vitest";

import {
  detectCN,
  idCard15Valid,
  idCard18Valid,
} from "@/lib/pii-cn";
import { detectPII } from "@/lib/pii";

function types(text: string): string[] {
  return detectCN(text).map((match) => match.type);
}

function values(text: string): { type: string; value: string }[] {
  return detectCN(text).map((match) => ({ type: match.type, value: match.value }));
}

describe("Chinese mobile numbers", () => {
  it("reads the bare 11-digit form", () => {
    expect(values("13800138000")).toEqual([
      { type: "cn_phone", value: "13800138000" },
    ]);
  });

  it("reads the country-code and spaced forms", () => {
    expect(types("+86 13912345678")).toContain("cn_phone");
    expect(types("138 0013 8000")).toContain("cn_phone");
    expect(types("159-0665-1234")).toContain("cn_phone");
  });

  it("rejects prefixes that are not issued and runs that are too long", () => {
    expect(types("12800138000")).toEqual([]);
    expect(types("call 13800138000123")).toEqual([]);
  });

  it("does not fire inside a longer digit run", () => {
    // A 4111-style card contains 1[3-9] slices; a boundary check is what keeps
    // the card number as one match instead of a card plus two phantom phones.
    expect(types("41111138001380001111")).toEqual([]);
  });
});

describe("resident ID numbers", () => {
  it("accepts a valid checksum and a trailing X in either case", () => {
    expect(idCard18Valid("330281199807154323")).toBe(true);
    expect(idCard18Valid("11010519491231002X")).toBe(true);
    expect(idCard18Valid("11010519491231002x")).toBe(true);
  });

  it("rejects a wrong checksum", () => {
    expect(idCard18Valid("330281199807154321")).toBe(false);
  });

  it("rejects an impossible birth date", () => {
    // 13 as a month is not a checksum problem; the date is checked first so an
    // 18-digit order number cannot masquerade as a document.
    expect(idCard18Valid("330281199813154323")).toBe(false);
    expect(idCard18Valid("330281189907154323")).toBe(false);
  });

  it("validates the 15-digit legacy form by its birth date only", () => {
    expect(idCard15Valid("330281980715432")).toBe(true);
    expect(idCard15Valid("330281991315432")).toBe(false);
  });

  it("reports a legacy ID but not a random 15-digit order number", () => {
    expect(types("330281980715432")).toEqual(["cn_id"]);
    expect(types("202610272200143")).toEqual([]);
  });
});

describe("China rules inside detectPII", () => {
  it("lets the card rule keep a Luhn-valid UnionPay PAN", () => {
    expect(detectPII("6222021234567894").map((m) => m.type)).toEqual([
      "credit_card",
    ]);
  });

  it("keeps an ID number out of the card rule", () => {
    // 18 digits is inside the card length range. The ID checksum is the
    // stronger claim, and this run happens to fail Luhn anyway, so it must be
    // reported once and as an ID.
    const found = detectPII("330281199807154323");
    expect(found.map((m) => m.type)).toEqual(["cn_id"]);
  });

  it("prefers the narrower match when a phone sits inside a labelled run", () => {
    const found = detectPII("13800138000");
    expect(found).toHaveLength(1);
    expect(found[0].type).toBe("cn_phone");
  });
});
