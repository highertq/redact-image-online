export type FieldRow = { label: string; detail: string };
export type StepItem = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

/**
 * One scenario landing page. Every field is written per page — nothing here is
 * a shared boilerplate block, because six near-identical pages would read as
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
  /** Slugs of sibling guides. Scenario slugs go in `relatedScenarios`. */
  related: string[];
  /** Slugs of scenario pages worth linking to from this guide. */
  relatedScenarios: string[];
};
