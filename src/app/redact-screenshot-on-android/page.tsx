import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { REDACT_ON_ANDROID } from "@/lib/content/scenarios-phone-devices";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-screenshot-on-android";

export const metadata: Metadata = contentMetadata({
  title: REDACT_ON_ANDROID.title,
  description: REDACT_ON_ANDROID.description,
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
              { name: REDACT_ON_ANDROID.navLabel, path: PATH },
            ]),
            articleLd({
              headline: REDACT_ON_ANDROID.h1,
              description: REDACT_ON_ANDROID.description,
              path: PATH,
              datePublished: REDACT_ON_ANDROID.published,
              dateModified: REDACT_ON_ANDROID.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={REDACT_ON_ANDROID} />
    </>
  );
}
