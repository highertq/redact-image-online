"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { clampRect, hitTest, normalizeRect, type Rect } from "@/lib/geometry";
import type { LoadedImage } from "@/hooks/useImageLoader";

const MIN_DRAG_PX = 8;
const OUTLINE = "rgba(239, 68, 68, 0.9)";
const OUTLINE_SELECTED = "rgba(59, 130, 246, 1)";
const GHOST_FILL = "rgba(239, 68, 68, 0.2)";

type Options = {
  image: LoadedImage | null;
  rects: Rect[];
  selectedIndex: number;
  onAdd: (rect: Rect) => void;
  onSelect: (index: number) => void;
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
}: Options): CanvasEditor {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [ghost, setGhost] = useState<Rect | null>(null);

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
    const boxes = ghost ? [...rects, ghost] : rects;

    for (let index = 0; index < boxes.length; index += 1) {
      const rect = boxes[index];
      if (rect.w <= 0 || rect.h <= 0) {
        continue;
      }
      const isGhost = ghost !== null && index === boxes.length - 1;
      const isSelected = !isGhost && index === selectedIndex;

      ctx.fillStyle = GHOST_FILL;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.lineWidth = line;
      ctx.strokeStyle = isSelected ? OUTLINE_SELECTED : OUTLINE;
      ctx.setLineDash(isSelected ? [] : [line * 3, line * 2]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.setLineDash([]);
    }
  }, [ghost, image, rects, selectedIndex]);

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

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!image) {
        return;
      }
      const point = toImagePoint(event.clientX, event.clientY);
      const hit = hitTest(rects, point.x, point.y);
      if (hit >= 0) {
        onSelect(hit);
        return;
      }
      onSelect(-1);
      event.currentTarget.setPointerCapture(event.pointerId);
      startRef.current = point;
      setGhost({ x: point.x, y: point.y, w: 0, h: 0 });
    },
    [image, onSelect, rects, toImagePoint],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const start = startRef.current;
      if (!start || !image) {
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
    [image, toImagePoint],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const start = startRef.current;
      startRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setGhost(null);
      if (!start || !image) {
        return;
      }
      const point = toImagePoint(event.clientX, event.clientY);
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
    [image, onAdd, toImagePoint],
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
