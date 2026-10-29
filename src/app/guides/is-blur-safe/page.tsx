import type { Metadata } from "next";

import GuidePage from "@/components/GuidePage";
import { IS_BLUR_SAFE } from "@/lib/content/guides";
import { guideHref } from "@/lib/content/guides-index";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = guideHref(IS_BLUR_SAFE.slug);

export const metadata: Metadata = contentMetadata({
  title: IS_BLUR_SAFE.title,
  description: IS_BLUR_SAFE.description,
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
              { name: IS_BLUR_SAFE.navLabel, path: PATH },
            ]),
            articleLd({
              headline: IS_BLUR_SAFE.h1,
              description: IS_BLUR_SAFE.description,
              path: PATH,
              datePublished: IS_BLUR_SAFE.published,
              dateModified: IS_BLUR_SAFE.updated,
            }),
          ),
        }}
      />
      <GuidePage guide={IS_BLUR_SAFE} />
    </>
  );
}
