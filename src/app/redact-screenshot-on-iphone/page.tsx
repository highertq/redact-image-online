import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { REDACT_ON_IPHONE } from "@/lib/content/scenarios-phone-devices";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-screenshot-on-iphone";

export const metadata: Metadata = contentMetadata({
  title: REDACT_ON_IPHONE.title,
  description: REDACT_ON_IPHONE.description,
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
              { name: REDACT_ON_IPHONE.navLabel, path: PATH },
            ]),
            articleLd({
              headline: REDACT_ON_IPHONE.h1,
              description: REDACT_ON_IPHONE.description,
              path: PATH,
              datePublished: REDACT_ON_IPHONE.published,
              dateModified: REDACT_ON_IPHONE.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={REDACT_ON_IPHONE} />
    </>
  );
}
