import { describe, expect, it } from "vitest";

import { GUIDES, guideBySlug } from "@/lib/content/guides-index";
import { PILLAR_ANCHOR_PREFIX } from "@/lib/content/types";
import { SCENARIOS, scenarioBySlug } from "@/lib/content/scenarios";

function allSlugs(): string[] {
  return SCENARIOS.map((item) => item.slug);
}

describe("scenario content", () => {
  it("has a unique slug per page", () => {
    const slugs = allSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("serves at least 11 scenario pages", () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(11);
  });

  it("keeps every slug resolvable through scenarioBySlug", () => {
    for (const scenario of SCENARIOS) {
      expect(scenarioBySlug(scenario.slug).slug).toBe(scenario.slug);
    }
  });

  it("throws on an unknown slug instead of returning undefined", () => {
    expect(() => scenarioBySlug("not-a-real-page")).toThrow(/Unknown scenario slug/);
  });

  it("resolves every related slug to a real page", () => {
    for (const scenario of SCENARIOS) {
      for (const relatedSlug of scenario.related) {
        expect(() => scenarioBySlug(relatedSlug)).not.toThrow();
      }
    }
  });

  it("does not link a page to itself in the related block", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.related).not.toContain(scenario.slug);
    }
  });
});

describe("pillar internal linking", () => {
  // These anchors are the whole reason the scenario pages exist as a cluster.
  // If one drifts away from the primary keyword, the cluster stops reinforcing
  // the homepage and the work is wasted without any visible failure.
  it("every scenario anchors back to the homepage with the primary keyword", () => {
    for (const scenario of SCENARIOS) {
      expect(
        scenario.pillarLink.anchor.startsWith(PILLAR_ANCHOR_PREFIX),
        `${scenario.slug} anchor is "${scenario.pillarLink.anchor}"`,
      ).toBe(true);
    }
  });

  it("writes a distinct sentence on every page", () => {
    const sentences = [...SCENARIOS, ...GUIDES].map(
      (item) =>
        `${item.pillarLink.before}|${item.pillarLink.anchor}|${item.pillarLink.after}`,
    );
    expect(new Set(sentences).size).toBe(sentences.length);
  });

  it("gives each link enough surrounding prose to read naturally", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.pillarLink.before.length).toBeGreaterThan(30);
      expect(scenario.pillarLink.after.length).toBeGreaterThan(20);
    }
  });

  it("never puts a clause opener straight after the anchor", () => {
    // "you can redact image online after rasterizing the page" reads as broken
    // English, and the anchor is the only part that cannot move. Anything that
    // begins a subordinate clause has to sit before the link, not after it.
    const badOpeners = [
      "after ",
      "before ",
      "because ",
      "although ",
      "when ",
      "while ",
      "which ",
      "that ",
      "if ",
    ];
    for (const scenario of [...SCENARIOS, ...GUIDES]) {
      const tail = scenario.pillarLink.after.trimStart().toLowerCase();
      for (const opener of badOpeners) {
        expect(
          tail.startsWith(opener),
          `${scenario.slug} after-text starts with "${opener}": "${tail.slice(0, 60)}"`,
        ).toBe(false);
      }
    }
  });

  it("keeps the anchor a bare keyword phrase with no trailing punctuation", () => {
    for (const item of [...SCENARIOS, ...GUIDES]) {
      expect(item.pillarLink.anchor).toBe(PILLAR_ANCHOR_PREFIX);
    }
  });

  it("every guide anchors back to the homepage with the primary keyword", () => {
    for (const guide of GUIDES) {
      expect(
        guide.pillarLink.anchor.startsWith(PILLAR_ANCHOR_PREFIX),
        `${guide.slug} anchor is "${guide.pillarLink.anchor}"`,
      ).toBe(true);
      expect(guide.pillarLink.before.length).toBeGreaterThan(30);
      expect(guide.pillarLink.after.length).toBeGreaterThan(20);
    }
  });
});

describe("metadata constraints", () => {
  it("keeps titles within the rendered length limit", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.title.length).toBeLessThanOrEqual(48);
    }
  });

  it("keeps descriptions within 160 characters", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.description.length).toBeLessThanOrEqual(160);
      expect(scenario.description.length).toBeGreaterThanOrEqual(110);
    }
  });

  it("never repeats a title across scenario pages", () => {
    const titles = SCENARIOS.map((item) => item.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("guide content", () => {
  it("resolves every guide and scenario cross-link", () => {
    for (const guide of GUIDES) {
      for (const slug of guide.related) {
        expect(() => guideBySlug(slug)).not.toThrow();
      }
      for (const slug of guide.relatedScenarios) {
        expect(() => scenarioBySlug(slug)).not.toThrow();
      }
    }
  });

  it("does not link a guide to itself", () => {
    for (const guide of GUIDES) {
      expect(guide.related).not.toContain(guide.slug);
      expect(guide.relatedScenarios).not.toContain(guide.slug);
    }
  });
});
