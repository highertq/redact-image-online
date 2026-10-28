import { describe, expect, it } from "vitest";

import { detectLabelledFields } from "@/lib/label-rules";

function regions(line: string): string[] {
  return detectLabelledFields(line).map((m) => m.value);
}

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
