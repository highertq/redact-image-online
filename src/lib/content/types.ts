export type FieldRow = { label: string; detail: string };
export type StepItem = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

/**
 * A contextual link back to the homepage from inside the body copy of a
 * scenario page. The anchor is split into three parts so every page can word
 * the sentence differently while still linking with the primary keyword.
 *
 * `anchor` MUST begin with "redact image online" (the site's primary keyword).
 * A unit test enforces this, because the whole point of these links is to send
 * consistent keyword-bearing anchor text at the homepage.
 */
export type PillarLink = {
  before: string;
  anchor: string;
  after: string;
};

/** The prefix every pillar anchor must carry. Asserted in the test suite. */
export const PILLAR_ANCHOR_PREFIX = "redact image online";

/**
 * One scenario landing page. Every field is written per page — nothing here is
 * a shared boilerplate block, because near-identical pages would read as
 * doorway pages to a search engine and to a person.
 */
export type Scenario = {
  /** URL segment, e.g. "redact-ssn" */
  slug: string;
  /** Short label used in navigation lists. */
  navLabel: string;
  h1: string;
  /** Goes into the `%s | RedactMy.pics` template, so keep it under ~44 chars. */
  title: string;
  description: string;
  lede: string;
  risk: { heading: string; body: string[] };
  fields: { heading: string; intro: string; rows: FieldRow[] };
  auto: {
    heading: string;
    intro: string;
    detects: string[];
    misses: string[];
  };
  steps: { heading: string; intro: string; items: StepItem[] };
  detail: { heading: string; body: string[] };
  faq: FaqItem[];
  /** Contextual link to the homepage, rendered inside the body copy. */
  pillarLink: PillarLink;
  /** Slugs of sibling scenarios to link to in the related block. */
  related: string[];
};

export type Guide = {
  slug: string;
  navLabel: string;
  h1: string;
  title: string;
  description: string;
  lede: string;
  sections: { heading: string; body: string[] }[];
  faq: FaqItem[];
  /** Contextual link to the homepage, same pillar-anchor contract as Scenario. */
  pillarLink: PillarLink;
  /** Slugs of sibling guides. Scenario slugs go in `relatedScenarios`. */
  related: string[];
  /** Slugs of scenario pages worth linking to from this guide. */
  relatedScenarios: string[];
};
