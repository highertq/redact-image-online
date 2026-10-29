import type { Metadata } from "next";

import GuidePage from "@/components/GuidePage";
import { CAN_BLUR_BE_REVERSED } from "@/lib/content/guides-experiment";
import { guideHref } from "@/lib/content/guides-index";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = guideHref(CAN_BLUR_BE_REVERSED.slug);

export const metadata: Metadata = contentMetadata({
  title: CAN_BLUR_BE_REVERSED.title,
  description: CAN_BLUR_BE_REVERSED.description,
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
              { name: CAN_BLUR_BE_REVERSED.navLabel, path: PATH },
            ]),
            articleLd({
              headline: CAN_BLUR_BE_REVERSED.h1,
              description: CAN_BLUR_BE_REVERSED.description,
              path: PATH,
              datePublished: CAN_BLUR_BE_REVERSED.published,
              dateModified: CAN_BLUR_BE_REVERSED.updated,
            }),
          ),
        }}
      />
      <GuidePage guide={CAN_BLUR_BE_REVERSED} />
    </>
  );
}
