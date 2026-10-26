import type { Metadata } from "next";
import Link from "next/link";

import { DataTable, H2, PageHeader, Prose, Section } from "@/components/Typography";
import { CONTENT_DATE } from "@/lib/content/dates";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";
import { SITE_NAME } from "@/lib/site";

const PATH = "/security-audit";

export const metadata: Metadata = contentMetadata({
  title: "Security Audit",
  description:
    "A line-by-line audit of this tool: zero fetch calls, zero tracking scripts, zero server routes, and the one third-party request the OCR library makes.",
  path: PATH,
});

const NETWORK_ROWS = [
  { api: "fetch(", hits: "0" },
  { api: "XMLHttpRequest", hits: "0" },
  { api: "sendBeacon", hits: "0" },
  { api: "WebSocket", hits: "0" },
  { api: "EventSource", hits: "0" },
  { api: "<form", hits: "0" },
  { api: "localStorage", hits: "0" },
  { api: "sessionStorage", hits: "0" },
  { api: "indexedDB", hits: "0" },
  { api: "route.ts (API route)", hits: "0" },
  { api: "middleware.ts", hits: "0" },
  { api: '"use server" (server action)', hits: "0" },
];

const TRACKERS = [
  "Google Analytics / gtag",
  "Google Tag Manager",
  "Meta Pixel",
  "Mixpanel",
  "Segment",
  "PostHog",
  "Hotjar",
  "Microsoft Clarity",
  "Plausible",
  "Umami",
  "Matomo",
  "Sentry",
  "Datadog",
  "FullStory",
  "Amplitude",
];

const GAPS = [
  {
    lead: "Automated detection accuracy.",
    body: "Detection is pattern matching over recognized text, and it misses things. The",
    link: { href: "/methodology", label: "methodology page" },
    tail: "documents the rules and the known failure cases.",
  },
  {
    lead: "Third-party infrastructure.",
    body: "The site is hosted on a commercial platform, which records standard request logs for the page load. Those logs relate to the request, not to your image, because your image is never part of a request.",
  },
  {
    lead: "Browser bugs.",
    body: "This audit describes what the application code does, not what every browser version does with canvas encoding.",
  },
  {
    lead: "Independent verification.",
    body: "This is an author's audit. Open DevTools, load an image, and check the network panel yourself. That is a stronger signal than any page like this one.",
  },
];

export default function SecurityAuditPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Generated from constants in this module, never user input.
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Security audit", path: PATH },
            ]),
            articleLd({
              headline: "Security audit: what this tool does and does not send",
              description:
                "A line-by-line audit of the network and storage surface of the redaction tool.",
              path: PATH,
              datePublished: CONTENT_DATE,
              dateModified: CONTENT_DATE,
            }),
          ),
        }}
      />

      <article className="flex flex-col gap-12">
        <PageHeader
          kicker="Audit"
          title="What this tool sends, and what it does not"
        >
          <p>
            {SITE_NAME} claims that your image never leaves your device. That is
            a testable claim, so this page publishes the test. Every number below
            comes from searching the shipped source, not from a marketing review.
          </p>
          <p className="text-body-sm text-ink-3">
            The honest limit of this audit: it was performed by reading the code
            in this repository, not by a third party. You do not have to take it
            on trust — the source is public, and the browser DevTools network
            panel will show you the same thing in about thirty seconds.
          </p>
        </PageHeader>

        <Section>
          <H2>The network surface is empty</H2>
          <Prose>
            <p>
              The application source was searched for every browser API capable
              of transmitting data. The counts below are occurrences in the
              shipped code, not in tests or configuration.
            </p>
          </Prose>
          <DataTable head={["API searched", "Occurrences"]}>
            {NETWORK_ROWS.map((row) => (
              <tr key={row.api} className="border-b border-line last:border-0">
                <td className="px-4 py-2.5 font-mono text-label text-ink">
                  {row.api}
                </td>
                <td className="px-4 py-2.5 font-mono text-label text-ink-2 tabular-nums">
                  {row.hits}
                </td>
              </tr>
            ))}
          </DataTable>
          <Prose>
            <p>
              There is no server component at all. The site is statically
              rendered — there is no API route, no server action, and no
              middleware. A request that would upload an image has nothing to
              reach.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>No analytics, no advertising, no tracking</H2>
          <Prose>
            <p>
              Each of the following was searched for in the source and in the
              rendered page. None is present:
            </p>
          </Prose>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKERS.map((name) => (
              <li
                key={name}
                className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-body-sm text-ink-2"
              >
                <span aria-hidden="true" className="text-ink-3">
                  ·
                </span>
                <span>{name}</span>
              </li>
            ))}
          </ul>
          <Prose>
            <p>
              This is also why the site has no way to report its own traffic. It
              is a deliberate trade: no measurement script means nothing to
              measure users with, and no cookie banner to dismiss.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>The one outbound request, and why it is not a leak</H2>
          <Prose>
            <p>
              Auto-detect needs a text recognition engine. That engine is a
              WebAssembly build of an open-source OCR library, and on first use
              the browser downloads three static files for it — the worker
              script, the WebAssembly core, and the English language data.
            </p>
            <p>
              Those downloads are the only outbound requests the page makes, and
              they carry no image data. The library does contain a code path that
              can fetch an image by URL, and it is worth naming rather than
              hiding: that branch only executes when the input is a string URL.
              This tool always passes an in-memory canvas element, so the branch
              is unreachable here.
            </p>
            <p>
              It follows that this site should never be described as making zero
              network requests. The accurate claim is the one made everywhere
              else on this site: no request carries your image.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>What redaction actually writes</H2>
          <Prose>
            <p>
              The default fill is opaque black, painted with a plain rectangle
              fill operation. There is no global alpha and no compositing mode
              anywhere in the source, so the fill is fully opaque and replaces
              the pixel values underneath rather than blending over them.
            </p>
            <p>
              The pixelate option paints an opaque black base first and then a
              downsampled mosaic on top, so nothing shows through. It is still
              built from original pixels at reduced resolution, which makes it
              weaker than solid fill for short strings. The interface says so,
              and this page is not going to pretend otherwise.
            </p>
            <p>
              The export is drawn onto a fresh canvas at the original dimensions
              and encoded from that canvas. Metadata lives in the source
              file&apos;s container rather than in its pixels, so it is not
              carried across a rebuild. The original file is never copied or
              re-emitted.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>What this audit does not cover</H2>
          <ul className="flex flex-col gap-3">
            {GAPS.map((gap) => (
              <li
                key={gap.lead}
                className="flex gap-3 rounded-lg border border-line bg-paper p-4"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line-strong text-label font-semibold text-ink-3"
                >
                  !
                </span>
                <p className="text-body-sm leading-relaxed text-ink-2">
                  <span className="font-semibold text-ink">{gap.lead}</span>{" "}
                  {gap.body}
                  {gap.link ? (
                    <>
                      {" "}
                      <Link
                        href={gap.link.href}
                        className="font-medium text-ink underline decoration-line-strong underline-offset-2 transition-hover hover:text-accent"
                      >
                        {gap.link.label}
                      </Link>{" "}
                      {gap.tail}
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <nav
          aria-label="Related pages"
          className="flex flex-col gap-2 border-t border-line pt-8 text-body-sm"
        >
          {[
            { href: "/methodology", label: "How auto-detect decides what to flag" },
            { href: "/redact-screenshot", label: "Redact text in a screenshot" },
            { href: "/", label: "Open the redaction tool" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center rounded-md border border-line px-4 font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </article>
    </>
  );
}
