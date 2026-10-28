"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { paint } from "@/lib/canvas-paint";
import { clampRect, hitTest, normalizeRect, type Rect } from "@/lib/geometry";
import { lineAtPoint, uncoveredBox, wordInRect, type TextLine } from "@/lib/text-lines";
import type { CanvasMode } from "@/hooks/useCanvasMode";
import type { LoadedImage } from "@/hooks/useImageLoader";

const MIN_DRAG_PX = 8;
/**
 * A pointer that barely moved is a tap, not a drag. Measured in CSS pixels
 * because that is what a finger actually travels: on a phone showing a 1170 px
 * screenshot at 390 px wide, a 6 px thumb jitter is 18 image pixels.
 */
const TAP_CSS_PX = 6;
type Options = {
  image: LoadedImage | null;
  rects: Rect[];
  selectedIndex: number;
  /**
   * A finished rectangle, plus where it sits in viewport coordinates. Only the
   * canvas knows the scale, so the caller can anchor an editor to the box without
   * measuring the element itself.
   */
  onAdd: (rect: Rect, anchor: { left: number; top: number; width: number; height: number }) => void;
  onSelect: (index: number) => void;
  /**
   * Fires when a box is clicked, with its position in viewport coordinates so
   * the owner can anchor an editor panel to it.
   */
  onPick?: (index: number, anchor: { left: number; top: number; width: number; height: number }) => void;
  /**
   * `draw`: a drag paints a rectangle and the canvas keeps the touch gesture to
   * itself (`touch-action: none`). `scroll`: the browser pans and zooms, and the
   * canvas only ever sees a tap — a finger that lifts where it landed.
   *
   * Both modes answer a tap the same way. That is the point: on a phone, reading
   * a long screenshot and covering one line of it are the same session, and the
   * old design made the user choose between scrolling and tapping.
   */
  mode: CanvasMode;
  /**
   * Recognised text lines, from the latest detection pass. A tap then covers the
   * line it landed on, which works in any language and regardless of what the
   * patterns matched — the fallback that makes the tool useful on a document it
   * cannot read.
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
  mode,
  lines = [],
  onPick,
}: Options): CanvasEditor {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  // The same anchor in CSS pixels, kept so a tap can be recognised by how far
  // the finger travelled on screen rather than by how far it travelled in a
  // 12-megapixel image.
  const startClientRef = useRef<{ x: number; y: number } | null>(null);
  // In scroll mode nothing is captured and no rectangle is started, but the
  // landing point is remembered so the lift can be judged as tap or swipe.
  const tapCandidateRef = useRef<{
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    hit: number;
  } | null>(null);
  const [ghost, setGhost] = useState<Rect | null>(null);

  // Leaving draw mode mid-gesture must discard the drag anchor, otherwise a later
  // pointer move would draw a box from a gesture the user already abandoned.
  // This only touches refs, so it cannot trigger the state-in-effect warning; the
  // repaint below keys off `mode` and re-reads them.
  useEffect(() => {
    if (mode !== "draw") {
      startRef.current = null;
      startClientRef.current = null;
      tapCandidateRef.current = null;
    }
  }, [mode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    paint({
      ctx,
      bitmap: image.bitmap,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      imageWidth: image.width,
      rects,
      // In scroll mode a stray ghost would imply drawing is still live.
      ghost: mode === "draw" ? ghost : null,
      selectedIndex,
    });
  }, [ghost, image, mode, rects, selectedIndex]);

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
      if (!image) {
        return;
      }
      const point = toImagePoint(event.clientX, event.clientY);
      const hit = hitTest(rects, point.x, point.y);

      if (mode !== "draw") {
        // Scroll mode: remember where the finger landed and decide nothing yet.
        // Acting here would close the box editor the moment a pan begins, and a
        // pan is exactly what this mode exists to allow.
        tapCandidateRef.current = {
          x: point.x,
          y: point.y,
          clientX: event.clientX,
          clientY: event.clientY,
          hit,
        };
        return;
      }

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
    [mode, image, onPick, onSelect, rects, toImagePoint, toViewportRect],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const start = startRef.current;
      if (!start || mode !== "draw" || !image) {
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
    [mode, image, toImagePoint],
  );

  /**
   * What a tap does, identical in both modes: open the editor of the box under
   * the finger, cover the recognised line under it, or dismiss the editor when
   * there is nothing there. `hit` is the box found at the landing point.
   */
  const resolveTap = useCallback(
    (x: number, y: number, hit: number) => {
      if (!image) {
        return;
      }
      if (hit >= 0) {
        onSelect(hit);
        onPick?.(hit, toViewportRect(rects[hit]));
        return;
      }
      const line = lineAtPoint(lines, x, y);
      if (line) {
        const box = uncoveredBox(line, (word) =>
          rects.some((rect) => wordInRect(word, rect)),
        );
        // null means every word on that line is already covered: tapping a black
        // bar must not stack a second box on it.
        if (box) {
          const added = clampRect(box, image.width, image.height);
          onAdd(added, toViewportRect(added));
        }
        return;
      }
      onSelect(-1);
      onPick?.(-1, { left: 0, top: 0, width: 0, height: 0 });
    },
    [image, lines, onAdd, onPick, rects, onSelect, toViewportRect],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const candidate = tapCandidateRef.current;
      tapCandidateRef.current = null;

      // Scroll mode: only a finger that lifted where it landed counts. Anything
      // longer was a pan or a zoom, which belongs to the browser, not to us.
      if (candidate) {
        const moved = Math.hypot(
          event.clientX - candidate.clientX,
          event.clientY - candidate.clientY,
        );
        if (moved < TAP_CSS_PX) {
          const point = toImagePoint(event.clientX, event.clientY);
          resolveTap(point.x, point.y, candidate.hit);
        }
        return;
      }

      const start = startRef.current;
      const startClient = startClientRef.current;
      startRef.current = null;
      startClientRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setGhost(null);
      if (!start || !startClient || !image || mode !== "draw") {
        return;
      }
      const point = toImagePoint(event.clientX, event.clientY);
      const hit = hitTest(rects, start.x, start.y);

      // A tap covers the text line under the finger. It has to be tested before
      // the drag-length rule below, because a tap is precisely a drag too short
      // to make a box — without this branch it would just do nothing.
      const moved = Math.hypot(
        event.clientX - startClient.x,
        event.clientY - startClient.y,
      );
      if (moved < TAP_CSS_PX) {
        resolveTap(point.x, point.y, hit);
        return;
      }

      const final = clampRect(
        normalizeRect(start.x, start.y, point.x, point.y),
        image.width,
        image.height,
      );
      if (Math.min(final.w, final.h) < MIN_DRAG_PX) {
        return;
      }
      onAdd(final, toViewportRect(final));
    },
    [image, mode, onAdd, rects, resolveTap, toImagePoint, toViewportRect],
  );

  /**
   * The browser took the gesture (a pan began, or another pointer interrupted).
   * Discard rather than finish: mapping cancel to the up handler would commit a
   * rectangle from a swipe the user meant as scrolling.
   */
  const onPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      tapCandidateRef.current = null;
      startRef.current = null;
      startClientRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setGhost(null);
    },
    [],
  );

  return {
    canvasRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
