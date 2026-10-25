# RedactMy.pics Audit

**Audit date:** 2026-10-25
**Scope:** `src/`, `package.json`, production dependency tree
**Constraint:** read-only audit. No source file was modified.

## Summary

No claim in `PROJECT.md` is rated FALSE. One claim is UNVERIFIED because it can
only be settled in a real browser, and two page statements are UNVERIFIED for the
same reason. The network-request search found **zero** hits in `src/`, and the
only outbound requests the app can make are static asset downloads by the OCR
library, which never carry image data.

| # | Claim (PROJECT.md "产品") | Verdict |
|---|---|---|
| 1 | Image never leaves the device: no upload, no server processing, no request carrying image data | **TRUE** (with one documented caveat about non-image CDN traffic) |
| 2 | Real redaction: default solid fill replaces pixels, unrecoverable | **TRUE** for the default; pixelate path documented below |
| 3 | PNG is re-encoded from canvas, so EXIF and other metadata are removed | **UNVERIFIED** (code path is correct; needs a browser check) |

---

## 1. Network, form, and server-surface search

Searched `src/` for: `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`,
`EventSource`, `axios`, `<form`, `action=`, `"use server"`, `route.ts`,
`localStorage`, `sessionStorage`, `indexedDB`, plus a tracking-script list
(`gtag`, `analytics`, `googletagmanager`, `fbq`, `mixpanel`, `segment`, `posthog`,
`hotjar`, `clarity`, `plausible`, `umami`, `matomo`, `sentry`, `datadog`,
`fullstory`, `amplitude`) and `<Script>` / `next/script`.

### Network and process APIs

| Pattern | Hits | Files / lines |
| --- | --- | --- |
| `fetch(` | 0 | — |
| `XMLHttpRequest` | 0 | — |
| `sendBeacon` | 0 | — |
| `WebSocket` | 0 | — |
| `EventSource` | 0 | — |
| `axios` | 0 | — |

**Image-data risk: none.** There is no code path in the application that can
transmit bytes to a remote host.

### Forms

| Pattern | Hits | Files / lines |
| --- | --- | --- |
| `<form` | 0 | — |
| `action=` | 0 | — |

File input uses `<input type="file">` with an `onChange` handler, not a form
submission. **Image-data risk: none.**

### Server surface

| Pattern | Hits | Files / lines |
| --- | --- | --- |
| `"use server"` | 0 | — |
| `route.ts` | 0 | — |
| `middleware.ts` | 0 | — |

`src/app/` contains only `page.tsx`, `layout.tsx`, `not-found.tsx`, `robots.ts`,
`sitemap.ts`, `icon.svg`, `globals.css`, `privacy/`, and `about/`. There is no API
route, no server action, and no middleware. This matches the "无 API 路由、无
server actions" statement in `PROJECT.md`.

### Client-side persistence

| Pattern | Hits |
| --- | --- |
| `localStorage` | 0 |
| `sessionStorage` | 0 |
| `indexedDB` | 0 |

Nothing survives a reload. This supports the homepage sentence "If you reload the
page, the image and your boxes are gone."

### Tracking and analytics

Two hits, both prose, not code:

- `src/app/privacy/page.tsx:80` — the `<h2>` text "No analytics or advertising"
- `src/app/privacy/page.tsx:83` — the sentence "We do not run analytics,
  advertising, or tracking scripts on this site."

No `<Script>` or `next/script` usage exists. **Verdict: the site runs no
analytics, advertising, or tracking code.**

### Third-party network behaviour (outside `src/`)

The one place a remote request can originate is `tesseract.js`, which is imported
dynamically in `src/lib/ocr.ts:17` (`const { createWorker } = await import("tesseract.js")`). Its default
browser options fetch three static assets from jsDelivr:

- `node_modules/tesseract.js/src/worker/browser/defaultOptions.js:11` —
  `workerPath` → `https://cdn.jsdelivr.net/npm/tesseract.js@v…/dist/worker.min.js`
- `node_modules/tesseract.js/src/worker-script/browser/getCore.js:14` —
  `corePath` → `https://cdn.jsdelivr.net/npm/tesseract.js-core@v…`
- `node_modules/tesseract.js/src/worker-script/index.js:130` — `langPath` →
  `https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0…`

`node_modules/tesseract.js/src/worker/browser/loadImage.js:43` contains a
`fetch(image)` call. **This is the one line that could in principle send an image
over the network, so it was traced:**

