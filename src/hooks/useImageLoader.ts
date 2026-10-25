"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  REJECT_MESSAGES,
  validateDimensions,
  validateFileMeta,
  type RejectReason,
} from "@/lib/image";

export type LoadedImage = {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  name: string;
};

export type LoadState = {
  image: LoadedImage | null;
  error: string | null;
  busy: boolean;
  loadFile: (file: File) => Promise<void>;
  reset: () => void;
};

function messageFor(reason: RejectReason): string {
  return REJECT_MESSAGES[reason];
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("decode failed"));
    element.src = url;
  });
}

/**
 * Owns the decoded bitmap and the object URL lifetime. The URL only exists for
 * the duration of the decode and is revoked in `finally`, so no blob URL
 * outlives the load.
 */
export default function useImageLoader(): LoadState {
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const disposeBitmap = useCallback(() => {
    bitmapRef.current?.close();
    bitmapRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      disposeBitmap();
    };
  }, [disposeBitmap]);

  const loadFile = useCallback(
    async (file: File) => {
      const metaProblem = validateFileMeta(file.type, file.size);
      if (metaProblem) {
        setError(messageFor(metaProblem));
        return;
      }

      setBusy(true);
      setError(null);

      // Load through an object URL (revoked in `finally` below) rather than
      // handing the File to createImageBitmap directly: the Image route is
      // what Safari reliably decodes WebP/JPEG/PNG through.
      const url = URL.createObjectURL(file);
      try {
        const element = await loadImageElement(url);
        const bitmap = await createImageBitmap(element);
        const dimProblem = validateDimensions(bitmap.width, bitmap.height);
        if (dimProblem) {
          bitmap.close();
          setError(messageFor(dimProblem));
          return;
        }

        disposeBitmap();
        bitmapRef.current = bitmap;
        setImage({
          bitmap,
          width: bitmap.width,
          height: bitmap.height,
          name: file.name,
        });
      } catch {
        setError(messageFor("decode-failed"));
      } finally {
        URL.revokeObjectURL(url);
        setBusy(false);
      }
    },
    [disposeBitmap],
  );

  const reset = useCallback(() => {
    disposeBitmap();
    setImage(null);
    setError(null);
  }, [disposeBitmap]);

  return { image, error, busy, loadFile, reset };
}
