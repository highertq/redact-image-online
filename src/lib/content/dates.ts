/**
 * Dates for the pages that are not generated from a content record.
 *
 * Every scenario and guide page carries `published` / `updated` on its own
 * record, so its JSON-LD `dateModified` and its sitemap `lastModified` move with
 * the copy it describes. These six pages are hand-written rather than registry
 * driven, which is why their dates live here instead.
 *
 * There used to be one site-wide `CONTENT_DATE` shared by all 24 pages. It was a
 * lie in both directions: any edit made every page look freshly revised, and a
 * page published on the 25th reported the 27th. Google reads `lastmod` to decide
 * where to spend recrawl budget, and a date that does not correspond to actual
 * change is a signal it learns to ignore — which is exactly what we cannot afford
 * on a domain this young.
 *
 * Bump `updated` here in the same edit that changes the page's copy.
 */
export const STANDING_PAGES: Record<
  string,
  { published: string; updated: string }
> = {
  "/": { published: "2026-10-25", updated: "2026-10-26" },
  "/guides": { published: "2026-10-25", updated: "2026-10-26" },
  "/about": { published: "2026-10-25", updated: "2026-10-26" },
  "/privacy": { published: "2026-10-25", updated: "2026-10-26" },
  // The rules table gained IBAN and the twelve-language label vocabulary, and
  // the copy no longer frames detection as bilingual. That was a real change to
  // what the page claims, so the date moved with it.
  "/methodology": { published: "2026-10-25", updated: "2026-10-29" },
  "/security-audit": { published: "2026-10-25", updated: "2026-10-26" },
};

/** Dates for a hand-written page. Throws so a new page cannot slip in unlisted. */
export function standingDates(path: string): { published: string; updated: string } {
  const found = STANDING_PAGES[path];
  if (!found) {
    throw new Error(
      `No published/updated date recorded for "${path}". Add it to STANDING_PAGES in src/lib/content/dates.ts.`,
    );
  }
  return found;
}