- The `fetch` branch only runs when `typeof image === 'string'` and the string is
  not a `data:` URL (lines 36–45).
- The application always passes an `HTMLCanvasElement`. `src/lib/ocr.ts:14`
  types the parameter as `HTMLCanvasElement` and line 31 calls
  `worker.recognize(canvas)` with no string form.
- For a canvas, `loadImage.js` lines 53–59 use `image.toBlob()` +
  `FileReader.readAsArrayBuffer`, which is entirely local.

**Conclusion: the `fetch` at `loadImage.js:43` is unreachable in this app. The
three jsDelivr requests download code and language data only. No image bytes and
no data derived from the image are transmitted.**

---

## 2. Dependencies

### Runtime dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `next` | 16.4.3 | App Router framework, static rendering, metadata routes (`sitemap.ts`, `robots.ts`), image/icon handling |
| `react` | 19.3.0 | UI rendering for the editor and content pages |
| `react-dom` | 19.3.0 | React DOM bindings |
| `tesseract.js` | ^7.0.0 | In-browser OCR used by auto-detect. Loaded with a dynamic `import()` so it stays out of the initial bundle |

### Development dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `@tailwindcss/turbopack` | ^4 | Tailwind v4 loader wired into `next.config.ts` under `turbopack.rules` |
| `tailwindcss` | ^4 | Utility CSS engine |
| `typescript` | ^5 | Type checking |
| `@types/node`, `@types/react`, `@types/react-dom` | ^24 / ^19 / ^19 | Type definitions |
| `eslint` | ^9 | Linting (`npm run lint` runs `eslint`) |
| `eslint-config-next` | 16.4.3 | Next.js lint rules, including the React Hooks ruleset that caught `set-state-in-effect` |
| `vitest` | ^5.0.5 | Unit test runner for the pure functions (`npm run test` runs `vitest run`) |

No test-environment packages (jsdom, happy-dom, canvas) are installed;
`vitest.config.mts` sets `environment: "node"` and tests only pure functions.

`npm ls --omit=dev --depth=0` also reports six `extraneous` packages that are not
declared in `package.json` (`@emnapi/core`, `@emnapi/runtime`,
`@emnapi/wasi-threads`, `@img/sharp-wasm32`, `@napi-rs/wasm-runtime`,
`@tybys/wasm-util`). These are optional native/WASM shims pulled in transitively
by Next.js tooling. **This is a lockfile hygiene issue, not a shipped-code
dependency.**

---

## 3. Claim-by-claim verification against PROJECT.md

### Claim 1 — "图片不离开用户设备：没有上传、没有服务端处理、没有任何网络请求携带图片数据"

**Verdict: TRUE**

Evidence:

- No `fetch` / `XMLHttpRequest` / `sendBeacon` / `WebSocket` anywhere in `src/`
  (section 1).
- No API route, server action, or middleware (section 1).
- Image intake is local: `src/hooks/useImageLoader.ts:36` sets
  `element.src = url` where `url` comes from `URL.createObjectURL(file)`, i.e. a
  `blob:` URL handled in-process. The URL is revoked in the `finally` block.
- The exported PNG is produced by `offscreen.toBlob(...)` in
  `src/hooks/useExportPng.ts:53` and handed to an `<a download>` click, again via
  a short-lived blob URL that is revoked immediately after the click.
- OCR receives an `HTMLCanvasElement`, so tesseract's string-URL `fetch` branch is
  unreachable (section 1).

**Caveat to state plainly:** the app does make outbound requests — three jsDelivr
downloads for the OCR worker, WASM core, and English language data. Those requests
carry no image data. The claim as written ("没有任何网络请求携带图片数据") is
therefore satisfied, but the site must never be described as making *zero*
network requests.

### Claim 2 — "真正的涂黑：默认用纯黑填充，像素被替换，无法恢复"

**Verdict: TRUE for the default solid-black fill.**

Evidence:

- Default state is `useState<FillStyle>("black")` at
  `src/components/Redactor.tsx:27`.
- `src/lib/image.ts:92-96` sets `fillStyle = "#000000"` and calls `fillRect` over
  the whole rect. `fillRect` writes opaque pixels into the destination canvas;
  the original content underneath is overwritten, not composited over.
- No `globalAlpha` and no `globalCompositeOperation` appear anywhere in `src/`,
  so alpha stays at the default `1.0` with `source-over`.

**Documented nuance on the two non-default styles:**

