"use client";

import { useCallback } from "react";

import type { Rect } from "@/lib/geometry";
import type { LoadedImage } from "@/hooks/useImageLoader";
import {
  outputFileName,
  paintRedaction,
  pixelateBlockSize,
  type FillStyle,
} from "@/lib/image";

type Options = {
  image: LoadedImage | null;
  rects: Rect[];
  fillStyle: FillStyle;
  onError: (message: string) => void;
};

/**
 * Renders the final PNG on a fresh offscreen canvas at full original
 * resolution. Only opaque fill is painted — the red editing outline never
 * reaches the export. The blob URL is revoked right after the click.
 */
export default function useExportPng({
  image,
  rects,
  fillStyle,
  onError,
}: Options): () => Promise<void> {
  return useCallback(async () => {
    if (!image) {
      return;
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = image.width;
    offscreen.height = image.height;
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      onError("Your browser blocked the export canvas.");
      return;
    }

    ctx.drawImage(image.bitmap, 0, 0, image.width, image.height);
    const block = pixelateBlockSize(image.width, image.height);
    for (const rect of rects) {
      paintRedaction(ctx, image.bitmap, rect, fillStyle, block);
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      offscreen.toBlob((result) => resolve(result), "image/png");
    });

    offscreen.width = 0;
    offscreen.height = 0;

    if (!blob) {
      onError("The PNG could not be created. Please try again.");
      return;
    }

    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = outputFileName(image.name);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  }, [fillStyle, image, onError, rects]);
}
