import {
  CONTRACT,
  INVOICE,
  MEDICAL_RECORD,
  QR_CODE,
  SIGNATURE,
} from "@/lib/content/scenarios-business";
import { PHONE_NUMBER } from "@/lib/content/scenarios-contacts";
import {
  REDACT_ON_ANDROID,
  REDACT_ON_IPHONE,
} from "@/lib/content/scenarios-phone-devices";
import { REDACT_ON_PHONE } from "@/lib/content/scenarios-phone";
import {
  BANK_STATEMENT,
  RECEIPT,
  SCREENSHOT,
} from "@/lib/content/scenarios-documents";
import { API_KEY, IP_ADDRESS } from "@/lib/content/scenarios-devops";
import { CARD_NUMBER, EMAIL, SSN } from "@/lib/content/scenarios-identity";
import type { Scenario } from "@/lib/content/types";

/**
 * Every scenario page, in navigation order. Grouped to mirror the clusters:
 * screenshots, the phone cluster, identity numbers, financial documents,
 * business paperwork.
 */
export const SCENARIOS: Scenario[] = [
  SCREENSHOT,
  // The phone cluster sits next to the generic screenshot page it expands on:
  // the list order is the navigation order, and a hub page buried at the bottom
  // of the grid is a hub page nobody reaches from the query it answers.
  REDACT_ON_PHONE,
  REDACT_ON_IPHONE,
  REDACT_ON_ANDROID,
  SSN,
  CARD_NUMBER,
  EMAIL,
  PHONE_NUMBER,
  BANK_STATEMENT,
  RECEIPT,
  INVOICE,
  CONTRACT,
  MEDICAL_RECORD,
  QR_CODE,
  SIGNATURE,
  API_KEY,
  IP_ADDRESS,
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
