import { describe, expect, it } from "vitest";

import { detectPII } from "@/lib/pii";

function types(text: string): string[] {
  return detectPII(text).map((match) => match.type);
}

function values(text: string): string[] {
  return detectPII(text).map((match) => match.value);
}

describe("email", () => {
  it("matches a simple address", () => {
    expect(values("write to alice@example.com today")).toEqual([
      "alice@example.com",
    ]);
    expect(types("write to alice@example.com today")).toEqual(["email"]);
  });

  it("matches addresses with dots, plus tags, and subdomains", () => {
    expect(values("a.b+tag@mail.example.co.uk")).toEqual([
      "a.b+tag@mail.example.co.uk",
    ]);
  });

  it("reports the correct character offsets", () => {
    const text = "hi bob@site.io!";
    const [match] = detectPII(text);
    expect(match.start).toBe(3);
    expect(match.end).toBe(14);
    expect(text.slice(match.start, match.end)).toBe("bob@site.io");
  });

  it("does not match a bare word with an at sign and no tld", () => {
    expect(detectPII("ping me at bob@localhost")).toEqual([]);
  });
});

describe("us_phone", () => {
  it("matches (415) 555-0132", () => {
    expect(values("call (415) 555-0132 now")).toEqual(["(415) 555-0132"]);
  });

  it("matches 415-555-0132", () => {
    expect(values("call 415-555-0132 now")).toEqual(["415-555-0132"]);
  });

  it("matches 415.555.0132", () => {
    expect(values("call 415.555.0132 now")).toEqual(["415.555.0132"]);
  });

  it("matches +1 415 555 0132", () => {
    expect(values("call +1 415 555 0132 now")).toEqual(["+1 415 555 0132"]);
  });

  it("rejects an ISO date like 2024-10-25", () => {
    expect(types("the date is 2024-10-25 ok")).not.toContain("us_phone");
  });

  it("rejects a 2024-10-25 style date even with slashes", () => {
    expect(types("on 2024/10/25 we shipped")).not.toContain("us_phone");
  });

  it("rejects a plain 7 digit run without separators", () => {
    expect(types("order 5550132 confirmed")).not.toContain("us_phone");
  });

  it("rejects a 10 digit run with no separators", () => {
    expect(types("id 4155550132 stored")).not.toContain("us_phone");
  });

  it("rejects a two-group number with no area code shape", () => {
    expect(types("ref 555-0132 only")).not.toContain("us_phone");
  });
});

describe("ssn", () => {
  it("matches 123-45-6789", () => {
    expect(values("ssn 123-45-6789 end")).toEqual(["123-45-6789"]);
    expect(types("ssn 123-45-6789 end")).toEqual(["ssn"]);
  });

  it("matches 123 45 6789 with spaces", () => {
    expect(values("ssn 123 45 6789 end")).toEqual(["123 45 6789"]);
  });

  it("rejects a bare 9 digit run", () => {
    expect(types("ssn 123456789 end")).not.toContain("ssn");
  });

  it("rejects a 9 digit run glued to more digits", () => {
    expect(types("acct 1234567890 end")).not.toContain("ssn");
  });

  it("rejects the wrong grouping 12-345-6789", () => {
    expect(types("ssn 12-345-6789 end")).not.toContain("ssn");
  });

  it("does not match a 4-2-4 grouping that is not SSN shaped", () => {
    expect(types("born 2024-41-0250 x")).not.toContain("ssn");
  });
});

describe("credit_card", () => {
  const valid = "4111 1111 1111 1111";
  const invalid = "4111 1111 1111 1112";

  it("matches a Luhn-valid number with spaces", () => {
    expect(values(`card ${valid} ok`)).toEqual([valid]);
    expect(types(`card ${valid} ok`)).toEqual(["credit_card"]);
  });

  it("rejects a Luhn-invalid number", () => {
    expect(types(`card ${invalid} ok`)).not.toContain("credit_card");
  });

  it("matches a dashed 16 digit number", () => {
    expect(values("card 4111-1111-1111-1111 ok")).toEqual([
      "4111-1111-1111-1111",
    ]);
  });

  it("matches an unseparated 16 digit number", () => {
    expect(values("card 4111111111111111 ok")).toEqual(["4111111111111111"]);
  });

  it("matches a 13 digit Luhn-valid number", () => {
    expect(types("card 4222222222222 ok")).toEqual(["credit_card"]);
  });

  it("rejects a Luhn-valid looking run that is too short", () => {
    expect(types("card 4111 1111 111 ok")).not.toContain("credit_card");
  });

  it("rejects a random 16 digit string that fails Luhn", () => {
    expect(types("id 1234567890123456 ok")).not.toContain("credit_card");
  });
});

describe("ipv4", () => {
  it("matches a normal address", () => {
    expect(values("from 192.168.1.1 today")).toEqual(["192.168.1.1"]);
    expect(types("from 192.168.1.1 today")).toEqual(["ipv4"]);
  });

  it("matches boundary octets 0 and 255", () => {
    expect(values("addr 0.0.0.0 ok")).toEqual(["0.0.0.0"]);
    expect(values("addr 255.255.255.255 ok")).toEqual(["255.255.255.255"]);
  });

  it("rejects an octet above 255", () => {
    expect(types("addr 256.1.1.1 ok")).not.toContain("ipv4");
  });

  it("rejects a negative-looking or short octet group", () => {
    expect(types("addr 1.2.3 ok")).not.toContain("ipv4");
  });

  it("rejects an address embedded in a longer dotted string", () => {
    expect(types("addr 1.2.3.4.5 ok")).not.toContain("ipv4");
  });
});

describe("api_key", () => {
  it("matches an sk- key", () => {
    const key = `sk-${"a".repeat(24)}`;
    expect(values(`token ${key} end`)).toEqual([key]);
    expect(types(`token ${key} end`)).toEqual(["api_key"]);
  });

  it("matches an AWS access key id", () => {
    const key = "AKIAIOSFODNN7EXAMPLE";
    expect(values(`aws ${key} end`)).toEqual([key]);
  });

  it("matches a GitHub personal access token", () => {
    const key = `ghp_${"b".repeat(36)}`;
    expect(values(`gh ${key} end`)).toEqual([key]);
  });

  it("rejects an sk- prefix that is too short", () => {
    expect(types("sk-short")).not.toContain("api_key");
  });

  it("rejects an AKIA key with lowercase letters", () => {
    expect(types("AKIAiosfodnn7example")).not.toContain("api_key");
  });
});

describe("mixed input", () => {
  it("finds several kinds in one sentence and sorts by position", () => {
    const text =
      "Mail bob@site.io, call (415) 555-0132, card 4111 1111 1111 1111, ip 10.0.0.1.";
    const found = detectPII(text);
    expect(found.map((m) => m.type)).toEqual([
      "email",
      "us_phone",
      "credit_card",
      "ipv4",
    ]);
    expect(found.map((m) => m.start)).toEqual(
      [...found.map((m) => m.start)].sort((a, b) => a - b),
    );
  });

  it("does not report the same region twice", () => {
    const text = "card 4111111111111111";
    const found = detectPII(text);
    expect(found).toHaveLength(1);
    expect(found[0].type).toBe("credit_card");
  });

  it("returns nothing for empty or clean text", () => {
    expect(detectPII("")).toEqual([]);
    expect(detectPII("nothing sensitive here at all")).toEqual([]);
  });

  it("every match value equals the sliced source text", () => {
    const text = "a bob@site.io b 4111111111111111 c 10.0.0.1";
    for (const match of detectPII(text)) {
      expect(text.slice(match.start, match.end)).toBe(match.value);
    }
  });
});
