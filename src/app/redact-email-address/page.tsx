import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { EMAIL } from "@/lib/content/scenarios-identity";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-email-address";

export const metadata: Metadata = contentMetadata({
  title: EMAIL.title,
  description: EMAIL.description,
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
              { name: EMAIL.navLabel, path: PATH },
            ]),
            articleLd({
              headline: EMAIL.h1,
              description: EMAIL.description,
              path: PATH,
              datePublished: EMAIL.published,
              dateModified: EMAIL.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={EMAIL} />
    </>
  );
}