- **Pixelate** (`src/lib/image.ts:98-122`) first paints an opaque black base over
  the entire rect (line 115–116), then draws a downsampled mosaic on top
  (line 121). The result is fully opaque, so nothing shows through from beneath.
  However, the mosaic is built from the original pixels at reduced resolution
  (line 111). "Unrecoverable" is therefore a weaker guarantee here than for solid
  fill, and the UI says so: the toolbar shows "Solid fill is the safest option.
  Pixelate can be less secure for small text."
- **Solid white** is identical to black except for the color.

### Claim 3 — "输出的 PNG 由 canvas 重新编码，因此 EXIF 等元数据会被移除"

**Verdict: UNVERIFIED**

What the code shows:

- `src/hooks/useExportPng.ts:38-39` creates a fresh canvas at the original image
  dimensions.
- Line 46 draws the decoded bitmap into it with `drawImage`.
- Line 53 encodes with `offscreen.toBlob(cb, "image/png")`.
- The original `File` is never copied, appended, or re-emitted; the export is
  built solely from the canvas pixel buffer.

This is the standard mechanism by which metadata is dropped: `toBlob` encodes
from pixels, and EXIF lives in the source file container, not in the pixel data.
The reasoning is sound, but **this audit could not observe the produced file**.
There is no browser in this environment, and no canvas implementation is installed
(no `canvas`, `jsdom`, or Playwright — none may be added, since `PROJECT.md`
forbids installing unrequested dependencies).

To close this item, someone must export a photo that has GPS EXIF and inspect the
output with `exiftool` or a metadata viewer. Until that happens, the code path is
correct but the outcome is unverified.

---

## 4. Statement-by-statement check of the visible pages

### Homepage (`src/app/page.tsx`)

| Statement | Verdict | Basis |
| --- | --- | --- |
| "This tool runs entirely in your browser" | TRUE | No server surface; all processing in hooks under `src/hooks/` |
| "Drag a PNG, JPEG, or WebP onto the page, paste it with Ctrl/Cmd+V, or pick a file" | TRUE | `ACCEPTED_TYPES` at `image.ts:5`; drop handlers and file input in `Redactor.tsx`; `window` `paste` listener in `useImageLoader.ts` |
| "Use Auto-detect sensitive text if you want the tool to look for emails, phone numbers, SSNs, card numbers, and API keys" | TRUE | `src/lib/pii.ts` implements exactly these six types; no face or address detection exists |
| "Solid black is the default" | TRUE | `Redactor.tsx:27` |
| "White works on dark screenshots" | TRUE (marketing framing) | `image.ts:93` implements white fill |
| "Pixelate … is weaker for small text" | TRUE (advisory) | Matches the implementation caveat in section 3 |
| "The file is rebuilt on a canvas at the original resolution" | TRUE | `useExportPng.ts:38-39` sets `width/height` from `image.width/height` |
| "13 to 19 digits that pass a checksum" (card numbers) | TRUE | `pii.ts:105` regex + `pii.ts:147` length guard + Luhn |
| "the 123-45-6789 shape" (SSN) | TRUE | `pii.ts` SSN regex requires `\d{3}[- ]\d{2}[- ]\d{4}` |
| "sk-, AKIA, and ghp_ prefixed strings" (API keys) | TRUE | `pii.ts:110-112` |
| "Faces — every face needs a hand-drawn box" | TRUE | No face detection code exists |
| "Home addresses / Names / License plates — draw a box yourself" | TRUE | No detection code for any of these |
| "Automatic detection … can miss something … Always review every box" | TRUE (advisory) | Consistent with the pattern-only implementation |
| "If you reload the page, the image and your boxes are gone" | TRUE | No `localStorage` / `sessionStorage` / `indexedDB`; state is in-memory only |
| "PNG, JPEG, and WebP, up to 25 MB and 40 million pixels" | TRUE | `MAX_FILE_BYTES` and `MAX_PIXELS` at `image.ts:3-4` |
| "Use the Undo button or Ctrl/Cmd+Z, and Redo or Ctrl/Cmd+Shift+Z" | TRUE | `useEditorShortcuts.ts:26-33` |
| "Clear all removes every box at once, and Start over loads a different image" | TRUE | `Redactor.tsx` handlers calling `commit([])` and `startOver` |
| "You can open the page on a phone or tablet and draw boxes with a finger" | TRUE in code / **UNVERIFIED on hardware** | `touchAction: "none"` at `Redactor.tsx:187`; pointer events in `useCanvasEditor.ts`. Requires a real touch device to confirm |
| "The export is a new PNG drawn on a fresh canvas, so … EXIF fields … are dropped" | **UNVERIFIED** | Same reasoning and same blocker as claim 3 |
| "the text-recognition library may download its language data from a public CDN" | TRUE | Three jsDelivr endpoints confirmed in section 1 |
| "That request fetches code and language files only. Your image is never part of it" | TRUE | `loadImage.js:43` fetch branch is unreachable for canvas input |

