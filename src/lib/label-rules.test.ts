import { describe, expect, it } from "vitest";

import { LABEL_TERMS } from "@/lib/label-terms";
import { detectLabelledFields } from "@/lib/label-rules";

function regions(line: string): string[] {
  return detectLabelledFields(line).map((m) => m.value);
}

describe("label vocabulary", () => {
  it("contains no empty entries", () => {
    // The term lists are assembled from several files by concatenation, and a
    // stray comma in an array literal produces a hole (`undefined`) that only
    // shows up as a crash inside the matcher at load time.
    for (const term of LABEL_TERMS) {
      expect(typeof term).toBe("string");
      expect(term.trim().length).toBeGreaterThan(1);
    }
  });

  it("is ordered longest first so a label is never half-matched", () => {
    const lengths = LABEL_TERMS.map((term) => [...term].length);
    for (let index = 1; index < lengths.length; index += 1) {
      expect(lengths[index]).toBeLessThanOrEqual(lengths[index - 1]);
    }
  });
});

describe("detectLabelledFields", () => {
  it("covers the value after an English label and keeps the label", () => {
    const line = "Phone: 415 555 0132";
    const [match] = detectLabelledFields(line);
    expect(match.value).toBe("415 555 0132");
    expect(line.slice(match.start, match.end)).toBe("415 555 0132");
    expect(match.start).toBe(line.indexOf("415"));
  });

  it("covers the value after a Chinese label", () => {
    const line = "交易单号 202610272200143888";
    const [match] = detectLabelledFields(line);
    expect(match.value).toBe("202610272200143888");
    expect(match.start).toBe(line.indexOf("2026"));
  });

  it("stops a value at the next label on the same line", () => {
    expect(regions("姓名 张三 手机号 13800138000")).toEqual(["张三", "13800138000"]);
  });

  it("prefers the longer term so 手机号 is one label, not 手机 plus a fragment", () => {
    const [match] = detectLabelledFields("手机号 13800138000");
    expect(match.value).toBe("13800138000");
  });

  it("ignores a label with nothing after it", () => {
    expect(regions("Total:")).toEqual([]);
    expect(regions("金额 -")).toEqual([]);
  });

  it("matches Latin labels regardless of case", () => {
    expect(regions("EMAIL bob@site.io")).toEqual(["bob@site.io"]);
    expect(regions("Account No. 1234-5678")).toEqual(["1234-5678"]);
  });

  it("requires a word boundary so a longer word is not read as a label", () => {
    // "totals" contains "total"; treating it as a label would redact the rest of
    // an ordinary sentence.
    expect(regions("totals for the quarter were reported")).toEqual([]);
  });

  it("reads a fullwidth colon, which is what Chinese forms print", () => {
    expect(regions("身份证号：330281199807154323")).toEqual([
      "330281199807154323",
    ]);
  });

  it("handles several labels across one dense line", () => {
    expect(regions("收款方 张伟 卡号 6222021234567894 金额 88.00")).toEqual([
      "张伟",
      "6222021234567894",
      "88.00",
    ]);
  });
});

describe("detectLabelledFields across languages", () => {
  // The point of the rule: it fires on the word a form prints, so a document in
  // a language nobody wrote a number pattern for still gets its fields covered.
  it.each([
    ["Teléfono: +34 612 345 678", "+34 612 345 678"],
    ["Telefonnummer: 030 901820", "030 901820"],
    ["Numéro de carte : 4111 1111 1111 1111", "4111 1111 1111 1111"],
    ["NIF: B12345678", "B12345678"],
    ["Codice fiscale: RSSMRA80A01H501U", "RSSMRA80A01H501U"],
    ["Номер карты: 4111 1111 1111 1111", "4111 1111 1111 1111"],
    ["Телефон: +7 916 123-45-67", "+7 916 123-45-67"],
    ["Telefon Numarası: 0212 345 67 89", "0212 345 67 89"],
    ["رقم الجوال: 0555123456", "0555123456"],
    ["電話番号: 0312345678", "0312345678"],
    ["口座番号: 1234567-1234567", "1234567-1234567"],
    ["카드번호: 4111 1111 1111 1111", "4111 1111 1111 1111"],
    ["주소: 서울시 강남구 테헤란로", "서울시 강남구 테헤란로"],
  ])("covers the value on %p", (line, value) => {
    expect(regions(line)).toContain(value);
  });

  it("expects the engine's character spacing to be undone already", () => {
    // The rules run on `TextLine.compact`. This asserts the contract at this
    // layer; the end-to-end split-character case lives in pii-boxes.test.ts.
    expect(regions("電話番号 0312345678")).toContain("0312345678");
    expect(regions("電 話 番 号 0312345678")).toEqual([]);
  });

  it("keeps an accented label from matching inside an unrelated word", () => {
    // Pure-ASCII terms get word boundaries; "totaling" must not be read as a
    // financial field label.
    expect(regions("totaling everything we spent in march")).toEqual([]);
  });
});
