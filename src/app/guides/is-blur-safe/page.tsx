import type { Metadata } from "next";

import GuidePage from "@/components/GuidePage";
import { CONTENT_DATE } from "@/lib/content/dates";
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
              datePublished: CONTENT_DATE,
              dateModified: CONTENT_DATE,
            }),
          ),
        }}
      />
      <GuidePage guide={IS_BLUR_SAFE} />
    </>
  );
}
