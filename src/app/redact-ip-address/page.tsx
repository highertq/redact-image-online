import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { IP_ADDRESS } from "@/lib/content/scenarios-devops";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-ip-address";

export const metadata: Metadata = contentMetadata({
  title: IP_ADDRESS.title,
  description: IP_ADDRESS.description,
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
              { name: IP_ADDRESS.navLabel, path: PATH },
            ]),
            articleLd({
              headline: IP_ADDRESS.h1,
              description: IP_ADDRESS.description,
              path: PATH,
              datePublished: IP_ADDRESS.published,
              dateModified: IP_ADDRESS.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={IP_ADDRESS} />
    </>
  );
}
