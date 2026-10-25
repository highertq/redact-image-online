import { SITE_NAME, SITE_URL } from "@/lib/site";

type Crumb = { name: string; path: string };

/** Serializes JSON-LD safely for inline embedding. */
export function jsonLdScript(...blocks: object[]): string {
  return JSON.stringify(blocks).replace(/</g, "\\u003c");
}

export function breadcrumbLd(trail: Crumb[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

/**
 * Article-level markup for a content page. `author` and `publisher` point at
 * the site entity declared in the root layout, which is the closest honest
 * statement available: the site is maintained by one person, not a newsroom.
 */
export function articleLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
    datePublished,
    dateModified,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/** WebSite + Organization, emitted once from the root layout. */
export function siteLd(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
    },
  ];
}
