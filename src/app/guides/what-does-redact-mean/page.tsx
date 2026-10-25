import type { Metadata } from "next";

import GuidePage from "@/components/GuidePage";
import { CONTENT_DATE } from "@/lib/content/dates";
import { WHAT_DOES_REDACT_MEAN } from "@/lib/content/guides";
import { guideHref } from "@/lib/content/guides-index";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = guideHref(WHAT_DOES_REDACT_MEAN.slug);

export const metadata: Metadata = contentMetadata({
  title: WHAT_DOES_REDACT_MEAN.title,
  description: WHAT_DOES_REDACT_MEAN.description,
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
              { name: WHAT_DOES_REDACT_MEAN.navLabel, path: PATH },
            ]),
            articleLd({
              headline: WHAT_DOES_REDACT_MEAN.h1,
              description: WHAT_DOES_REDACT_MEAN.description,
              path: PATH,
              datePublished: CONTENT_DATE,
              dateModified: CONTENT_DATE,
            }),
          ),
        }}
      />
      <GuidePage guide={WHAT_DOES_REDACT_MEAN} />
    </>
  );
}
