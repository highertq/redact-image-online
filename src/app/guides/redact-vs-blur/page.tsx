import type { Metadata } from "next";

import GuidePage from "@/components/GuidePage";
import { REDACT_VS_BLUR } from "@/lib/content/guides";
import { guideHref } from "@/lib/content/guides-index";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = guideHref(REDACT_VS_BLUR.slug);

export const metadata: Metadata = contentMetadata({
  title: REDACT_VS_BLUR.title,
  description: REDACT_VS_BLUR.description,
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
              { name: REDACT_VS_BLUR.navLabel, path: PATH },
            ]),
            articleLd({
              headline: REDACT_VS_BLUR.h1,
              description: REDACT_VS_BLUR.description,
              path: PATH,
              datePublished: REDACT_VS_BLUR.published,
              dateModified: REDACT_VS_BLUR.updated,
            }),
          ),
        }}
      />
      <GuidePage guide={REDACT_VS_BLUR} />
    </>
  );
}
