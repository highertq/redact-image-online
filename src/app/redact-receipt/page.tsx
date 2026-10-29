import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { RECEIPT } from "@/lib/content/scenarios-documents";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-receipt";

export const metadata: Metadata = contentMetadata({
  title: RECEIPT.title,
  description: RECEIPT.description,
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
              { name: RECEIPT.navLabel, path: PATH },
            ]),
            articleLd({
              headline: RECEIPT.h1,
              description: RECEIPT.description,
              path: PATH,
              datePublished: RECEIPT.published,
              dateModified: RECEIPT.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={RECEIPT} />
    </>
  );
}
