"use client";

import { useCallback, useState } from "react";

import EditorToolbar from "@/components/EditorToolbar";
import useCanvasEditor from "@/hooks/useCanvasEditor";
import useEditorShortcuts from "@/hooks/useEditorShortcuts";
import useExportPng from "@/hooks/useExportPng";
import useImageLoader from "@/hooks/useImageLoader";
import useRectHistory from "@/hooks/useRectHistory";
import { MAX_FILE_BYTES, formatBytes, type FillStyle } from "@/lib/image";
import type { Rect } from "@/lib/geometry";

export default function Redactor() {
  const { image, error: loadError, busy, loadFile, reset } = useImageLoader();
  const {
    rects,
    canUndo,
    canRedo,
    commit,
    undo,
    redo,
    reset: resetHistory,
  } = useRectHistory();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [fillStyle, setFillStyle] = useState<FillStyle>("black");
  const [exportError, setExportError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const onAdd = useCallback(
    (rect: Rect) => {
      commit([...rects, rect]);
      setSelectedIndex(rects.length);
    },
    [commit, rects],
  );

  const { canvasRef, handlers } = useCanvasEditor({
    image,
    rects,
    selectedIndex,
    onAdd,
    onSelect: setSelectedIndex,
  });

  const removeSelected = useCallback(() => {
    if (selectedIndex < 0) {
      return;
    }
    commit(rects.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(-1);
  }, [commit, rects, selectedIndex]);

  const undoAction = useCallback(() => {
    undo();
    setSelectedIndex(-1);
  }, [undo]);

  const redoAction = useCallback(() => {
    redo();
    setSelectedIndex(-1);
  }, [redo]);

  useEditorShortcuts({
    onUndo: undoAction,
    onRedo: redoAction,
    onDelete: removeSelected,
    deleteEnabled: selectedIndex >= 0 && selectedIndex < rects.length,
  });

  const download = useExportPng({
    image,
    rects,
    fillStyle,
    onError: setExportError,
  });

  const openFile = useCallback(
    async (file: File) => {
      await loadFile(file);
      setSelectedIndex(-1);
      setExportError(null);
    },
    [loadFile],
  );

  const startOver = useCallback(() => {
    reset();
    resetHistory();
    setSelectedIndex(-1);
    setExportError(null);
  }, [reset, resetHistory]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        void openFile(file);
      }
    },
    [openFile],
  );

  const dragProps = {
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop,
  };

  const message = loadError ?? exportError;

  return (
    <div className="flex flex-col gap-6">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="Choose an image to redact"
        className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void openFile(file);
          }
          event.target.value = "";
        }}
      />

      {message ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {message}
        </p>
      ) : null}

      {busy ? (
        <p role="status" className="text-sm text-neutral-600">
          Loading image…
        </p>
      ) : null}

      {image ? (
        <>
          <p className="text-sm text-neutral-600">
            {image.name} — {image.width} × {image.height} px. Drag on the image
            to draw a box.
          </p>
          <div
            {...dragProps}
            className={`overflow-hidden rounded-lg border-2 ${
              dragging ? "border-neutral-900" : "border-neutral-200"
            }`}
          >
            <canvas
              ref={canvasRef}
              width={image.width}
              height={image.height}
              role="img"
              aria-label={`Image being redacted, ${image.width} by ${image.height} pixels`}
              className="block h-auto w-full cursor-crosshair bg-neutral-100"
              style={{ touchAction: "none" }}
              {...handlers}
            />
          </div>
        </>
      ) : (
        <div
          {...dragProps}
          className={`flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center ${
            dragging
              ? "border-neutral-900 bg-neutral-100"
              : "border-neutral-300 bg-neutral-50"
          }`}
        >
          <p className="text-base font-medium text-neutral-900">
            Drop an image here
          </p>
          <p className="text-sm text-neutral-600">
            PNG, JPEG, or WebP. Up to {formatBytes(MAX_FILE_BYTES)} and 40
            million pixels.
          </p>
          <p className="text-sm text-neutral-600">
            You can also paste with Ctrl/Cmd+V.
          </p>
        </div>
      )}

      <EditorToolbar
        fillStyle={fillStyle}
        onFillStyleChange={setFillStyle}
        hasImage={image !== null}
        hasRects={rects.length > 0}
        canUndo={canUndo}
        canRedo={canRedo}
        selectedIndex={selectedIndex}
        onUndo={undoAction}
        onRedo={redoAction}
        onRemoveSelected={removeSelected}
        onClearAll={() => {
          commit([]);
          setSelectedIndex(-1);
        }}
        onStartOver={startOver}
        onDownload={() => {
          void download();
        }}
      />

      <p className="text-xs leading-relaxed text-neutral-500">
        Your image never leaves this browser tab. Nothing is uploaded, and the
        exported PNG is re-encoded from a canvas, which drops metadata such as
        EXIF.
      </p>
    </div>
  );
}
