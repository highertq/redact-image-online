export type FieldRow = { label: string; detail: string };
export type StepItem = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

/**
 * An image inside a guide section, used by the experiment page where the
 * evidence is a picture of the attack working rather than a claim about it.
 * Width and height are required so the browser reserves the space before the
 * file arrives: an image that pops in later shifts the text under a reader's
 * finger, which is a layout shift on the exact page teaching people about
 * verification.
 */
export type Figure = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

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
 *
 * `published` and `updated` are carried by the record rather than taken from a
 * site-wide constant because a single shared date is a lie: it tells Google
 * every page changed whenever any page changed, which is the fastest way to get
 * `lastmod` ignored, and it dates a page from when the *site* shipped rather
 * than when that page did. Bump `updated` in the same edit that changes the
 * copy — the value is rendered into `dateModified` in the JSON-LD and the
 * sitemap, so it is only honest if it moves with the text.
 */
export type Scenario = {
  /** URL segment, e.g. "redact-ssn" */
  slug: string;
  /** ISO date the page first went live. `YYYY-MM-DD`. */
  published: string;
  /** ISO date the copy below last changed. `YYYY-MM-DD`. */
  updated: string;
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
  /** ISO date the page first went live. See the note on `Scenario`. */
  published: string;
  /** ISO date the copy below last changed. See the note on `Scenario`. */
  updated: string;
  navLabel: string;
  h1: string;
  title: string;
  description: string;
  lede: string;
  sections: { heading: string; body: string[]; figure?: Figure }[];
  faq: FaqItem[];
  /** Contextual link to the homepage, same pillar-anchor contract as Scenario. */
  pillarLink: PillarLink;
  /** Slugs of sibling guides. Scenario slugs go in `relatedScenarios`. */
  related: string[];
  /** Slugs of scenario pages worth linking to from this guide. */
  relatedScenarios: string[];
};
