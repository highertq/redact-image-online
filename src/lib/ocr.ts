import type { OcrWord } from "@/lib/pii-boxes";

export type { OcrWord };

/**
 * Which part of the pipeline is currently busy. The distinction matters to the
 * user: the first two mean "downloading assets", the third means "actually
 * reading the image", and only the third has a meaningful percentage.
 */
export type OcrStage = "loading-engine" | "loading-language" | "reading";

/**
 * The decoded original picture. Recognition consumes this rather than the
 * on-screen canvas so the tool's own overlay can never be read as document text.
 */
export type OcrSource = {
  bitmap: ImageBitmap;
  width: number;
  height: number;
};

export type OcrProgress = {
  stage: OcrStage;
  /** 0..1. Only meaningful while `stage` is "reading". */
  progress: number;
};

/**
 * A recognisable language the visitor can switch on.
 *
 * `bytes` is the compressed model size we serve, shown next to each option so
 * the choice is made with the real cost visible rather than discovered on a
 * phone connection.
 */
export type OcrPack = {
  id: string;
  /** Endonym — the language's own name for itself. */
  label: string;
  bytes: number;
};

/**
 * The packs we ship. Chosen for script coverage rather than speaker count: one
 * Latin pack already gets you most of Western Europe's digits and letterforms,
 * so the marginal value of `nld` after `deu` is small, while Cyrillic, Arabic,
 * Han and Kana each unlock a script nothing else covers.
 */
export const OCR_PACKS: readonly OcrPack[] = [
  { id: "eng", label: "English", bytes: 2_952_873 },
  { id: "spa", label: "Español", bytes: 2_100_190 },
  { id: "fra", label: "Français", bytes: 707_406 },
  { id: "deu", label: "Deutsch", bytes: 1_333_102 },
  { id: "por", label: "Português", bytes: 1_392_239 },
  { id: "ita", label: "Italiano", bytes: 1_660_998 },
  { id: "rus", label: "Русский", bytes: 2_679_598 },
  { id: "tur", label: "Türkçe", bytes: 2_141_291 },
  { id: "ara", label: "العربية", bytes: 1_661_906 },
  { id: "chi_sim", label: "简体中文", bytes: 1_718_768 },
  { id: "jpn", label: "日本語", bytes: 2_030_256 },
  { id: "kor", label: "한국어", bytes: 1_572_336 },
];

/**
 * Default selection: English (the digit and Latin letterforms every other pack
 * also needs a fallback for), Spanish (the second language of the site's main
 * audience, and of much of the Western hemisphere's paperwork), and Simplified
 * Chinese (Han characters, which also carry a useful share of Japanese text).
 *
 * Measured on mock bills for all three scripts, adding these to one another
 * costs about 0.1-0.4 s per pass and loses no detections; loading none of them
 * is what loses detections — a document in an unread script comes back "nothing
 * sensitive here", which is the one answer a privacy tool must not give
 * confidently. Anyone redacting Japanese, Russian or Arabic paperwork ticks one
 * more box, and that choice is remembered.
 */
export const OCR_PACKS_DEFAULT: readonly string[] = ["eng", "spa", "chi_sim"];

/**
 * tesseract merges the selected models into one recogniser. Each extra language
 * adds download weight and dilutes accuracy, and past about four the result
 * starts misreading text it handled fine alone — so the list is capped rather
 * than "select everything".
 */
export const OCR_PACKS_MAX = 4;

const PACK_IDS = new Set(OCR_PACKS.map((pack) => pack.id));

export function isOcrPackId(value: unknown): value is string {
  return typeof value === "string" && PACK_IDS.has(value);
}

/** Language string in the form tesseract wants: "eng+spa+chi_sim". */
export function tesseractLangs(ids: readonly string[]): string {
  const clean = ids.filter(isOcrPackId);
  return (clean.length > 0 ? clean : [...OCR_PACKS_DEFAULT]).join("+");
}

/**
 * Every OCR asset is served from this origin. tesseract.js defaults to
 * cdn.jsdelivr.net for the worker, the WASM core, and the traineddata files;
 * that host is slow or unreachable for a significant share of users, and when it
 * fails the whole feature reads as broken. `scripts/copy-ocr-assets.mjs` puts
 * the byte-identical files in `public/ocr` at build time from the versions pinned
 * in the lockfile, so nothing here depends on a third party.
 */
const OCR_ASSET_PATHS = {
  workerPath: "/ocr/worker.min.js",
  corePath: "/ocr/core",
  langPath: "/ocr/langs",
} as const;

/**
 * Recognition runs on a downscaled copy. Cost of a pass grows with pixel count,
 * and a 12 MP photo would take tens of seconds and enough WASM memory to make
 * mobile Safari kill the tab. 4 MP keeps phone-screenshot text at roughly the
 * 20+ px glyph height tesseract needs while bounding the work.
 */
export const OCR_MAX_PIXELS = 4_000_000;

/**
 * Scale factor for a recognition pass: 1 when the image already fits inside the
 * pixel budget, otherwise the factor that makes it fit. Coordinates come back
 * multiplied by this, and the caller divides them out.
 */
export function ocrScaleFor(width: number, height: number): number {
  if (!(width > 0) || !(height > 0)) {
    return 1;
  }
  const pixels = width * height;
  if (pixels <= OCR_MAX_PIXELS) {
    return 1;
  }
  return Math.sqrt(OCR_MAX_PIXELS / pixels);
}

/** The engine, WASM core, or language data could not be fetched. */
export class OcrLoadError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "OcrLoadError";
  }
}

/** The image reached the engine but recognition itself threw. */
export class OcrRecognizeError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "OcrRecognizeError";
  }
}

