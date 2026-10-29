import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { CONTRACT } from "@/lib/content/scenarios-business";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-contract";

export const metadata: Metadata = contentMetadata({
  title: CONTRACT.title,
  description: CONTRACT.description,
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
              { name: CONTRACT.navLabel, path: PATH },
            ]),
            articleLd({
              headline: CONTRACT.h1,
              description: CONTRACT.description,
              path: PATH,
              datePublished: CONTRACT.published,
              dateModified: CONTRACT.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={CONTRACT} />
    </>
  );
}
