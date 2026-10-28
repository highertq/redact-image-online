import { TYPE_LABELS } from "@/lib/detect-types";
import type { Rect } from "@/lib/geometry";

/**
 * Painting the editing canvas: the picture, then one overlay per box.
 *
 * Kept apart from the pointer hook on purpose. This function is pure apart from
 * the context it draws into, so the rules that decide *what a box looks like* —
 * selected vs skipped vs in-progress, and which text a box is tagged with — are
 * testable without a DOM.
 */

const OUTLINE = "rgba(239, 68, 68, 0.9)";
const OUTLINE_SELECTED = "rgba(59, 130, 246, 1)";
const GHOST_FILL = "rgba(239, 68, 68, 0.2)";
const LABEL_BG = "rgba(185, 28, 28, 0.95)";
const LABEL_BG_SELECTED = "rgba(37, 99, 235, 0.95)";
// A skipped box is a marker, not a redaction: grey and empty, so the editing
// canvas shows exactly what the export will contain.
const OUTLINE_SKIPPED = "rgba(115, 115, 115, 0.9)";
const LABEL_BG_SKIPPED = "rgba(82, 82, 82, 0.95)";

export type PaintState = {
  ctx: CanvasRenderingContext2D;
  bitmap: ImageBitmap;
  /** Canvas backing-store size, in image pixels. */
  canvasWidth: number;
  canvasHeight: number;
  imageWidth: number;
  rects: readonly Rect[];
  /** The rectangle being dragged right now, if any. */
  ghost: Rect | null;
  selectedIndex: number;
};

/**
 * The label drawn above a box. The human-readable type name, never the internal
 * key: a tag reading "credit_card" or "labelled" on someone's screenshot is an
 * implementation detail leaking into the product.
 */
export function labelTag(rect: Rect): string | null {
  if (!rect.label) {
    return null;
  }
  return TYPE_LABELS[rect.label] ?? rect.label;
}

export function paint({
  ctx,
  bitmap,
  canvasWidth,
  canvasHeight,
  imageWidth,
  rects,
  ghost,
  selectedIndex,
}: PaintState): void {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(bitmap, 0, 0, canvasWidth, canvasHeight);

  const scale = canvasWidth / imageWidth;
  // Outlines and label text live in image space, so each is divided by the scale
  // to keep the same apparent size whether the canvas is 390 or 4000 px wide.
  const line = Math.max(1.5, 2 / scale);
  const boxes = ghost ? [...rects, ghost] : rects;

  for (let index = 0; index < boxes.length; index += 1) {
    const rect = boxes[index];
    if (rect.w <= 0 || rect.h <= 0) {
      continue;
    }
    const isGhost = ghost !== null && index === boxes.length - 1;
    const isSelected = !isGhost && index === selectedIndex;
    const isSkipped = !isGhost && rect.skip === true;

    if (!isSkipped) {
      ctx.fillStyle = GHOST_FILL;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.lineWidth = line;
    ctx.strokeStyle = isSelected
      ? OUTLINE_SELECTED
      : isSkipped
        ? OUTLINE_SKIPPED
        : OUTLINE;
    ctx.setLineDash(isSelected ? [] : [line * 3, line * 2]);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.setLineDash([]);

    const tag = isGhost ? null : labelTag(rect);
    if (!tag) {
      continue;
    }

    const fontSize = 12 / scale;
    const padX = 4 / scale;
    const padY = 3 / scale;
    ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
    const textWidth = ctx.measureText(tag).width;
    const boxW = textWidth + padX * 2;
    const boxH = fontSize + padY * 2;

    ctx.fillStyle = isSelected
      ? LABEL_BG_SELECTED
      : isSkipped
        ? LABEL_BG_SKIPPED
        : LABEL_BG;
    ctx.fillRect(rect.x, rect.y - boxH - line, boxW, boxH);
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    ctx.fillText(tag, rect.x + padX, rect.y - boxH - line + padY);
  }
}
