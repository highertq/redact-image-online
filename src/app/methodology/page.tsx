import type { Metadata } from "next";
import Link from "next/link";

import { CONTENT_DATE } from "@/lib/content/dates";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";
import { SITE_NAME } from "@/lib/site";

const PATH = "/methodology";

export const metadata: Metadata = contentMetadata({
  title: "How Detection Works",
  description:
    "The exact rules behind auto-detect: six pattern types, a Luhn checksum for card numbers, priority-based overlap resolution, and the known cases that get missed.",
  path: PATH,
});

const RULES = [
  {
    type: "Email address",
    rule: "local part, @, domain, dot-separated suffix",
    note: "Broadest match. No validation of the mailbox.",
  },
  {
    type: "US phone",
    rule: "(415) 555-0132, 415-555-0132, 415.555.0132, +1 415 555 0132",
    note: "Separated forms only. A bare ten-digit run is not matched.",
  },
  {
    type: "SSN",
    rule: "123-45-6789 or 123 45 6789",
    note: "A bare nine-digit run is deliberately not treated as an SSN.",
  },
  {
    type: "Card number",
    rule: "13 to 19 digits, single spaces or dashes allowed",
    note: "Must additionally pass the Luhn checksum.",
  },
  {
    type: "IPv4",
    rule: "four dot-separated octets, each 0 to 255",
    note: "A sentence-final period does not break the match.",
  },
  {
    type: "API key",
    rule: "sk- prefix, AKIA prefix, or ghp_ prefix",
    note: "Narrowest match. Other key formats are not recognized.",
  },
];

const PRIORITY = [
  "API key",
  "Email",
  "Card number",
  "SSN",
  "US phone",
  "IPv4",
];

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Generated from constants in this module, never user input.
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Methodology", path: PATH },
            ]),
            articleLd({
              headline: "How auto-detect decides what to flag",
              description:
                "The pattern rules, checksum, and overlap resolution behind automatic detection.",
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
            Methodology
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How auto-detect decides what to flag
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
            {SITE_NAME} does two separate things: it reads text out of the image,
            then it matches that text against six rules. Both steps can be wrong,
            and knowing which step failed is the difference between trusting a
            result and checking it.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Step one: recognize the text
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            The image is passed to an open-source text recognition engine running
            as WebAssembly inside the tab. It returns words with bounding boxes,
            grouped into lines. Nothing about the image leaves the browser during
            this step.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            This step is the weak link, and it fails in predictable ways: small
            fonts, low contrast, unusual typefaces, text over a busy background,
            handwriting, and anything rotated or curved. On a crisp screenshot it
            performs well. On a photograph of a thermal receipt it performs
            poorly.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Step two: match the six rules
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Recognized words are rejoined into lines, then scanned for these
            patterns. There are exactly six, and there are no others.
          </p>
          <table className="w-full max-w-2xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left">
                <th className="py-2 pr-4 font-semibold text-neutral-900">Type</th>
                <th className="py-2 pr-4 font-semibold text-neutral-900">Rule</th>
                <th className="py-2 font-semibold text-neutral-900">Limit</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((row) => (
                <tr key={row.type} className="border-b border-neutral-200">
                  <td className="py-2 pr-4 align-top font-medium text-neutral-900">
                    {row.type}
                  </td>
                  <td className="py-2 pr-4 align-top font-mono text-xs text-neutral-700">
                    {row.rule}
                  </td>
                  <td className="py-2 align-top text-neutral-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Names, addresses, license plates, faces, usernames, workspace names,
            and job titles are not in this list. They are not detected at all in
            this version, and any page on this site that implies otherwise would
            be wrong.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Why a card number needs a checksum
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            The rule for card numbers is not just a digit count. A candidate must
            pass the Luhn checksum, the same algorithm a payment terminal uses to
            reject a typo. That eliminates invoice numbers, order references, and
            timestamps that happen to be thirteen to nineteen digits long.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            The cost of that filter is the important part. A number that contains
            an OCR misread, a digit obscured by a fold in the paper, or a crop that
            cut off the last digit will not pass the checksum and will not be
            reported. Detection returning nothing is not evidence that a card
            number is absent — it is evidence that no well-formed number was
            found.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            When two rules claim the same text
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Patterns overlap. A card number can contain a digit run that looks
            like an SSN; a phone number can contain an area code that looks like
            part of an IPv4 address. Rather than merging claims, the tool resolves
            them by priority, and the stronger signal wins:
          </p>
          <ol className="flex max-w-2xl flex-col gap-1 text-sm text-neutral-700">
            {PRIORITY.map((name, index) => (
              <li key={name}>
                {index + 1}. {name}
              </li>
            ))}
          </ol>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            A claim that overlaps an already accepted one is dropped, not
            combined. The result is that one region is never reported twice, which
            keeps the box count honest and prevents a single number from producing
            two stacked boxes with different labels.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            What the box actually covers
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Each match is mapped back to the recognized words that produced it,
            then grouped by line, and the line&apos;s bounding box is expanded by a
            few pixels on each side. Two consequences follow, and both are visible
            in practice.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Text that wraps across two lines produces two boxes, one per line,
            rather than one box spanning both. That is intentional — a single box
            spanning a line break would cover unrelated text in between.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            A value split by unusually wide letter spacing can be rejoined with a
            space and fail to match. This is the most common cause of a missed
            email address in a real screenshot.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            How to check a result
          </h2>
          <ul className="flex max-w-2xl flex-col gap-2 text-sm leading-relaxed text-neutral-600">
            <li>
              — Compare the reported count against what you can see yourself. If
              the tool found fewer addresses than are visible on screen, the
              result is incomplete.
            </li>
            <li>
              — Use the type filter to isolate one category at a time. Turning a
              category off is faster than re-reading every box.
            </li>
            <li>
              — Review the exported file, not the editor. Zoom to actual size and
              check each box edge for a sliver of a character.
            </li>
            <li>
              — Assume a miss until you have checked. Detection is a time saver,
              not a verification step.
            </li>
          </ul>
        </section>

        <nav
          aria-label="Related pages"
          className="flex flex-col gap-3 border-t border-neutral-200 pt-8 text-sm"
        >
          <Link
            href="/security-audit"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
          >
            Security audit: what this tool sends
          </Link>
          <Link
            href="/guides/is-blur-safe"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
          >
            Is blurring text in a screenshot safe?
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
