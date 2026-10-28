import type { Metadata } from "next";
import Link from "next/link";

import { DataTable, H2, PageHeader, Prose, Section } from "@/components/Typography";
import { CONTENT_DATE } from "@/lib/content/dates";
import { contentMetadata } from "@/lib/metadata";
import { articleLd, breadcrumbLd, jsonLdScript } from "@/lib/schema";
import { SITE_NAME } from "@/lib/site";

const PATH = "/methodology";

export const metadata: Metadata = contentMetadata({
  title: "How Detection Works",
  description:
    "The exact rules behind auto-detect: eight pattern types with checksums, label rules for fields no pattern knows, priority-based overlap resolution, and the known cases that get missed.",
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
    type: "China mobile",
    rule: "1[3-9] plus nine digits, with +86 or in 3-4-4 groups",
    note: "Exactly eleven digits, and never inside a longer digit run.",
  },
  {
    type: "SSN",
    rule: "123-45-6789 or 123 45 6789",
    note: "A bare nine-digit run is deliberately not treated as an SSN.",
  },
  {
    type: "China ID card",
    rule: "18 digits with a birth date and checksum, or the 15-digit legacy form",
    note: "Both the date and the checksum must validate, so order numbers do not match.",
  },
  {
    type: "Card number",
    rule: "13 to 19 digits, single spaces or dashes allowed",
    note: "Must additionally pass the Luhn checksum. Covers UnionPay PANs.",
  },
  {
    type: "IPv4",
    rule: "four dot-separated octets, each 0 to 255",
    note: "A sentence-final period does not break the match.",
  },
  {
    type: "API key",
    rule: "sk-, AKIA, ghp_, AIza, or sk_live / pk_live prefixes",
    note: "Narrowest match. Other key formats are not recognized.",
  },
  {
    type: "Labelled field",
    rule:
      "Phone, Email, Card, Account, Order, Total, Name, Address, or 手机号, 身份证, 银行卡, 订单号, 收款方, 金额 followed by a value",
    note: "Covers the value, not the label. This is the rule that works on documents the patterns were never written for.",
  },
];

const PRIORITY = [
  "API key",
  "Email",
  "Card number",
  "SSN",
  "China ID card",
  "US phone",
  "China mobile",
  "IPv4",
];

