# RedactMy.pics

A free, browser-only tool for redacting private details in an image before you
share it. The image is decoded and redacted in the tab, and the export is a
freshly encoded PNG.

- No uploads, no server-side processing, no accounts.
- Solid fill replaces pixels rather than blurring them.
- The export is re-encoded from a canvas, so EXIF metadata is dropped.
- Auto-detect reads text patterns (email, phone, SSN, card numbers, API keys)
  using a text recognition library that runs locally.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run test
npm run build
```

Stack: Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
There is no database, no authentication, no API route, and no server action.

## Content pages

The scenarios under `/redact-*` and the guides under `/guides/*` are data
driven. Each page is one record in `src/lib/content/`:

| File | Holds |
| --- | --- |
| `types.ts` | `Scenario` and `Guide` shapes |
| `scenarios-identity.ts` | SSN, card number, email address |
| `scenarios-documents.ts` | Screenshot, bank statement, receipt |
| `scenarios.ts` | Scenario registry, lookup, related-page resolution |
| `guides.ts` | Guide records |
| `guides-index.ts` | Guide registry |
| `dates.ts` | `CONTENT_DATE`, used for `dateModified` and the sitemap |

Adding a page means adding a record plus a thin `page.tsx` that binds it to
`ScenarioPage` or `GuidePage`. The sitemap and every navigation block are derived
from the registries, so nothing has to be listed twice. The build fails loudly if
a record references a slug that does not exist.

Verify a content change with:

```bash
npm run lint && npm run test && npm run build
```

Then check the built HTML rather than the build log: word count, a single `<h1>`,
a self-referencing canonical, `og:image` present, and JSON-LD that parses.

## Static assets

`og-image.png`, `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` are
generated, not hand-drawn:

```bash
python scripts/make-assets.py    # requires Pillow
```

Edit the script and re-run it rather than replacing the PNGs in place, so the
card and the icon set stay consistent.

## Before going live

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the deployed origin (for example
      `https://redactmy.pics`). The code already defaults to
      `https://redactmy.pics` when this is unset, but until the variable is
      defined `IS_LIVE` stays false, the site sends `noindex, nofollow`, and
      `robots.txt` disallows everything.
- [ ] Fill in `CONTACT_EMAIL` in `src/lib/site.ts` if you want a contact address
      to appear on the About and Privacy pages. Leave it empty to hide that line.
- [ ] Bind the custom domain in Vercel and confirm HTTPS works on the apex and
      the `www` host.
- [ ] Verify `/sitemap.xml` and `/robots.txt` on the live domain, then submit the
      sitemap in Google Search Console.
