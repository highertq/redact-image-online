import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { SIGNATURE } from "@/lib/content/scenarios-business";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-signature";

export const metadata: Metadata = contentMetadata({
  title: SIGNATURE.title,
  description: SIGNATURE.description,
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
              { name: SIGNATURE.navLabel, path: PATH },
            ]),
            articleLd({
              headline: SIGNATURE.h1,
              description: SIGNATURE.description,
              path: PATH,
              datePublished: SIGNATURE.published,
              dateModified: SIGNATURE.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={SIGNATURE} />
    </>
  );
}
