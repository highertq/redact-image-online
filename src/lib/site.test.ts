import { describe, expect, it } from "vitest";

import { CONTACT_EMAIL, IS_LIVE, SITE_NAME, SITE_URL } from "@/lib/site";

/** Mirrors the normalization applied to SITE_URL in src/lib/site.ts. */
function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

describe("site constants", () => {
  it("exposes the brand name", () => {
    expect(SITE_NAME).toBe("RedactMy.pics");
  });

  it("falls back to the production domain when NEXT_PUBLIC_SITE_URL is unset", () => {
    expect(SITE_URL).toBe("https://redactmy.pics");
    expect(IS_LIVE).toBe(false);
  });

  it("never leaves a trailing slash on SITE_URL", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("strips trailing slashes from an environment value", () => {
    expect(normalizeBaseUrl("https://redactmy.pics/")).toBe(
      "https://redactmy.pics",
    );
    expect(normalizeBaseUrl("https://redactmy.pics///")).toBe(
      "https://redactmy.pics",
    );
    expect(normalizeBaseUrl("https://redactmy.pics")).toBe(
      "https://redactmy.pics",
    );
    expect(normalizeBaseUrl("https://example.com/path/")).toBe(
      "https://example.com/path",
    );
  });

  it("exposes a contact email", () => {
    expect(CONTACT_EMAIL).toBe("jyao10086@gmail.com");
  });
});
