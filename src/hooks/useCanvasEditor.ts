"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TYPE_LABELS } from "@/lib/detect-types";
import { clampRect, hitTest, normalizeRect, type Rect } from "@/lib/geometry";
import { lineAtPoint, uncoveredBox, wordInRect, type TextLine } from "@/lib/text-lines";
import type { LoadedImage } from "@/hooks/useImageLoader";

const MIN_DRAG_PX = 8;
/**
 * A pointer that barely moved is a tap, not a drag. Measured in CSS pixels
 * because that is what a finger actually travels: on a phone showing a 1170 px
 * screenshot at 390 px wide, a 6 px thumb jitter is 18 image pixels.
 */
const TAP_CSS_PX = 6;
const OUTLINE = "rgba(239, 68, 68, 0.9)";
const OUTLINE_SELECTED = "rgba(59, 130, 246, 1)";
const GHOST_FILL = "rgba(239, 68, 68, 0.2)";
const LABEL_BG = "rgba(185, 28, 28, 0.95)";
const LABEL_BG_SELECTED = "rgba(37, 99, 235, 0.95)";
// A skipped box is a marker, not a redaction: grey and empty, so the editing
// canvas shows exactly what the export will contain.
const OUTLINE_SKIPPED = "rgba(115, 115, 115, 0.9)";
const LABEL_BG_SKIPPED = "rgba(82, 82, 82, 0.95)";

type Options = {
  image: LoadedImage | null;
  rects: Rect[];
  selectedIndex: number;
  onAdd: (rect: Rect) => void;
  onSelect: (index: number) => void;
  /**
   * Fires when a box is clicked, with its position in viewport coordinates so
   * the owner can anchor an editor panel to it.
   */
  onPick?: (index: number, anchor: { left: number; top: number; width: number; height: number }) => void;
  /**
   * When false the canvas ignores pointers entirely and stops capturing touch
   * gestures, so the page scrolls normally. Used by the mobile Scroll mode.
   */
  interactive?: boolean;
  /**
   * Recognised text lines, from the latest detection pass. When present, a tap
   * covers the line it landed on — the fast path on a phone, where dragging a
   * box exactly around a line of text is fiddly and a tap is not.
   */
  lines?: TextLine[];
};

export type CanvasEditor = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handlers: {
    onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  };
};

/**
 * Draws the image plus box overlays onto a backing-store canvas sized in image
 * pixels. Pointer coordinates are converted from CSS pixels back to image
 * pixels so boxes always live in original-resolution space.
 */