const CHECKS = [
  "Compare the reported count against what you can see yourself. If the tool found fewer addresses than are visible on screen, the result is incomplete.",
  "Use the type filter to isolate one category at a time. Turning a category off is faster than re-reading every box.",
  "Tap any text the patterns missed. Once a pass has run, a tap covers the whole line under your finger, which is faster than dragging a box and works in any language.",
  "Review the exported file, not the editor. Zoom to actual size and check each box edge for a sliver of a character.",
  "Assume a miss until you have checked. Detection is a time saver, not a verification step.",
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
        <PageHeader kicker="Methodology" title="How auto-detect decides what to flag">
          <p>
            {SITE_NAME} does two separate things: it reads text out of the
            image, then it matches that text against a fixed set of rules. Both
            steps can be wrong, and knowing which step failed is the difference
            between trusting a result and checking it.
          </p>
        </PageHeader>

        <Section>
          <H2>Step one: recognize the text</H2>
          <Prose>
            <p>
              The image is passed to an open-source text recognition engine
              running as WebAssembly inside the tab. It returns words with
              bounding boxes, grouped into lines. Nothing about the image leaves
              the browser during this step.
            </p>
            <p>
              The recognition models are served from this site, not from a third
              party CDN, and the engine can read English and Simplified Chinese.
              A Chinese payment receipt and an English bank statement are both
              in scope; a document in another script is read only where its
              digits and Latin words resemble these.
            </p>
            <p>
              This step is the weak link, and it fails in predictable ways:
              small fonts, low contrast, unusual typefaces, text over a busy
              background, handwriting, and anything rotated or curved. On a
              crisp screenshot it performs well. On a photograph of a thermal
              receipt it performs poorly.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>Step two: match the rules</H2>
          <Prose>
            <p>
              Recognized words are rejoined into lines, then scanned line by
              line. Eight pattern rules and one label rule are implemented, and
              there are no others. Matching per line rather than over the whole
              page is deliberate: a number at the end of one row must not fuse
              with digits at the start of the next and invent a card number that
              exists nowhere in the image.
            </p>
          </Prose>
          <DataTable head={["Type", "Rule", "Limit"]}>
            {RULES.map((row) => (
              <tr key={row.type} className="border-b border-line last:border-0">
                <td className="px-4 py-3 align-top text-body-sm font-medium text-ink">
                  {row.type}
                </td>
                <td className="px-4 py-3 align-top font-mono text-label text-ink-2">
                  {row.rule}
                </td>
                <td className="px-4 py-3 align-top text-body-sm text-ink-2">
                  {row.note}
                </td>
              </tr>
            ))}
          </DataTable>
          <Prose>
            <p>
              Faces, license plates, handwriting, and logos are not in this
              list. A name or an address is covered only when a label sits in
              front of it — &quot;Name: Zhang Wei&quot; or &quot;收款方 张伟&quot;
              matches the label rule, while the same name printed in the middle
              of a sentence does not match anything. Any page on this site that
              implies otherwise would be wrong.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>Why a card number needs a checksum</H2>
          <Prose>
            <p>
              The rule for card numbers is not just a digit count. A candidate
              must pass the Luhn checksum, the same algorithm a payment terminal
              uses to reject a typo. That eliminates invoice numbers, order
              references, and timestamps that happen to be thirteen to nineteen
              digits long.
            </p>
            <p>
              The cost of that filter is the important part. A number that
              contains an OCR misread, a digit obscured by a fold in the paper,
              or a crop that cut off the last digit will not pass the checksum
              and will not be reported. Detection returning nothing is not
              evidence that a card number is absent — it is evidence that no
              well-formed number was found.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>When two rules claim the same text</H2>
          <Prose>
            <p>
              Patterns overlap. A card number can contain a digit run that looks
              like an SSN; a phone number can contain an area code that looks
              like part of an IPv4 address. Rather than merging claims, the tool
              resolves them by priority, and the stronger signal wins:
            </p>
          </Prose>
          <ol className="grid gap-2 sm:grid-cols-3">
            {PRIORITY.map((name, index) => (
              <li
                key={name}
                className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2 text-body-sm text-ink"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink font-mono text-label font-semibold text-paper tabular-nums">
                  {index + 1}
                </span>
                {name}
              </li>
            ))}
          </ol>
          <Prose>
            <p>
              A claim that overlaps an already accepted one is dropped, not
              combined. The result is that one region is never reported twice,
              which keeps the box count honest and prevents a single number from
              producing two stacked boxes with different labels.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>What the box actually covers</H2>
          <Prose>
            <p>
              Each match is mapped back to the recognized words that produced
              it, then grouped by line, and the line&apos;s bounding box is
              expanded by a few pixels on each side. Two consequences follow,
              and both are visible in practice.
            </p>
            <p>
              Text that wraps across two lines produces two boxes, one per line,
              rather than one box spanning both. That is intentional — a single
              box spanning a line break would cover unrelated text in between.
            </p>
            <p>
              A value split by unusually wide letter spacing can be rejoined
              with a space and fail to match. This is the most common cause of a
              missed email address in a real screenshot.
            </p>
          </Prose>
        </Section>

        <Section>
          <H2>How to check a result</H2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHECKS.map((item, index) => (
              <li
                key={item.slice(0, 24)}
                className="flex gap-3 rounded-lg border border-line bg-paper p-4"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-label font-semibold text-ink-2 tabular-nums">
                  {index + 1}
                </span>
                <p className="text-body-sm leading-relaxed text-ink-2">{item}</p>
              </li>
            ))}
          </ul>
        </Section>

        <nav
          aria-label="Related pages"
          className="flex flex-col gap-2 border-t border-line pt-8 text-body-sm"
        >
          {[
            { href: "/security-audit", label: "Security audit: what this tool sends" },
            { href: "/guides/is-blur-safe", label: "Is blurring text in a screenshot safe?" },
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
