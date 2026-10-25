import {
  CONTRACT,
  INVOICE,
  MEDICAL_RECORD,
  QR_CODE,
  SIGNATURE,
} from "@/lib/content/scenarios-business";
import {
  BANK_STATEMENT,
  RECEIPT,
  SCREENSHOT,
} from "@/lib/content/scenarios-documents";
import { CARD_NUMBER, EMAIL, SSN } from "@/lib/content/scenarios-identity";
import type { Scenario } from "@/lib/content/types";

/**
 * Every scenario page, in navigation order. Grouped to mirror the clusters:
 * screenshots, identity numbers, financial documents, business paperwork.
 */
export const SCENARIOS: Scenario[] = [
  SCREENSHOT,
  SSN,
  CARD_NUMBER,
  EMAIL,
  BANK_STATEMENT,
  RECEIPT,
  INVOICE,
  CONTRACT,
  MEDICAL_RECORD,
  QR_CODE,
  SIGNATURE,
];

const BY_SLUG = new Map(SCENARIOS.map((item) => [item.slug, item]));

export function scenarioBySlug(slug: string): Scenario {
  const found = BY_SLUG.get(slug);
  if (!found) {
    throw new Error(
      `Unknown scenario slug "${slug}". Add it to src/lib/content/scenarios.ts.`,
    );
  }
  return found;
}

export function scenarioHref(slug: string): string {
  return `/${slug}`;
}

/** Resolves related slugs to full records. Throws if a link is dangling. */
export function relatedScenarios(slug: string): Scenario[] {
  return scenarioBySlug(slug).related.map((item) => scenarioBySlug(item));
}
