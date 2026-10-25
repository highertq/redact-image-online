import {
  IS_BLUR_SAFE,
  REDACT_VS_BLUR,
  REMOVE_EXIF,
  WHAT_DOES_REDACT_MEAN,
} from "@/lib/content/guides";
import type { Guide } from "@/lib/content/types";

export const GUIDES: Guide[] = [
  REDACT_VS_BLUR,
  IS_BLUR_SAFE,
  REMOVE_EXIF,
  WHAT_DOES_REDACT_MEAN,
];

const BY_SLUG = new Map(GUIDES.map((item) => [item.slug, item]));

export function guideBySlug(slug: string): Guide {
  const found = BY_SLUG.get(slug);
  if (!found) {
    throw new Error(
      `Unknown guide slug "${slug}". Add it to src/lib/content/guides-index.ts.`,
    );
  }
  return found;
}

export function guideHref(slug: string): string {
  return `/guides/${slug}`;
}

export function relatedGuides(slug: string): Guide[] {
  return guideBySlug(slug).related.map((item) => guideBySlug(item));
}