export default function useCanvasEditor({
  image,
  rects,
  selectedIndex,
  onAdd,
  onSelect,
  interactive = true,
  lines = [],
  onPick,
}: Options): CanvasEditor {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  // The same anchor in CSS pixels, kept so a tap can be recognised by how far
  // the finger travelled on screen rather than by how far it travelled in a
  // 12-megapixel image.
  const startClientRef = useRef<{ x: number; y: number } | null>(null);
  const [ghost, setGhost] = useState<Rect | null>(null);

  // Dropping out of draw mode must discard the drag anchor, otherwise a later
  // pointer move would draw a box from a gesture the user already abandoned.
  // This only touches a ref, so it cannot trigger the state-in-effect warning;
  // the repaint below keys off `interactive` and re-reads the ref.
  useEffect(() => {
    if (!interactive) {
      startRef.current = null;
      startClientRef.current = null;
    }
  }, [interactive]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height);

    const scale = canvas.width / image.width;
    const line = Math.max(1.5, 2 / scale);
    // In scroll mode a stray ghost would imply drawing is still live.
    const activeGhost = interactive ? ghost : null;
    const boxes = activeGhost ? [...rects, activeGhost] : rects;

    for (let index = 0; index < boxes.length; index += 1) {
      const rect = boxes[index];
      if (rect.w <= 0 || rect.h <= 0) {
        continue;
      }
      const isGhost = activeGhost !== null && index === boxes.length - 1;
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

      // The human-readable type name, never the internal key: a tag reading
      // "credit_card" or "labelled" on someone's screenshot is an implementation
      // detail leaking into the product.
      const tag = rect.label ? (TYPE_LABELS[rect.label] ?? rect.label) : null;
      if (tag) {
        // The label lives in image space, so its font is scaled by 1/scale to
        // stay readable no matter how far the canvas is shrunk on screen.
        const fontSize = 12 / scale;
        const padX = 4 / scale;
        const padY = 3 / scale;
        ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
        const textWidth = ctx.measureText(tag).width;
        const boxW = textWidth + padX * 2;
        const boxH = fontSize + padY * 2;
        const labelX = rect.x;
        const labelY = rect.y - boxH - line;

        ctx.fillStyle = isSelected
          ? LABEL_BG_SELECTED
          : isSkipped
            ? LABEL_BG_SKIPPED
            : LABEL_BG;
        ctx.fillRect(labelX, labelY, boxW, boxH);
        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "top";
        ctx.fillText(tag, labelX + padX, labelY + padY);
      }
    }
  }, [ghost, image, interactive, rects, selectedIndex]);

  useEffect(() => {
    draw();
  }, [draw]);

  const toImagePoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !image) {
        return { x: 0, y: 0 };
      }
      const box = canvas.getBoundingClientRect();
      const scaleX = canvas.width / box.width;
      const scaleY = canvas.height / box.height;
      return {
        x: (clientX - box.left) * scaleX,
        y: (clientY - box.top) * scaleY,
      };
    },
    [image],
  );

  // Converts a box from image space to viewport coordinates, which is what a
  // fixed-position panel needs.
  const toViewportRect = useCallback(
    (rect: Rect) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return { left: 0, top: 0, width: 0, height: 0 };
      }
      const box = canvas.getBoundingClientRect();
      const scaleX = box.width / canvas.width;
      const scaleY = box.height / canvas.height;
      return {
        left: box.left + rect.x * scaleX,
        top: box.top + rect.y * scaleY,
        width: rect.w * scaleX,
        height: rect.h * scaleY,
      };
    },
    [],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!image || !interactive) {
        return;
      }
      const point = toImagePoint(event.clientX, event.clientY);
      const hit = hitTest(rects, point.x, point.y);
      if (hit >= 0) {
        onSelect(hit);
        // Report the hit as well as selecting it: the owner opens an editor
        // anchored to this box, and only the canvas knows the screen position.
        onPick?.(hit, toViewportRect(rects[hit]));
        return;
      }
      // Clicking empty canvas deselects and closes any open editor.
      onSelect(-1);
      onPick?.(-1, { left: 0, top: 0, width: 0, height: 0 });
      event.currentTarget.setPointerCapture(event.pointerId);
      startRef.current = point;
      startClientRef.current = { x: event.clientX, y: event.clientY };
      setGhost({ x: point.x, y: point.y, w: 0, h: 0 });
    },
    [image, interactive, onPick, onSelect, rects, toImagePoint, toViewportRect],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const start = startRef.current;
      if (!start || !image || !interactive) {
        return;
      }
      const point = toImagePoint(event.clientX, event.clientY);
      setGhost(
        clampRect(
          normalizeRect(start.x, start.y, point.x, point.y),
          image.width,
          image.height,
        ),
      );
    },
    [image, interactive, toImagePoint],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const start = startRef.current;
      const startClient = startClientRef.current;
      startRef.current = null;
      startClientRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setGhost(null);
      if (!start || !startClient || !image || !interactive) {
        return;
      }
      const point = toImagePoint(event.clientX, event.clientY);

      // A tap covers the text line under the finger. It has to be tested before
      // the drag-length rule below, because a tap is precisely a drag too short
      // to make a box — without this branch it would just do nothing.
      const moved = Math.hypot(
        event.clientX - startClient.x,
        event.clientY - startClient.y,
      );
      if (moved < TAP_CSS_PX && lines.length > 0) {
        const line = lineAtPoint(lines, point.x, point.y);
        if (line) {
          const box = uncoveredBox(line, (word) =>
            rects.some((rect) => wordInRect(word, rect)),
          );
          // null means every word on that line is already covered: tapping a
          // black bar must not stack a second box on it.
          if (box) {
            onAdd(clampRect(box, image.width, image.height));
          }
          return;
        }
      }

      const final = clampRect(
        normalizeRect(start.x, start.y, point.x, point.y),
        image.width,
        image.height,
      );
      if (Math.min(final.w, final.h) < MIN_DRAG_PX) {
        return;
      }
      onAdd(final);
    },
    [image, interactive, lines, onAdd, rects, toImagePoint],
  );

  return {
    canvasRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
