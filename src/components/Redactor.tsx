"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import EditorToolbar from "@/components/EditorToolbar";
import useAutoDetect from "@/hooks/useAutoDetect";
import useCanvasEditor from "@/hooks/useCanvasEditor";
import useEditorShortcuts from "@/hooks/useEditorShortcuts";
import useExportPng from "@/hooks/useExportPng";
import useImageLoader from "@/hooks/useImageLoader";
import useRectHistory from "@/hooks/useRectHistory";
import { MAX_FILE_BYTES, formatBytes, type FillStyle } from "@/lib/image";
import type { Rect } from "@/lib/geometry";

const MULTI_FILE_NOTICE = "Only the first image was opened.";

export default function Redactor() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [fillStyle, setFillStyle] = useState<FillStyle>("black");
  const [exportError, setExportError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    running: detecting,
    progress: detectProgress,
    result: detectResult,
    run: runDetect,
    clearResult: clearDetectResult,
  } = useAutoDetect();

  // The paste listener lives inside useImageLoader, but the resulting file has
  // to run through the same "reset boxes, clear detection" path as a picked
  // one. A latest-ref hands it that path without an ordering cycle between the
  // two hooks.
  const openFileRef = useRef<(file: File) => void>(() => {});

  const { image, error: loadError, busy, loadFile, reset } = useImageLoader({
    onPastedFile: (file) => openFileRef.current(file),
  });

  const {
    rects,
    canUndo,
    canRedo,
    commit,
    undo,
    redo,
    reset: resetHistory,
  } = useRectHistory();

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

  const openFile = useCallback(
    async (file: File) => {
      setSelectedIndex(-1);
      setExportError(null);
      clearDetectResult();
      await loadFile(file);
    },
    [clearDetectResult, loadFile],
  );

  useEffect(() => {
    openFileRef.current = (file) => {
      // A paste is a single image, so any "first file only" notice is stale.
      setNotice(null);
      void openFile(file);
    };
  }, [openFile]);

  const runAutoDetect = useCallback(async () => {
    const found = await runDetect(canvasRef.current);
    if (found.length === 0) {
      return;
    }
    // Auto boxes join the same history stack, so undo removes them in one step.
    commit([...rects, ...found]);
    setSelectedIndex(-1);
  }, [canvasRef, commit, rects, runDetect]);

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

  const loadFromList = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }
      // Only the first file is opened. Say so rather than dropping the rest silently.
      setNotice(files.length > 1 ? MULTI_FILE_NOTICE : null);
      void openFile(files[0]);
    },
    [openFile],
  );

  const startOver = useCallback(() => {
    reset();
    resetHistory();
    setSelectedIndex(-1);
    setExportError(null);
    setNotice(null);
  }, [reset, resetHistory]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragging(false);
      loadFromList(event.dataTransfer.files);
    },
    [loadFromList],
  );

  const dragProps = {
    onDragOver: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragging(true);
    },
    // dragleave also fires when the pointer crosses onto a child, so ignore
    // those or the highlight flickers as soon as the cursor touches the text.
    onDragLeave: (event: React.DragEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && event.currentTarget.contains(next)) {
        return;
      }
      setDragging(false);
    },
    onDrop,
  };

  const message = loadError ?? exportError;

  return (
    <div className="flex flex-col gap-6">
      {/* Visually hidden: the drop-zone button below opens it. Keeping the input
          in the DOM preserves the native picker; aria-hidden + tabIndex={-1}
          avoids a second, invisible tab stop. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          loadFromList(event.target.files);
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

      {notice ? (
        <p
          role="status"
          className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {notice}
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
          className={`rounded-lg border-2 border-dashed transition-colors ${
            dragging
              ? "border-neutral-900 bg-neutral-100"
              : "border-neutral-300 bg-neutral-50"
          }`}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-md px-4 py-10 text-center transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            <span className="text-base font-medium text-neutral-900">
              Drop an image here, or click to choose one
            </span>
            <span className="text-sm text-neutral-600">
              PNG, JPEG, or WebP. Up to {formatBytes(MAX_FILE_BYTES)} and 40
              million pixels.
            </span>
            <span className="text-sm text-neutral-600">
              You can also paste with Ctrl/Cmd+V.
            </span>
          </button>
          <p className="border-t border-neutral-200 px-4 pb-3 pt-3 text-center text-sm leading-relaxed text-neutral-600">
            Your image never leaves this browser tab. Nothing is uploaded.
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
        detecting={detecting}
        detectProgress={detectProgress}
        detectResult={detectResult}
        onAutoDetect={() => {
          void runAutoDetect();
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
