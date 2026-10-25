import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { CONTENT_DATE } from "@/lib/content/dates";
import { SSN } from "@/lib/content/scenarios-identity";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-ssn";

export const metadata: Metadata = contentMetadata({
  title: SSN.title,
  description: SSN.description,
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
              { name: SSN.navLabel, path: PATH },
            ]),
            articleLd({
              headline: SSN.h1,
              description: SSN.description,
              path: PATH,
              datePublished: CONTENT_DATE,
              dateModified: CONTENT_DATE,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={SSN} />
    </>
  );
}
