import { SITE_NAME, SITE_URL } from "@/lib/site";

export const HOME_PAGE_TITLE = `Redact Image Online – Free, No Upload | ${SITE_NAME}`;
export const HOME_PAGE_DESCRIPTION =
  "Redact image online free, right in your browser. Draw a box to hide emails, phone numbers, cards, or SSNs, then download a PNG. Nothing is uploaded.";

export const STEPS = [
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

export const AUTO_TYPES = [
  { label: "Email addresses", detail: "like name@example.com" },
  { label: "Phone numbers", detail: "US formats with separators" },
  { label: "Social Security numbers", detail: "the 123-45-6789 shape" },
  { label: "Card numbers", detail: "13 to 19 digits that pass a checksum" },
  { label: "IP addresses", detail: "the 192.168.0.1 shape" },
  { label: "API keys", detail: "sk-, AKIA, and ghp_ prefixed strings" },
];

export const MANUAL_TYPES = [
  { label: "Faces", detail: "every face needs a hand-drawn box" },
  { label: "Home addresses", detail: "street lines, apartment numbers" },
  { label: "Names", detail: "real names are not reliably detected" },
  { label: "License plates", detail: "and any other short text" },
];

export const FAQ = [
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

/**
 * Homepage structured data.
 *
 * FAQPage markup is kept because the questions are genuinely answered on the
 * page and the markup costs nothing, but Google retired FAQ rich results for
 * all sites on 7 May 2026 — it no longer earns an expandable snippet, so it is
 * not here as a CTR play. It stays machine-readable for other consumers.
 *
 * SoftwareApplication is emitted without `aggregateRating`. Google requires a
 * rating OR a review for the software-app rich result, and this site has
 * neither, so inventing one would break the structured data guidelines. The
 * markup remains a valid description of the app without it.
 */
export function buildHomeJsonLd() {
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    url: SITE_URL,
    description: HOME_PAGE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Runs entirely in the browser, no upload",
      "Solid fill redaction that replaces pixels",
      "Automatic detection of emails, phone numbers, SSNs, card numbers, IP addresses, and API keys",
      "PNG export re-encoded from a canvas",
    ],
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

