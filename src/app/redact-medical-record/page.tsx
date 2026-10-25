import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { CONTENT_DATE } from "@/lib/content/dates";
import { MEDICAL_RECORD } from "@/lib/content/scenarios-business";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-medical-record";

export const metadata: Metadata = contentMetadata({
  title: MEDICAL_RECORD.title,
  description: MEDICAL_RECORD.description,
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
              { name: MEDICAL_RECORD.navLabel, path: PATH },
            ]),
            articleLd({
              headline: MEDICAL_RECORD.h1,
              description: MEDICAL_RECORD.description,
              path: PATH,
              datePublished: CONTENT_DATE,
              dateModified: CONTENT_DATE,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={MEDICAL_RECORD} />
    </>
  );
}
