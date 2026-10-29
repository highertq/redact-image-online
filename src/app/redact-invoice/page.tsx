import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { INVOICE } from "@/lib/content/scenarios-business";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-invoice";

export const metadata: Metadata = contentMetadata({
  title: INVOICE.title,
  description: INVOICE.description,
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
              { name: INVOICE.navLabel, path: PATH },
            ]),
            articleLd({
              headline: INVOICE.h1,
              description: INVOICE.description,
              path: PATH,
              datePublished: INVOICE.published,
              dateModified: INVOICE.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={INVOICE} />
    </>
  );
}
