import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { REDACT_ON_PHONE } from "@/lib/content/scenarios-phone";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-on-phone";

export const metadata: Metadata = contentMetadata({
  title: REDACT_ON_PHONE.title,
  description: REDACT_ON_PHONE.description,
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
              { name: REDACT_ON_PHONE.navLabel, path: PATH },
            ]),
            articleLd({
              headline: REDACT_ON_PHONE.h1,
              description: REDACT_ON_PHONE.description,
              path: PATH,
              datePublished: REDACT_ON_PHONE.published,
              dateModified: REDACT_ON_PHONE.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={REDACT_ON_PHONE} />
    </>
  );
}
