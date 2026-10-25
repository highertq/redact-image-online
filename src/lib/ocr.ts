import type { OcrWord } from "@/lib/pii-boxes";

export type { OcrWord };

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
  onProgress?: (p: number) => void,
): Promise<OcrWord[]> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng", undefined, {
    logger: (message: { status: string; progress: number }) => {
      if (!onProgress) {
        return;
      }
      if (typeof message.progress === "number") {
        onProgress(Math.min(1, Math.max(0, message.progress)));
      }
    },
  });

  try {
    // `blocks` defaults to false in tesseract.js, so word/line geometry is only
    // returned when it is requested explicitly. Without this the result carries
    // text and nothing else, and every auto-detect pass yields zero boxes.
    const result = await worker.recognize(canvas, {}, { text: true, blocks: true });
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
  } finally {
    await worker.terminate();
  }
}