### Privacy page (`src/app/privacy/page.tsx`)

| Statement | Verdict | Basis |
| --- | --- | --- |
| "it is read by your browser and drawn on a canvas in the page" | TRUE | `useImageLoader.ts` → `useCanvasEditor.ts` |
| "There is no upload step" | TRUE | Section 1 |
| "You do not need to sign up or log in" | TRUE | No auth code, no accounts table, no server |
| "we do not keep a history of the images you open" | TRUE | Nothing is persisted client-side or server-side |
| "The site is hosted on Vercel. Like most hosting providers, Vercel may record standard server logs" | TRUE (accurate hedged wording) | Deployment target per `PROJECT.md`; the sentence claims possibility, not specifics |
| "Those logs … never contain your image, because your image is never sent to the server" | TRUE | Follows from section 1 |
| "those requests fetch static files only … do not include your image" | TRUE | Section 1 trace |
| "We do not run analytics, advertising, or tracking scripts on this site" | TRUE | Zero hits (section 1) |
| Contact section | CORRECTLY ABSENT | `CONTACT_EMAIL` is `""`, so the block is not rendered (verified: `grep -c "mailto:"` returns 0 in the built privacy page) |
| "Last updated: October 25, 2026" | TRUE | Matches `LAST_UPDATED` constant and the audit date |

### About page (`src/app/about/page.tsx`)

| Statement | Verdict | Basis |
| --- | --- | --- |
| "Boxes are filled with a solid color by default, which replaces the pixels underneath instead of smudging them" | TRUE | `image.ts:92-96` |
| "The export is rebuilt on a canvas, so metadata such as EXIF is not carried over" | **UNVERIFIED** | Same blocker as claim 3 |
| "Auto-detect looks for text patterns: email addresses, phone numbers, SSNs, card numbers, and API keys" | TRUE | Exactly the six types in `pii.ts` |
| "small fonts, low contrast, unusual layouts, and handwriting can all cause a miss" | TRUE (advisory) | Statement about limits, not a capability claim |
| "Faces, addresses, names, and license plates are not detected at all in this version" | TRUE | No such detection exists |
| "no detection result should be trusted on its own" | TRUE (advisory) | Consistent |
| Contact section | CORRECTLY ABSENT | `CONTACT_EMAIL` empty; `grep -c "mailto:"` returns 0 in the built about page |

---

## 5. `npm audit --omit=dev`

The first attempt failed for an environment reason, not a security finding:

```
npm warn audit 404 Not Found - POST https://registry.npmmirror.com/-/npm/v1/security/audits/quick
npm error audit endpoint returned an error
```

The configured registry is `registry.npmmirror.com`, which does not implement the
audit endpoint. Re-running against the public registry succeeded:

```
npm audit --omit=dev --registry=https://registry.npmjs.org
found 0 vulnerabilities
```

Cross-check with development dependencies included:

```
npm audit --registry=https://registry.npmjs.org
found 0 vulnerabilities
```

**Result: 0 vulnerabilities in both the production-only and full dependency trees.**

Caveat: this reflects the advisory database at audit time (2026-10-25) and the
lockfile as committed. Re-run after any dependency bump.

---

## 6. Follow-ups (not fixed, per audit scope)

1. **Verify EXIF removal in a real browser.** Export a photo with GPS EXIF and
   inspect the PNG. This is the only way to move claim 3 from UNVERIFIED to TRUE.
2. **Verify touch drawing on a real phone.** `touch-action: none` is in place, but
   actual multi-touch and scrolling behaviour needs hardware.
3. **Prune the six `extraneous` packages** reported by `npm ls --omit=dev`, e.g.
   by reinstalling from a clean lockfile. Cosmetic, but it makes the dependency
   tree honest.
4. **Consider self-hosting the OCR assets.** Optional. It would let the site claim
   zero outbound requests after first load, and would remove the jsDelivr
   dependency. Out of scope for this audit.
