import { describe, expect, it } from "vitest";

import { CONTACT_EMAIL, IS_LIVE, SITE_NAME, SITE_URL } from "@/lib/site";

describe("site constants", () => {
  it("exposes the brand name", () => {
    expect(SITE_NAME).toBe("RedactPic");
  });

  it("falls back to localhost when NEXT_PUBLIC_SITE_URL is unset", () => {
    expect(SITE_URL).toBe("http://localhost:3000");
    expect(IS_LIVE).toBe(false);
  });

  it("leaves the contact email empty for now", () => {
    expect(CONTACT_EMAIL).toBe("");
  });
});
