import type { OcrWord } from "@/lib/pii-boxes";

export type { OcrWord };

/**
 * Which part of the pipeline is currently busy. The distinction matters to the
 * user: the first two mean "downloading assets", the third means "actually
 * reading the image", and only the third has a meaningful percentage.
 */
export type OcrStage = "loading-engine" | "loading-language" | "reading";

export type OcrProgress = {
  stage: OcrStage;
  /** 0..1. Only meaningful while `stage` is "reading". */
  progress: number;
};

/**
 * The worker, WASM core, or language data could not be fetched. Almost always a
 * network problem, so the UI can suggest retrying rather than blaming the image.
 */
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

/**
 * Runs OCR entirely in the browser. tesseract.js is imported dynamically so the
 * ~megabyte worker bundle never ships in the initial page payload, and the
 * worker is always terminated, including on failure.
 *
 * `lineId` is the running index of recognized text lines across the page, which
 * is what `wordsToBoxes` groups by.
 */
export async function recognizeWords(
  canvas: HTMLCanvasElement,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrWord[]> {
  let worker: Awaited<ReturnType<typeof createWorkerLazily>>;
  try {
    worker = await createWorkerLazily(onProgress);
  } catch (error) {
    // Fetching the worker/WASM/language files happens inside createWorker.
    throw new OcrLoadError("Could not load the recognition engine.", {
      cause: error,
    });
  }

  try {
    // `blocks` defaults to false in tesseract.js, so word/line geometry is only
    // returned when it is requested explicitly. Without this the result carries
    // text and nothing else, and every auto-detect pass yields zero boxes.
    const result = await worker.recognize(canvas, {}, { text: true, blocks: true });
    return collectWords(result);
  } catch (error) {
    throw new OcrRecognizeError("Text recognition failed.", { cause: error });
  } finally {
    try {
      await worker.terminate();
    } catch {
      // Terminating a worker that never fully started is not worth reporting.
    }
  }
}

async function createWorkerLazily(onProgress?: (p: OcrProgress) => void) {
  // Kept inside a function so the dynamic import stays lazy: hoisting it to
  // module scope would pull tesseract into the initial page bundle.
  const { createWorker } = await import("tesseract.js");

  return createWorker("eng", undefined, {
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

function collectWords(result: OcrResult): OcrWord[] {
  const blocks = result.data.blocks ?? [];
  const words: OcrWord[] = [];
  let lineId = 0;

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
            x0: bbox.x0,
            y0: bbox.y0,
            x1: bbox.x1,
            y1: bbox.y1,
            lineId,
          });
        }
        lineId += 1;
      }
    }
  }

  return words;
}
