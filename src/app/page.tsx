import type { Metadata } from "next";
import Link from "next/link";

import { IconCheck } from "@/components/Icons";
import Redactor from "@/components/Redactor";
import { H2, Prose, Section } from "@/components/Typography";
import { GUIDES, guideHref } from "@/lib/content/guides-index";
import { SCENARIOS, scenarioHref } from "@/lib/content/scenarios";
import {
  AUTO_TYPES,
  FAQ,
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_TITLE,
  MANUAL_TYPES,
  STEPS,
  buildHomeJsonLd,
} from "./home-content";
import { OG_IMAGE } from "@/lib/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const cardLink =
  "flex min-h-11 items-center rounded-md border border-line px-4 text-body-sm font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft";

const PAGE_TITLE = HOME_PAGE_TITLE;
const PAGE_DESCRIPTION = HOME_PAGE_DESCRIPTION;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  // Absolute and with the trailing slash. metadataBase resolves "/" to the bare
  // host with no slash, which is a different string from the "https://…/" the
  // sitemap advertises. Google merges the two, but a canonical and a sitemap
  // entry should be the same URL rather than two spellings of it — every
  // ambiguity in that pair costs a little crawl trust on a young domain.
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function Home() {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <script
        type="application/ld+json"
        // Content is generated from the constants above, not user input.
        dangerouslySetInnerHTML={{ __html: buildHomeJsonLd() }}
      />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-h1 font-semibold text-ink md:text-display">
            Redact Image Online — Free and Private
          </h1>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-ink-2">
            {[
              "No upload — the image is decoded in this tab",
              "Solid fill, not a blur",
              "Free, no account",
            ].map((claim) => (
              <li key={claim} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="grid h-4 w-4 place-items-center rounded-full bg-accent-soft text-accent"
                >
                  <IconCheck className="h-2.5 w-2.5" />
                </span>
                {claim}
              </li>
            ))}
          </ul>
        </div>

        <Redactor />

        <p className="measure text-body-sm leading-relaxed text-ink-2">
          When you need to redact image online before sending it to a client, a
          landlord, or a support team, the goal is simple: the private details
          should be gone, not just hard to see. This tool runs entirely in your
          browser, draws solid boxes over whatever you select, and hands back a
          fresh PNG.
        </p>
      </section>

      <Section>
        <H2>What are you hiding?</H2>
        <Prose>
          <p>
            The tool works the same way for everything, but what counts as
            sensitive depends on the document. Each page below covers one case:
            which fields matter, what the automatic detection will and will not
            find, and where people usually miss something.
          </p>
        </Prose>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((item) => (
            <li key={item.slug}>
              <Link
                href={scenarioHref(item.slug)}
                className="flex h-full flex-col gap-2 rounded-lg border border-line bg-paper p-4 transition-hover hover:border-accent hover:bg-accent-soft sm:p-5"
              >
                <span className="text-body font-semibold text-ink">
                  {item.navLabel}
                </span>
                <span className="line-clamp-3 text-body-sm leading-relaxed text-ink-2 sm:line-clamp-none">
                  {item.lede.length > 150
                    ? `${item.lede.slice(0, 147).trimEnd()}…`
                    : item.lede}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <H2>How to redact an image</H2>
        <Prose>
          <p>
            The whole flow takes a few seconds, and nothing is saved between
            visits. If you reload the page, the image and your boxes are gone.
          </p>
        </Prose>
        <ol className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4 sm:p-5"
            >
              <span
                aria-hidden="true"
                className="grid h-7 w-7 place-items-center rounded-full bg-ink text-label font-semibold text-paper tabular-nums"
              >
                {index + 1}
              </span>
              <h3 className="text-body font-semibold text-ink">{step.title}</h3>
              <p className="text-body-sm leading-relaxed text-ink-2">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <H2>What you can hide</H2>
        <Prose>
          <p>
            Some things the tool can look for on its own. Others you will want
            to box by hand. Either way, check every box before you download.
          </p>
        </Prose>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent-soft p-5">
            <h3 className="text-body font-semibold text-ink">
              Auto-detect can find
            </h3>
            <ul className="flex flex-col gap-2 text-body-sm text-ink-2">
              {AUTO_TYPES.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-ink">{item.label}</span> —{" "}
                  {item.detail}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-paper p-5">
            <h3 className="text-body font-semibold text-ink">
              Draw a box yourself
            </h3>
            <ul className="flex flex-col gap-2 text-body-sm text-ink-2">
              {MANUAL_TYPES.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-ink">{item.label}</span> —{" "}
                  {item.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Prose>
          <p>
            Automatic detection reads text on the image. It can miss something,
            especially in small or low-contrast fonts, so it is a starting point
            rather than a guarantee. Always review every box before downloading.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Redaction vs blur</H2>
        <Prose>
          <p>
            A blur or a soft mosaic looks convincing on screen, but it keeps the
            original shapes and, in the case of a small image, enough structure
            that a determined person can sometimes recover part of what was
            there.
          </p>
          <p>
            Filling a box with a solid color works differently. The pixels inside
            the box are painted over with an opaque value, so the original detail
            no longer exists in the exported file at all. There is nothing left
            to unscramble.
          </p>
          <p>
            That is why solid black is the default here. Pixelate is offered for
            cases where you want the layout to stay readable, with the caveat
            that it is the weaker option for small text, and white is there for
            dark screenshots where a black box would look out of place.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Is it private?</H2>
        <Prose>
          <p>
            Yes. The image is decoded and redacted inside this browser tab. There
            is no upload step, no server-side processing, and no request that
            carries your picture anywhere.
          </p>
          <p>
            One detail worth knowing: the text-recognition library may download
            its language data from a public CDN the first time you use
            auto-detect. That request fetches code and language files only. Your
            image is never part of it.
          </p>
          <p>
            The exported PNG is built by drawing on a new canvas, which is also
            why metadata such as the camera model or GPS coordinates from the
            original file does not survive the trip.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>FAQ</H2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-semibold text-ink transition-hover hover:text-accent [&::-webkit-details-marker]:hidden">
                {item.question}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-ink-3 transition-state group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className="measure pb-4 text-body-sm leading-relaxed text-ink-2">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Section>

      <Section>
        <H2>Why a solid fill instead of a blur</H2>
        <Prose>
          <p>
            A blur averages pixels and a solid fill replaces them. For short
            strings like an account number, the difference decides whether the
            information is gone or merely hard to read. These pages go into the
            detail, including the cases where the usual advice is wrong.
          </p>
        </Prose>
        <ul className="grid gap-2 sm:grid-cols-2">
          {GUIDES.map((item) => (
            <li key={item.slug}>
              <Link href={guideHref(item.slug)} className={cardLink}>
                {item.h1}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/methodology" className={cardLink}>
              How auto-detect decides what to flag
            </Link>
          </li>
          <li>
            <Link href="/security-audit" className={cardLink}>
              What this tool sends, and what it does not
            </Link>
          </li>
        </ul>
      </Section>
    </div>
  );
}
