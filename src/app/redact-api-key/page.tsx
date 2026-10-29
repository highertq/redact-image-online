import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { API_KEY } from "@/lib/content/scenarios-devops";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-api-key";

export const metadata: Metadata = contentMetadata({
  title: API_KEY.title,
  description: API_KEY.description,
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
              { name: API_KEY.navLabel, path: PATH },
            ]),
            articleLd({
              headline: API_KEY.h1,
              description: API_KEY.description,
              path: PATH,
              datePublished: API_KEY.published,
              dateModified: API_KEY.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={API_KEY} />
    </>
  );
}
