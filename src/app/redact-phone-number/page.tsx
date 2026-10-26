import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { CONTENT_DATE } from "@/lib/content/dates";
import { PHONE_NUMBER } from "@/lib/content/scenarios-contacts";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-phone-number";

export const metadata: Metadata = contentMetadata({
  title: PHONE_NUMBER.title,
  description: PHONE_NUMBER.description,
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
              { name: PHONE_NUMBER.navLabel, path: PATH },
            ]),
            articleLd({
              headline: PHONE_NUMBER.h1,
              description: PHONE_NUMBER.description,
              path: PATH,
              datePublished: CONTENT_DATE,
              dateModified: CONTENT_DATE,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={PHONE_NUMBER} />
    </>
  );
}
