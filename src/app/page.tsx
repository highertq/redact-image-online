import type { Metadata } from "next";

import Redactor from "@/components/Redactor";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const PAGE_TITLE = `Redact Image Online – Free, No Upload | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  "Redact image online free, right in your browser. Draw a box to hide emails, phone numbers, cards, or SSNs, then download a PNG. Nothing is uploaded.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
  },
};

const STEPS = [
  {
    title: "Choose an image",
    body: "Drag a PNG, JPEG, or WebP onto the page, paste it with Ctrl/Cmd+V, or pick a file. Your image opens directly in the tab.",
  },
  {
    title: "Draw a box over anything private",
    body: "Drag across the image to cover a name, address, or face. Use Auto-detect sensitive text if you want the tool to look for emails, phone numbers, SSNs, card numbers, IP addresses, and API keys first.",
  },
  {
    title: "Pick a fill style",
    body: "Solid black is the default and the safest choice. White works on dark screenshots. Pixelate is available, though it is weaker for small text.",
  },
  {
    title: "Download the PNG",
    body: "The file is rebuilt on a canvas at the original resolution, so the covered pixels are replaced and the image is re-encoded without EXIF data.",
  },
];

const AUTO_TYPES = [
  { label: "Email addresses", detail: "like name@example.com" },
  { label: "Phone numbers", detail: "US formats with separators" },
  { label: "Social Security numbers", detail: "the 123-45-6789 shape" },
  { label: "Card numbers", detail: "13 to 19 digits that pass a checksum" },
  { label: "IP addresses", detail: "the 192.168.0.1 shape" },
  { label: "API keys", detail: "sk-, AKIA, and ghp_ prefixed strings" },
];

const MANUAL_TYPES = [
  { label: "Faces", detail: "every face needs a hand-drawn box" },
  { label: "Home addresses", detail: "street lines, apartment numbers" },
  { label: "Names", detail: "real names are not reliably detected" },
  { label: "License plates", detail: "and any other short text" },
];

const FAQ = [
  {
    question: "Is it really free?",
    answer:
      "Yes. There is no account, no paid tier, and no export limit. The tool runs entirely in your browser, which is why it costs nothing to offer.",
  },
  {
    question: "Do my images get uploaded anywhere?",
    answer:
      "No. Your image is decoded in the tab and never sent to a server. There is no upload step, and the download is created locally.",
  },
  {
    question: "Does it remove metadata such as EXIF?",
    answer:
      "Yes. The export is a new PNG drawn on a fresh canvas, so camera details, GPS coordinates, and other EXIF fields from the original file are dropped.",
  },
  {
    question: "Which file types can I use?",
    answer:
      "PNG, JPEG, and WebP, up to 25 MB and 40 million pixels. Larger files are rejected before they are decoded.",
  },
  {
    question: "Can I undo a box I drew by mistake?",
    answer:
      "Yes. Use the Undo button or Ctrl/Cmd+Z, and Redo or Ctrl/Cmd+Shift+Z to bring it back. Clear all removes every box at once, and Start over loads a different image.",
  },
  {
    question: "Does it work on a phone?",
    answer:
      "Yes. You can open the page on a phone or tablet and draw boxes with a finger. The layout is built for narrow screens.",
  },
];

function buildJsonLd() {
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    url: SITE_URL,
    description: PAGE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return JSON.stringify([software, faq]).replace(/</g, "\\u003c");
}

export default function Home() {
  return (
    <div className="flex flex-col gap-14">
      <script
        type="application/ld+json"
        // Content is generated from the constants above, not user input.
        dangerouslySetInnerHTML={{ __html: buildJsonLd() }}
      />

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Redact Image Online — Free and Private
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
          When you need to redact image online before sending it to a client, a
          landlord, or a support team, the goal is simple: the private details
          should be gone, not just hard to see. This tool runs entirely in your
          browser, draws solid boxes over whatever you select, and hands back a
          fresh PNG.
        </p>
        <Redactor />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          How to redact an image
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          The whole flow takes a few seconds, and nothing is saved between
          visits. If you reload the page, the image and your boxes are gone.
        </p>
        <ol className="flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white"
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            What you can hide
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
            Some things the tool can look for on its own. Others you will want to
            box by hand. Either way, check every box before you download.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-base font-semibold text-neutral-900">
              Auto-detect can find
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-neutral-700">
              {AUTO_TYPES.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-neutral-900">
                    {item.label}
                  </span>{" "}
                  — {item.detail}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <h3 className="text-base font-semibold text-neutral-900">
              Draw a box yourself
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-neutral-700">
              {MANUAL_TYPES.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-neutral-900">
                    {item.label}
                  </span>{" "}
                  — {item.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          Automatic detection reads text on the image. It can miss something,
          especially in small or low-contrast fonts, so it is a starting point
          rather than a guarantee. Always review every box before downloading.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Redaction vs blur
        </h2>
        <div className="flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-neutral-600">
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
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Is it private?
        </h2>
        <div className="flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-neutral-600">
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
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <dl className="flex max-w-2xl flex-col divide-y divide-neutral-200">
          {FAQ.map((item) => (
            <div key={item.question} className="flex flex-col gap-2 py-4">
              <dt className="text-base font-semibold text-neutral-900">
                {item.question}
              </dt>
              <dd className="text-sm leading-relaxed text-neutral-600">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
