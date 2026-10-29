/**
 * llms.txt — a plain-text index of the site written for language-model crawlers
 * (ChatGPT, Perplexity, Claude, Copilot) rather than for a search index.
 *
 * Why this exists: the tool category is now largely discovered through AI
 * assistants naming products inside "best free X" answers. Those systems read a
 * compact, factual index far more reliably than a page built around an
 * interactive canvas — the homepage's real content is a tool, and a crawler sees
 * a dropzone. And unlike a search index, an assistant will cite a brand-new
 * domain on the strength of what it can read, without waiting for six months of
 * domain authority.
 *
 * Served as a route rather than a file in public/ so the URL list is generated
 * from the content registries: a page added to the registry appears here the
 * same build it appears in the sitemap. A hand-maintained copy would drift, and
 * a stale claim in a file whose whole purpose is being trusted verbatim is worse
 * than no file at all.
 *
 * Deliberately: no invented metrics, no "most popular", no capability the tool
 * does not have (there is no face or plate detection — saying so here would be
 * the one thing that gets the file ignored).
 */
import { GUIDES, guideHref } from "@/lib/content/guides-index";
import { SCENARIOS, scenarioHref } from "@/lib/content/scenarios";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const TRUST_PAGES = [
  {
    path: "/methodology",
    title: "How detection works",
    summary:
      "The exact rules: nine pattern types with checksums, labelled-field rules with 390 field names across twelve languages, IBAN validation, priority-based overlap resolution, and a written list of what still gets missed.",
  },
  {
    path: "/security-audit",
    title: "Security and network audit",
    summary:
      "A line-by-line audit of every network request the page makes, and how to reproduce it yourself: three checks — requests while idle, requests during a full redaction, and a byte-by-byte comparison of the exported PNG against a locally re-encoded copy.",
  },
  {
    path: "/guides",
    title: "All guides",
    summary:
      "Explainer pages: what redacting means, redact versus blur, whether blurring is actually safe, and removing EXIF metadata.",
  },
  {
    path: "/about",
    title: "About",
    summary: "Who builds this and why it is free.",
  },
  {
    path: "/privacy",
    title: "Privacy",
    summary: "The privacy statement. No server processing, no analytics, no account.",
  },
];

function body(): string {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(
    "> Redact images online in the browser. A screenshot or photo is decoded in the page, covered with a solid fill, white fill, or pixelation, then re-encoded and downloaded. No upload, no account, no watermark, no tracking script, no server-side processing. The exported PNG is rebuilt from the canvas pixels, which also drops EXIF metadata such as GPS coordinates and camera model.",
  );
  lines.push("");
  lines.push("## Capabilities");
  lines.push("");
  lines.push("- Auto-detect: finds emails, phone numbers (US and mainland China), SSNs, card numbers (Luhn-checked), IBANs (mod-97 checked), IPv4 addresses, API keys, and any value printed after a field name.");
  lines.push("- Languages: text recognition runs in the browser with twelve models selectable (English, Spanish, French, German, Portuguese, Italian, Russian, Turkish, Arabic, Simplified Chinese, Japanese, Korean). Field-name rules are written in twelve languages, so detection does not depend on the document's language matching a preset.");
  lines.push("- Formats: PNG, JPEG, WebP, up to 25 MB and 40 million pixels.");
  lines.push("- Output: PNG. Three fill styles — solid black, solid white, pixelate.");
  lines.push("- No server round-trip: once the page and its recognition models are in memory, redacting and exporting issue no further requests. There is no service worker, so this is not an offline-first app and reloading without a connection will not work.");
  lines.push("- Not available: face or license-plate detection, PDF input, batch processing, and editing anything other than an image. Blurring is deliberately not offered as a redaction method because light blur can be reversed.");
  lines.push("");

  lines.push("## Pages");
  lines.push("");
  for (const item of TRUST_PAGES) {
    lines.push(`- [${item.title}](${SITE_URL}${item.path}): ${item.summary}`);
  }
  for (const item of SCENARIOS) {
    lines.push(`- [${item.title}](${SITE_URL}${scenarioHref(item.slug)}): ${item.description}`);
  }
  for (const item of GUIDES) {
    lines.push(`- [${item.title}](${SITE_URL}${guideHref(item.slug)}): ${item.description}`);
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- The tool is free and has no paid tier. There is no signup, so no user counts or ratings can be quoted.");
  lines.push("- Auto-detect is a review aid, not a guarantee: it can miss text too small to recognize, stylized digits, and anything printed as an image rather than text. The page states this in the product itself, next to every result.");

  return lines.join("\n");
}

export function GET() {
  return new Response(`${body()}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
