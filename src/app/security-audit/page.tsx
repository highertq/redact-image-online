import type { Metadata } from "next";
import Link from "next/link";

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
  { api: "\"use server\" (server action)", hits: "0" },
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
        <header className="flex flex-col gap-4">
          <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
            Audit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What this tool sends, and what it does not
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
            {SITE_NAME} claims that your image never leaves your device. That is
            a testable claim, so this page publishes the test. Every number below
            comes from searching the shipped source, not from a marketing review.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
            The honest limit of this audit: it was performed by reading the code
            in this repository, not by a third party. You do not have to take it
            on trust — the source is public, and the browser DevTools network
            panel will show you the same thing in about thirty seconds.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            The network surface is empty
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            The application source was searched for every browser API capable of
            transmitting data. The counts below are occurrences in the shipped
            code, not in tests or configuration.
          </p>
          <table className="w-full max-w-2xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left">
                <th className="py-2 pr-4 font-semibold text-neutral-900">
                  API searched
                </th>
                <th className="py-2 font-semibold text-neutral-900">
                  Occurrences
                </th>
              </tr>
            </thead>
            <tbody>
              {NETWORK_ROWS.map((row) => (
                <tr key={row.api} className="border-b border-neutral-200">
                  <td className="py-2 pr-4 font-mono text-xs text-neutral-700">
                    {row.api}
                  </td>
                  <td className="py-2 text-neutral-700">{row.hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            There is no server component at all. The site is statically
            rendered — there is no API route, no server action, and no
            middleware. A request that would upload an image has nothing to
            reach.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            No analytics, no advertising, no tracking
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Each of the following was searched for in the source and in the
            rendered page. None is present:
          </p>
          <ul className="grid max-w-2xl grid-cols-1 gap-1 text-sm text-neutral-700 sm:grid-cols-2">
            {TRACKERS.map((name) => (
              <li key={name} className="flex gap-2">
                <span aria-hidden="true" className="shrink-0">
                  ·
                </span>
                <span>{name}</span>
              </li>
            ))}
          </ul>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            This is also why the site has no way to report its own traffic. It is
            a deliberate trade: no measurement script means nothing to measure
            users with, and no cookie banner to dismiss.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            The one outbound request, and why it is not a leak
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Auto-detect needs a text recognition engine. That engine is a
            WebAssembly build of an open-source OCR library, and on first use the
            browser downloads three static files for it — the worker script, the
            WebAssembly core, and the English language data.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Those downloads are the only outbound requests the page makes, and
            they carry no image data. The library does contain a code path that
            can fetch an image by URL, and it is worth naming rather than hiding:
            that branch only executes when the input is a string URL. This tool
            always passes an in-memory canvas element, so the branch is
            unreachable here.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            It follows that this site should never be described as making zero
            network requests. The accurate claim is the one made everywhere else
            on this site: no request carries your image.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            What redaction actually writes
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            The default fill is opaque black, painted with a plain rectangle fill
            operation. There is no global alpha and no compositing mode anywhere
            in the source, so the fill is fully opaque and replaces the pixel
            values underneath rather than blending over them.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            The pixelate option paints an opaque black base first and then a
            downsampled mosaic on top, so nothing shows through. It is still built
            from original pixels at reduced resolution, which makes it weaker than
            solid fill for short strings. The interface says so, and this page is
            not going to pretend otherwise.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            The export is drawn onto a fresh canvas at the original dimensions and
            encoded from that canvas. Metadata lives in the source file&apos;s
            container rather than in its pixels, so it is not carried across a
            rebuild. The original file is never copied or re-emitted.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            What this audit does not cover
          </h2>
          <ul className="flex max-w-2xl flex-col gap-2 text-sm leading-relaxed text-neutral-600">
            <li>
              — Automated detection accuracy. Detection is pattern matching over
              recognized text, and it misses things. The{" "}
              <Link
                href="/methodology"
                className="font-medium text-neutral-900 underline"
              >
                methodology page
              </Link>{" "}
              documents the rules and the known failure cases.
            </li>
            <li>
              — Third-party infrastructure. The site is hosted on a commercial
              platform, which records standard request logs for the page load.
              Those logs relate to the request, not to your image, because your
              image is never part of a request.
            </li>
            <li>
              — Browser bugs. This audit describes what the application code does,
              not what every browser version does with canvas encoding.
            </li>
            <li>
              — Independent verification. This is an author&apos;s audit. Open
              DevTools, load an image, and check the network panel yourself. That
              is a stronger signal than any page like this one.
            </li>
          </ul>
        </section>

        <nav
          aria-label="Related pages"
          className="flex flex-col gap-3 border-t border-neutral-200 pt-8 text-sm"
        >
          <Link
            href="/methodology"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
          >
            How auto-detect decides what to flag
          </Link>
          <Link
            href="/redact-screenshot"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
          >
            Redact text in a screenshot
          </Link>
          <Link
            href="/"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
          >
            Open the redaction tool
          </Link>
        </nav>
      </article>
    </>
  );
}
