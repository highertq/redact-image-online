import { EMAIL, CARD_NUMBER, SSN } from "@/lib/content/scenarios-identity";
import {
  BANK_STATEMENT,
  RECEIPT,
  SCREENSHOT,
} from "@/lib/content/scenarios-documents";
import type { Scenario } from "@/lib/content/types";

/** Every scenario page, in the order they appear in navigation. */
export const SCENARIOS: Scenario[] = [
  SCREENSHOT,
  SSN,
  CARD_NUMBER,
  EMAIL,
  BANK_STATEMENT,
  RECEIPT,
];

const BY_SLUG = new Map(SCENARIOS.map((item) => [item.slug, item]));

export function scenarioBySlug(slug: string): Scenario {
  const found = BY_SLUG.get(slug);
  if (!found) {
    throw new Error(
      `Unknown scenario slug "${slug}". Add it to src/lib/content/registry.ts.`,
    );
  }
  return found;
}

export function scenarioHref(slug: string): string {
  return `/${slug}`;
}

/** Resolves related slugs to full records, skipping any that are missing. */
export function relatedScenarios(slug: string): Scenario[] {
  return scenarioBySlug(slug).related.map((item) => scenarioBySlug(item));
}
