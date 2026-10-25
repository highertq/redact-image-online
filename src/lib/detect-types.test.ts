import { describe, expect, it } from "vitest";

import {
  applyTypeFilter,
  countByType,
  enableTypes,
  mergeUnique,
  rectKey,
  toggleType,
  typeLabel,
} from "@/lib/detect-types";
import type { Rect } from "@/lib/geometry";

const email1: Rect = { x: 10, y: 20, w: 100, h: 18, label: "email", auto: true };
const email2: Rect = { x: 10, y: 60, w: 120, h: 18, label: "email", auto: true };
const phone: Rect = { x: 10, y: 100, w: 90, h: 18, label: "us_phone", auto: true };
const ssn: Rect = { x: 10, y: 140, w: 70, h: 18, label: "ssn", auto: true };
const manual: Rect = { x: 0, y: 0, w: 40, h: 40 };

describe("typeLabel", () => {
  it("maps each known type to its display name", () => {
    expect(typeLabel("email")).toBe("Email");
    expect(typeLabel("us_phone")).toBe("Phone");
    expect(typeLabel("ssn")).toBe("SSN");
    expect(typeLabel("credit_card")).toBe("Card number");
    expect(typeLabel("api_key")).toBe("API key");
    expect(typeLabel("ipv4")).toBe("IP address");
  });

  it("falls back to the raw type for anything unknown", () => {
    expect(typeLabel("face")).toBe("face");
  });
});

describe("countByType", () => {
  it("counts auto boxes per type", () => {
    expect(countByType([email1, email2, phone, ssn])).toEqual([
      { type: "email", label: "Email", count: 2 },
      { type: "us_phone", label: "Phone", count: 1 },
      { type: "ssn", label: "SSN", count: 1 },
    ]);
  });

  it("returns an empty list when there is nothing to count", () => {
    expect(countByType([])).toEqual([]);
  });

  it("ignores manual boxes", () => {
    expect(countByType([manual, email1])).toEqual([
      { type: "email", label: "Email", count: 1 },
    ]);
  });

  it("uses canonical order, not first-seen order", () => {
    const result = countByType([ssn, phone, email1]);
    expect(result.map((chip) => chip.type)).toEqual([
      "email",
      "us_phone",
      "ssn",
    ]);
  });

  it("sorts unknown types after the known ones", () => {
    const unknown: Rect = { x: 0, y: 0, w: 10, h: 10, label: "zzz", auto: true };
    const result = countByType([unknown, email1]);
    expect(result.map((chip) => chip.type)).toEqual(["email", "zzz"]);
  });
});

describe("toggleType", () => {
  it("removes a type that is on", () => {
    expect(toggleType(["email", "ssn"], "email")).toEqual(["ssn"]);
  });

  it("adds a type that is off", () => {
    expect(toggleType(["email"], "ssn")).toEqual(["email", "ssn"]);
  });

  it("does not mutate the input", () => {
    const enabled = ["email"];
    toggleType(enabled, "ssn");
    expect(enabled).toEqual(["email"]);
  });
});

describe("enableTypes", () => {
  it("adds every type found in the boxes", () => {
    expect(enableTypes([], [email1, phone, ssn])).toEqual([
      "email",
      "us_phone",
      "ssn",
    ]);
  });

  it("does not duplicate types already enabled", () => {
    expect(enableTypes(["email"], [email1, email2])).toEqual(["email"]);
  });
});

describe("mergeUnique", () => {
  it("appends boxes that are not present yet", () => {
    expect(mergeUnique([email1], [phone])).toEqual([email1, phone]);
  });

  it("skips boxes already in the list", () => {
    expect(mergeUnique([email1], [{ ...email1 }])).toEqual([email1]);
  });

  it("keeps the existing order and appends new items after", () => {
    expect(mergeUnique([manual, email1], [phone])).toEqual([
      manual,
      email1,
      phone,
    ]);
  });

  it("treats boxes differing only in sub-hundredth floats as identical", () => {
    const jittered = { ...email1, x: email1.x + 0.0001 };
    expect(mergeUnique([email1], [jittered])).toEqual([email1]);
  });
});

describe("rectKey", () => {
  it("distinguishes boxes by geometry and label", () => {
    expect(rectKey(email1)).not.toBe(rectKey(phone));
    expect(rectKey({ ...email1, auto: false })).toBe(rectKey(email1));
  });
});

describe("applyTypeFilter", () => {
  const known = [email1, email2, phone, ssn];

  it("keeps everything when all types are enabled", () => {
    const current = [manual, email1, phone];
    expect(applyTypeFilter(current, current, ["email", "us_phone"])).toEqual(
      current,
    );
  });

  it("re-adds a known box that went missing while its type stays enabled", () => {
    // The pool is the source of truth for "what detection produced". If a box
    // vanished from `current` but its type is on, it comes back. Callers that
    // mean "the user deleted this" must prune the pool (see Redactor).
    const current = [manual, email1];
    const result = applyTypeFilter(current, known, ["email", "us_phone"]);
    expect(result.map((rect) => rect.label ?? "manual")).toEqual([
      "manual",
      "email",
      "email",
      "us_phone",
    ]);
    expect(result).toContainEqual(email2);
  });

  it("removes auto boxes of a disabled type", () => {
    const result = applyTypeFilter([email1, phone], known, ["us_phone"]);
    expect(result).toEqual([phone]);
  });

  it("restores boxes when a type is enabled again", () => {
    const withoutEmail = applyTypeFilter([email1, phone], known, ["us_phone"]);
    const restored = applyTypeFilter(withoutEmail, known, ["email", "us_phone"]);
    expect(restored).toHaveLength(3);
    expect(restored).toContainEqual(email1);
    expect(restored).toContainEqual(phone);
  });

  it("never removes manual boxes", () => {
    const result = applyTypeFilter([manual, email1], known, []);
    expect(result).toEqual([manual]);
  });

  it("does not duplicate boxes that are already present", () => {
    const result = applyTypeFilter([email1, email2], known, ["email"]);
    expect(result.filter((rect) => rect.label === "email")).toHaveLength(2);
  });

  it("ends with every box of the enabled types, regardless of how it got there", () => {
    // Toggling off then on again must land back on the full set.
    const off = applyTypeFilter(known, known, ["email", "ssn"]);
    const on = applyTypeFilter(off, known, ["email", "ssn", "us_phone"]);
    const types = on.map((rect) => rect.label);
    expect(types.filter((type) => type === "us_phone")).toHaveLength(1);
    expect(types).toEqual(["email", "email", "ssn", "us_phone"]);
  });

  it("returns an empty list when nothing is enabled and nothing is manual", () => {
    expect(applyTypeFilter(known, known, [])).toEqual([]);
  });

  it("ignores boxes whose type is unknown to the enabled list", () => {
    const odd: Rect = { x: 0, y: 0, w: 5, h: 5, label: "face", auto: true };
    expect(applyTypeFilter([odd], [odd], ["email"])).toEqual([]);
  });
});
