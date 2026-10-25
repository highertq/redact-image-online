import type { Metadata } from "next";
import Link from "next/link";

import { GUIDES, guideHref } from "@/lib/content/guides-index";
import { SCENARIOS, scenarioHref } from "@/lib/content/scenarios";
import { contentMetadata } from "@/lib/metadata";
import { breadcrumbLd, jsonLdScript } from "@/lib/schema";

const PATH = "/guides";

export const metadata: Metadata = contentMetadata({
  title: "Redaction Guides",
  description:
    "Short, practical explanations of redaction: why a blur differs from a solid fill, what EXIF reveals, and what the word redact actually means.",
  path: PATH,
});

export default function GuidesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Generated from constants in the content module, never user input.
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Guides", path: PATH },
            ]),
          ),
        }}
      />
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Guides
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
            Redaction advice is mostly repeated badly. These pages take one
            question each and answer it properly, including the cases where the
            usual advice fails.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Concepts and technique
          </h2>
          <ul className="flex flex-col gap-4">
            {GUIDES.map((guide) => (
              <li key={guide.slug} className="flex flex-col gap-1">
                <Link
                  href={guideHref(guide.slug)}
                  className="text-base font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                >
                  {guide.h1}
                </Link>
                <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
                  {guide.lede}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Two ideas that cover most of it
          </h2>
          <div className="flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-neutral-600">
            <p>
              Almost every redaction failure comes from one of two mistakes, and
              neither of them is about how strong the filter was.
            </p>
            <p>
              The first is choosing an operation that transforms instead of
              removes. A blur, a mosaic, and a lightly applied smear all leave a
              residual in the exported file. For a long paragraph that residual is
              harmless. For a six-digit code it is not, because the candidate
              space is small enough to enumerate and the field itself often carries
              a checksum to verify against.
            </p>
            <p>
              The second is reviewing the wrong artifact. People check the editor,
              where a box composites over an image in memory, and ship the file,
              where the export path decides what actually gets written. Those two
              things can differ, and the file is the one a recipient receives.
            </p>
            <p>
              Everything else — which fields to cover, what metadata survives, why
              a PDF behaves differently from a PNG — follows from those two points.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            What to hide, by document type
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {SCENARIOS.map((scenario) => (
              <li key={scenario.slug}>
                <Link
                  href={scenarioHref(scenario.slug)}
                  className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                >
                  {scenario.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            About the tool behind this site
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Everything described here is what the redaction tool on this site
            actually does, which is why the pages are specific about limits
            instead of claiming that redaction is solved.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link
                href="/methodology"
                className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
              >
                How auto-detect decides what to flag
              </Link>
              <span className="text-neutral-600">
                {" "}
                — the six pattern rules, the checksum, and the misses.
              </span>
            </li>
            <li>
              <Link
                href="/security-audit"
                className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
              >
                Security audit
              </Link>
              <span className="text-neutral-600">
                {" "}
                — what the tool sends, and the one outbound request it makes.
              </span>
            </li>
          </ul>
        </section>

        <p className="text-sm">
          <Link
            href="/"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
          >
            Open the redaction tool
          </Link>
        </p>
      </div>
    </>
  );
}
