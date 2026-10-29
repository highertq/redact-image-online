import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { SCREENSHOT } from "@/lib/content/scenarios-documents";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-screenshot";

export const metadata: Metadata = contentMetadata({
  title: SCREENSHOT.title,
  description: SCREENSHOT.description,
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
              { name: "Redact a screenshot", path: PATH },
            ]),
            articleLd({
              headline: SCREENSHOT.h1,
              description: SCREENSHOT.description,
              path: PATH,
              datePublished: SCREENSHOT.published,
              dateModified: SCREENSHOT.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={SCREENSHOT} />
    </>
  );
}
