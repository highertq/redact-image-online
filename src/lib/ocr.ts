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
 * Recognition languages. The UI speaks in these three settings; tesseract gets
 * the language codes behind them.
 *
 * `both` is the default. Loading `chi_sim` costs 1.7 MB once, and the failure it
 * prevents — a Chinese bill returning "no sensitive patterns found" — is the
 * kind of wrong answer no follow-up can undo.
 */
export type OcrLangsMode = "en" | "zh" | "both";

export const OCR_LANGS_DEFAULT: OcrLangsMode = "both";

const TESSERACT_LANGS: Record<OcrLangsMode, string> = {
  en: "eng",
  zh: "chi_sim",
  both: "eng+chi_sim",
};

export function isOcrLangsMode(value: unknown): value is OcrLangsMode {
  return value === "en" || value === "zh" || value === "both";
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
  langsMode: OcrLangsMode,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrWord[]> {
  const langs = TESSERACT_LANGS[langsMode];
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
