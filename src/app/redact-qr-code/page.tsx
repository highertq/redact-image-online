import type { Metadata } from "next";

import ScenarioPage from "@/components/ScenarioPage";
import { QR_CODE } from "@/lib/content/scenarios-business";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/redact-qr-code";

export const metadata: Metadata = contentMetadata({
  title: QR_CODE.title,
  description: QR_CODE.description,
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
              { name: QR_CODE.navLabel, path: PATH },
            ]),
            articleLd({
              headline: QR_CODE.h1,
              description: QR_CODE.description,
              path: PATH,
              datePublished: QR_CODE.published,
              dateModified: QR_CODE.updated,
            }),
          ),
        }}
      />
      <ScenarioPage scenario={QR_CODE} />
    </>
  );
}
