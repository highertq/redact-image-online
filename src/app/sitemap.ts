import type { MetadataRoute } from "next";

import { STANDING_PAGES } from "@/lib/content/dates";
import { GUIDES, guideHref } from "@/lib/content/guides-index";
import { SCENARIOS, scenarioHref } from "@/lib/content/scenarios";
import { SITE_URL } from "@/lib/site";

type Frequency = MetadataRoute.Sitemap[number]["changeFrequency"];

type Entry = {
  path: string;
  priority: number;
  changeFrequency: Frequency;
  /** When the copy behind this URL last changed. */
  updated: string;
};

const TRUST_PAGES: Entry[] = [
  { path: "/guides", priority: 0.5, changeFrequency: "monthly", updated: STANDING_PAGES["/guides"].updated },
  { path: "/methodology", priority: 0.5, changeFrequency: "monthly", updated: STANDING_PAGES["/methodology"].updated },
  { path: "/security-audit", priority: 0.5, changeFrequency: "monthly", updated: STANDING_PAGES["/security-audit"].updated },
];

const STATIC_PAGES: Entry[] = [
  { path: "/about", priority: 0.3, changeFrequency: "yearly", updated: STANDING_PAGES["/about"].updated },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly", updated: STANDING_PAGES["/privacy"].updated },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Derived from the content registries, so a page cannot exist without being
  // listed here. Adding a record is the only step required.
  const entries: Entry[] = [
    { path: "/", priority: 1, changeFrequency: "weekly", updated: STANDING_PAGES["/"].updated },
    ...SCENARIOS.map((item) => ({
      path: scenarioHref(item.slug),
      priority: 0.8,
      changeFrequency: "monthly" as const,
      updated: item.updated,
    })),
    ...GUIDES.map((item) => ({
      path: guideHref(item.slug),
      priority: 0.6,
      changeFrequency: "monthly" as const,
      updated: item.updated,
    })),
    ...TRUST_PAGES,
    ...STATIC_PAGES,
  ];

  return entries.map((entry) => ({
    // Next emits the homepage canonical as the bare origin without a trailing
    // slash (it strips it deliberately in `resolveAlternatesUrl`), so the
    // sitemap uses the same spelling. Either form resolves to the same page, but
    // the two signals should not disagree about which one is canonical — that is
    // the kind of ambiguity a four-day-old domain cannot afford.
    url: entry.path === "/" ? SITE_URL : `${SITE_URL}${entry.path}`,
    // Per page rather than one shared date: a lastmod that changes on every
    // build regardless of what changed is a signal Google learns to drop, and a
    // young domain cannot spend its recrawl budget on pages that did not move.
    lastModified: new Date(entry.updated),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
