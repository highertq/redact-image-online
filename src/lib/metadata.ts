import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/site";

export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: `A document with two solid black redaction bars, next to the ${SITE_NAME} promises: solid fill, runs on your device, EXIF stripped.`,
};

/**
 * Builds the per-page Open Graph block. Sharing `OG_IMAGE` keeps every page
 * with a valid preview card without shipping a separate image per page.
 */
export function openGraphFor({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    type: "website" as const,
    images: [OG_IMAGE],
  };
}

/**
 * Per-page metadata for a content page. `path` must be the route the page is
 * actually served from; it drives both the canonical and the OG URL.
 */
export function contentMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: openGraphFor({ title: `${title} | ${SITE_NAME}`, description, path }),
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
