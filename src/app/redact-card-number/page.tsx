import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { CARD_NUMBER } from "@/lib/content/scenarios-identity";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-card-number";

export const metadata: Metadata = contentMetadata({
  title: CARD_NUMBER.title,
  description: CARD_NUMBER.description,
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
              { name: CARD_NUMBER.navLabel, path: PATH },
            ]),
            articleLd({
              headline: CARD_NUMBER.h1,
              description: CARD_NUMBER.description,
              path: PATH,
              datePublished: CARD_NUMBER.published,
              dateModified: CARD_NUMBER.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={CARD_NUMBER} />
    </>
  );
}
