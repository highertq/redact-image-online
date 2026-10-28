/**
 * Copies the OCR runtime assets out of node_modules into public/ocr.
 *
 * Why this exists: without it, tesseract.js pulls its worker, WASM core, and
 * language data from cdn.jsdelivr.net at first run. That third-party fetch is
 * slow or unreachable for a large share of users, which makes auto-detect fail
 * with "couldn't load" rather than with a wrong answer. Serving the same bytes
 * from our own origin removes the dependency, keeps every request on the site
 * the user already loaded, and means no request ever goes to a third party.
 *
 * The files are build artifacts, not source: public/ocr is gitignored and this
 * script runs from `predev` and `prebuild`, so a checkout always gets assets
 * matching the exact package versions in the lockfile.
 */
import { copyFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "ocr");

/**
 * Only the LSTM core variants are copied. tesseract.js runs with
 * `oem = OEM.LSTM_ONLY`, so it asks for exactly one of these three depending on
 * the device's WASM SIMD support; the legacy-model builds would be dead weight.
 */
const CORE_VARIANTS = [
  "tesseract-core-lstm.wasm.js",
  "tesseract-core-simd-lstm.wasm.js",
  "tesseract-core-relaxedsimd-lstm.wasm.js",
];

/** `4.0.0_best_int` is the quantised LSTM-only traineddata, the smallest set. */
const LANGUAGES = ["eng", "chi_sim"];

const copies = [];

copies.push({
  from: join(root, "node_modules/tesseract.js/dist/worker.min.js"),
  to: join(out, "worker.min.js"),
});

for (const file of CORE_VARIANTS) {
  copies.push({
    from: join(root, "node_modules/tesseract.js-core", file),
    to: join(out, "core", file),
  });
}

for (const lang of LANGUAGES) {
  copies.push({
    from: join(
      root,
      `node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`,
    ),
    to: join(out, "langs", `${lang}.traineddata.gz`),
  });
}

mkdirSync(join(out, "core"), { recursive: true });
mkdirSync(join(out, "langs"), { recursive: true });

let bytes = 0;
for (const { from, to } of copies) {
  if (!existsSync(from)) {
    console.error(
      `[ocr-assets] missing source: ${from}\n` +
        "Run `npm install` first — the OCR assets come from the packages in the lockfile.",
    );
    process.exit(1);
  }
  copyFileSync(from, to);
  bytes += readFileSync(to).byteLength;
}

// Long cache: filenames are version-locked by the lockfile, and a rebuild that
// changes bytes is deployed as a new build, so stale assets cannot mix in.
const list = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
console.log(
  `[ocr-assets] ${copies.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB` +
    ` (tesseract.js ${list.dependencies?.["tesseract.js"] ?? "?"})`,
);
