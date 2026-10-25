import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { CONTENT_DATE } from "@/lib/content/dates";
import { BANK_STATEMENT } from "@/lib/content/scenarios-documents";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-bank-statement";

export const metadata: Metadata = contentMetadata({
  title: BANK_STATEMENT.title,
  description: BANK_STATEMENT.description,
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
              { name: BANK_STATEMENT.navLabel, path: PATH },
            ]),
            articleLd({
              headline: BANK_STATEMENT.h1,
              description: BANK_STATEMENT.description,
              path: PATH,
              datePublished: CONTENT_DATE,
              dateModified: CONTENT_DATE,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={BANK_STATEMENT} />
    </>
  );
}
