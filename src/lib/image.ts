import type { Rect } from "@/lib/geometry";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_PIXELS = 40_000_000;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type FillStyle = "black" | "white" | "pixelate";

export const MIN_PIXELATE_BLOCK = 12;

export type RejectReason =
  | "unsupported-type"
  | "too-large"
  | "too-many-pixels"
  | "decode-failed";

export const REJECT_MESSAGES: Record<RejectReason, string> = {
  "unsupported-type": "Only PNG, JPEG, and WebP images are supported.",
  "too-large": "That file is larger than 25 MB. Please use a smaller image.",
  "too-many-pixels":
    "That image has more than 40 million pixels. Please use a smaller image.",
  "decode-failed": "That image could not be opened. The file may be damaged.",
};

export function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validates type and byte size before decoding. Returns a reason when rejected. */
export function validateFileMeta(
  type: string,
  size: number,
): RejectReason | null {
  if (!ACCEPTED_TYPES.includes(type as (typeof ACCEPTED_TYPES)[number])) {
    return "unsupported-type";
  }
  if (size > MAX_FILE_BYTES) {
    return "too-large";
  }
  return null;
}

/** Validates decoded pixel dimensions. */
export function validateDimensions(
  width: number,
  height: number,
): RejectReason | null {
  if (!(width > 0) || !(height > 0)) {
    return "decode-failed";
  }
  if (width * height > MAX_PIXELS) {
    return "too-many-pixels";
  }
  return null;
}

/**
 * Block size for pixelation. Kept at 12 px minimum and scaled up on large
 * images so the mosaic stays clearly destructive.
 */
export function pixelateBlockSize(width: number, height: number): number {
  const longest = Math.max(width, height);
  const scaled = Math.round(longest / 150);
  return Math.max(MIN_PIXELATE_BLOCK, scaled);
}

/** Strips any directory path and extension, then appends the png suffix. */
export function outputFileName(sourceName: string): string {
  const base = sourceName.split(/[\\/]/).pop() ?? "image";
  const withoutExt = base.replace(/\.[^.]+$/, "");
  const safe = withoutExt.trim() === "" ? "image" : withoutExt.trim();
  return `redacted-${safe}.png`;
}

/**
 * Resolves the fill style for one box: its own override if it has one, otherwise
 * the toolbar default. Kept as a function so the inheritance rule lives in a
 * single testable place instead of being repeated at every call site.
 */
export function resolveStyle(rect: Rect, fallback: FillStyle): FillStyle {
  return rect.style ?? fallback;
}

/**
 * True when the box must be painted into the export. A skipped box is a marker
 * on the editing canvas only — the exported PNG keeps the original pixels there.
 */
export function isRedacted(rect: Rect): boolean {
  return rect.skip !== true;
}

/**
 * Paints one redaction rect. Pixelate samples the source first, then covers the
 * area with opaque blocks so nothing survives underneath. `blockSize` is in
 * image pixels and never drops below the 12 px floor.
 */
export function paintRedaction(
  target: CanvasRenderingContext2D,
  source: CanvasImageSource,
  rect: Rect,
  style: FillStyle,
  blockSize: number = MIN_PIXELATE_BLOCK,
): void {
  const { x, y, w, h } = rect;
  if (w <= 0 || h <= 0) {
    return;
  }

  if (style === "black" || style === "white") {
    target.fillStyle = style === "black" ? "#000000" : "#ffffff";
    target.fillRect(x, y, w, h);
    return;
  }

  const block = Math.max(MIN_PIXELATE_BLOCK, Math.round(blockSize));
  const dw = Math.max(1, Math.round(w));
  const dh = Math.max(1, Math.round(h));
  const sample = document.createElement("canvas");
  sample.width = Math.max(1, Math.ceil(dw / block));
  sample.height = Math.max(1, Math.ceil(dh / block));
  const sampleCtx = sample.getContext("2d");
  if (!sampleCtx) {
    target.fillStyle = "#000000";
    target.fillRect(x, y, w, h);
    return;
  }

  sampleCtx.drawImage(source, x, y, w, h, 0, 0, sample.width, sample.height);

  // Base layer first: a fully opaque black block covering the whole rect guarantees
  // no gap and no half-transparent seam regardless of how the mosaic lands.
  target.fillStyle = "#000000";
  target.fillRect(x, y, w, h);

  // Then the mosaic on top, in whole pixels with smoothing off so the blocks stay
  // hard-edged instead of picking up anti-aliased borders.
  target.imageSmoothingEnabled = false;
  target.drawImage(sample, 0, 0, sample.width, sample.height, x, y, dw, dh);
  target.imageSmoothingEnabled = true;
}
