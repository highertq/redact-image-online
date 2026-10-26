import type { Metadata } from "next";
import Link from "next/link";

import { H2, PageHeader, Prose, Section } from "@/components/Typography";
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
      <div className="flex flex-col gap-12">
        <PageHeader kicker="Guides" title="Guides">
          <p>
            Redaction advice is mostly repeated badly. These pages take one
            question each and answer it properly, including the cases where the
            usual advice fails.
          </p>
        </PageHeader>

        <Section>
          <H2>Concepts and technique</H2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={guideHref(guide.slug)}
                  className="flex h-full flex-col gap-2 rounded-lg border border-line bg-paper p-5 transition-hover hover:border-accent hover:bg-accent-soft"
                >
                  <span className="text-body font-semibold text-ink">
                    {guide.h1}
                  </span>
                  <span className="text-body-sm leading-relaxed text-ink-2">
                    {guide.lede}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <H2>Two ideas that cover most of it</H2>
          <Prose>
            <p>
              Almost every redaction failure comes from one of two mistakes, and
              neither of them is about how strong the filter was.
            </p>
            <p>
              The first is choosing an operation that transforms instead of
              removes. A blur, a mosaic, and a lightly applied smear all leave a
              residual in the exported file. For a long paragraph that residual
              is harmless. For a six-digit code it is not, because the candidate
              space is small enough to enumerate and the field itself often
              carries a checksum to verify against.
            </p>
            <p>
              The second is reviewing the wrong artifact. People check the
              editor, where a box composites over an image in memory, and ship
              the file, where the export path decides what actually gets
              written. Those two things can differ, and the file is the one a
              recipient receives.
            </p>
            <p>
              Everything else — which fields to cover, what metadata survives,
              why a PDF behaves differently from a PNG — follows from those two
              points.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>What to hide, by document type</H2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SCENARIOS.map((scenario) => (
              <li key={scenario.slug}>
                <Link
                  href={scenarioHref(scenario.slug)}
                  className="flex min-h-11 items-center rounded-md border border-line px-4 text-body-sm font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
                >
                  {scenario.h1}
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <H2>About the tool behind this site</H2>
          <Prose>
            <p>
              Everything described here is what the redaction tool on this site
              actually does, which is why the pages are specific about limits
              instead of claiming that redaction is solved.
            </p>
          </Prose>
          <ul className="flex flex-col gap-2 text-body-sm">
            <li>
              <Link
                href="/methodology"
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
              >
                How auto-detect decides what to flag
              </Link>
              <span className="text-ink-2">
                {" "}
                — the six pattern rules, the checksum, and the misses.
              </span>
            </li>
            <li>
              <Link
                href="/security-audit"
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
              >
                Security audit
              </Link>
              <span className="text-ink-2">
                {" "}
                — what the tool sends, and the one outbound request it makes.
              </span>
            </li>
          </ul>
        </Section>

        <div className="border-t border-line pt-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
          >
            Open the redaction tool
          </Link>
        </div>
      </div>
    </>
  );
}