/**
 * tesseract reports free-form status strings. Anything emitted before the
 * recognizer starts belongs to the loading phase; `recognizing text` is the only
 * one that reflects real progress on this image.
 */
function stageFor(status: string): OcrStage {
  const normalized = status.toLowerCase();
  if (normalized.includes("recognizing")) {
    return "reading";
  }
  if (normalized.includes("language") || normalized.includes("lstm")) {
    return "loading-language";
  }
  return "loading-engine";
}

type Worker = Awaited<ReturnType<typeof createWorkerLazily>>;

/**
 * One worker is kept alive between passes and reused while the language setting
 * is unchanged. Re-creating it means re-initialising a 20 MB WASM heap on every
 * click, which is the difference between a second and ten seconds on a phone.
 * The cache is dropped on any failure so a broken worker never sticks.
 */
let workerPromise: Promise<Worker> | null = null;
let workerLangs: string | null = null;

async function releaseWorker(): Promise<void> {
  const pending = workerPromise;
  workerPromise = null;
  workerLangs = null;
  if (!pending) {
    return;
  }
  try {
    const worker = await pending;
    await worker.terminate();
  } catch {
    // A worker that never finished starting has nothing to terminate.
  }
}

async function getWorker(
  langs: string,
  onProgress?: (p: OcrProgress) => void,
): Promise<Worker> {
  if (workerPromise && workerLangs === langs) {
    return workerPromise;
  }
  if (workerPromise) {
    await releaseWorker();
  }

  const pending = createWorkerLazily(langs, onProgress);
  workerPromise = pending;
  workerLangs = langs;
  try {
    return await pending;
  } catch (error) {
    workerPromise = null;
    workerLangs = null;
    throw error;
  }
}

async function createWorkerLazily(
  langs: string,
  onProgress?: (p: OcrProgress) => void,
) {
  // Kept inside a function so the dynamic import stays lazy: hoisting it to
  // module scope would pull tesseract into the initial page bundle.
  const { createWorker } = await import("tesseract.js");

  return createWorker(langs, undefined, {
    ...OCR_ASSET_PATHS,
    logger: (message: { status: string; progress: number }) => {
      if (!onProgress) {
        return;
      }
      const stage = stageFor(message.status);
      const clamped =
        typeof message.progress === "number"
          ? Math.min(1, Math.max(0, message.progress))
          : 0;
      onProgress({ stage, progress: clamped });
    },
  });
}

type OcrResult = Awaited<
  ReturnType<Awaited<ReturnType<typeof createWorkerLazily>>["recognize"]>
>;

/**
 * Draws the source onto a canvas at recognition resolution and hands the worker
 * a PNG blob.
 *
 * The source is the decoded original, never the editing canvas: that canvas
 * carries the red overlay and the type labels drawn on top of the picture, and a
 * second pass reading them would treat "Phone" painted by the tool as text that
 * exists in the image.
 *
 * A blob is passed rather than a canvas element because tesseract.js reads a
 * canvas through `toBlob` with no failure path: if the browser returns null under
 * memory pressure — which mobile Safari does — that promise never settles and
 * the UI hangs on "Reading text…". Here a null blob is an error the caller can
 * report.
 */
async function prepareImage(source: OcrSource, scale: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new OcrLoadError("Could not prepare the image for reading.");
  }
  ctx.drawImage(source.bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/png");
  });
  if (!blob) {
    throw new OcrLoadError("Could not prepare the image for reading.");
  }
  return blob;
}

/**
 * Runs OCR entirely in the browser and returns word boxes in the source image's
 * own pixel space, regardless of the scale the recognition pass ran at.
 *
 * `lineId` is the running index of recognised text lines, which is what
 * `groupLines` folds into rows for the pattern and label rules.
 */
export async function recognizeWords(
  source: OcrSource,
  packIds: readonly string[],
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrWord[]> {
  const langs = tesseractLangs(packIds);
  const scale = ocrScaleFor(source.width, source.height);

  let worker: Worker;
  try {
    worker = await getWorker(langs, onProgress);
  } catch (error) {
    // Fetching the worker/WASM/language files happens inside createWorker.
    throw new OcrLoadError("Could not load the recognition engine.", {
      cause: error,
    });
  }

  try {
    const image = await prepareImage(source, scale);
    // `blocks` defaults to false in tesseract.js, so word/line geometry is only
    // returned when it is requested explicitly. Without this the result carries
    // text and nothing else, and every pass yields zero boxes.
    const result = await worker.recognize(image, {}, { text: true, blocks: true });
    return collectWords(result, scale);
  } catch (error) {
    if (error instanceof OcrLoadError) {
      throw error;
    }
    throw new OcrRecognizeError("Text recognition failed.", { cause: error });
  }
}

function collectWords(result: OcrResult, scale: number): OcrWord[] {
  const blocks = result.data.blocks ?? [];
  const words: OcrWord[] = [];
  let lineId = 0;
  // Boxes come back in downscaled pixels; divide them out so every coordinate
  // the editor stores lives in original image space.
  const back = 1 / scale;

  for (const block of blocks) {
    const paragraphs = block.paragraphs ?? [];
    for (const paragraph of paragraphs) {
      const lines = paragraph.lines ?? [];
      for (const line of lines) {
        const lineWords = line.words ?? [];
        for (const item of lineWords) {
          const text = item.text?.trim();
          if (!text) {
            continue;
          }
          const bbox = item.bbox;
          words.push({
            text,
            x0: bbox.x0 * back,
            y0: bbox.y0 * back,
            x1: bbox.x1 * back,
            y1: bbox.y1 * back,
            lineId,
          });
        }
        lineId += 1;
      }
    }
  }

  return words;
}
