import type { MetadataRoute } from "next";

import { CONTENT_DATE } from "@/lib/content/dates";
import { GUIDES, guideHref } from "@/lib/content/guides-index";
import { SCENARIOS, scenarioHref } from "@/lib/content/scenarios";
import { SITE_URL } from "@/lib/site";

// A fixed date keeps lastModified stable across builds; bump CONTENT_DATE when
// the copy on any page actually changes.
const LAST_MODIFIED = new Date(CONTENT_DATE);

type Frequency = MetadataRoute.Sitemap[number]["changeFrequency"];

type Entry = { path: string; priority: number; changeFrequency: Frequency };

const TRUST_PAGES: Entry[] = [
  { path: "/guides", priority: 0.5, changeFrequency: "monthly" },
  { path: "/methodology", priority: 0.5, changeFrequency: "monthly" },
  { path: "/security-audit", priority: 0.5, changeFrequency: "monthly" },
];

const STATIC_PAGES: Entry[] = [
  { path: "/about", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Derived from the content registries, so a page cannot exist without being
  // listed here. Adding a record is the only step required.
  const entries: Entry[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    ...SCENARIOS.map((item) => ({
      path: scenarioHref(item.slug),
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...GUIDES.map((item) => ({
      path: guideHref(item.slug),
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
    ...TRUST_PAGES,
    ...STATIC_PAGES,
  ];

  return entries.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
