import type { Metadata } from "next";

import GuidePage from "@/components/GuidePage";
import { REMOVE_EXIF } from "@/lib/content/guides";
import { guideHref } from "@/lib/content/guides-index";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = guideHref(REMOVE_EXIF.slug);

export const metadata: Metadata = contentMetadata({
  title: REMOVE_EXIF.title,
  description: REMOVE_EXIF.description,
  path: PATH,
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // Generated from constants in the content module, never user input.
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Guides", path: "/guides" },
              { name: REMOVE_EXIF.navLabel, path: PATH },
            ]),
            articleLd({
              headline: REMOVE_EXIF.h1,
              description: REMOVE_EXIF.description,
              path: PATH,
              datePublished: REMOVE_EXIF.published,
              dateModified: REMOVE_EXIF.updated,
            }),
          ),
        }}
      />
      <GuidePage guide={REMOVE_EXIF} />
    </>
  );
}
