import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { FOREIGN_LANGUAGE_DOCUMENT } from "@/lib/content/scenarios-languages";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-foreign-language-document";

export const metadata: Metadata = contentMetadata({
  title: FOREIGN_LANGUAGE_DOCUMENT.title,
  description: FOREIGN_LANGUAGE_DOCUMENT.description,
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
              { name: FOREIGN_LANGUAGE_DOCUMENT.navLabel, path: PATH },
            ]),
            articleLd({
              headline: FOREIGN_LANGUAGE_DOCUMENT.h1,
              description: FOREIGN_LANGUAGE_DOCUMENT.description,
              path: PATH,
              datePublished: FOREIGN_LANGUAGE_DOCUMENT.published,
              dateModified: FOREIGN_LANGUAGE_DOCUMENT.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={FOREIGN_LANGUAGE_DOCUMENT} />
    </>
  );
}
