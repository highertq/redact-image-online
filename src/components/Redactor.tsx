"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import BoxPopover from "@/components/BoxPopover";
import EditorStatus from "@/components/EditorStatus";
import EditorToolbar, { type CanvasMode } from "@/components/EditorToolbar";
import ImageIntake from "@/components/ImageIntake";
import useActiveBox, { type BoxPatch } from "@/hooks/useActiveBox";
import useAutoDetect from "@/hooks/useAutoDetect";
import useCanvasEditor from "@/hooks/useCanvasEditor";
import useEditorShortcuts from "@/hooks/useEditorShortcuts";
import useExportPng from "@/hooks/useExportPng";
import useFileDrop from "@/hooks/useFileDrop";
import useImageLoader from "@/hooks/useImageLoader";
import useIsCoarsePointer from "@/hooks/useIsCoarsePointer";
import useDetectTypes from "@/hooks/useDetectTypes";
import useRectHistory from "@/hooks/useRectHistory";
import type { FillStyle } from "@/lib/image";
import type { Rect } from "@/lib/geometry";

const MULTI_FILE_NOTICE = "Only the first image was opened.";
const START_OVER_CONFIRM_MS = 3000;

export default function Redactor() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [fillStyle, setFillStyle] = useState<FillStyle>("black");
  const [exportError, setExportError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);
  const [startOverArmed, setStartOverArmed] = useState(false);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("draw");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCoarsePointer = useIsCoarsePointer();
  // Non-touch devices never see the switch, so their canvas stays interactive
  // regardless of the stored mode.
  const interactive = !isCoarsePointer || canvasMode === "draw";

  const {
    running: detecting,
    stage: detectStage,
    progress: detectProgress,
    message: detectMessage,
    hasRun: detectHasRun,
    run: runDetect,
    clear: clearDetectResult,
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

  const detectTypes = useDetectTypes(rects, commit);

  const activeBox = useActiveBox({
    rects,
    commit,
    setSelectedIndex,
    onRectsRemoved: detectTypes.syncPool,
  });

  // `useCanvasEditor` needs `onAdd`, but `onAdd` needs the canvas element to
  // anchor a new box's editor. This ref breaks that cycle: it is filled in as
  // soon as the editor returns, long before any pointer event can fire.
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  const anchorForRect = useCallback((rect: Rect) => {
    const canvas = canvasElementRef.current;
    if (!canvas) {
      return null;
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
  }, []);

  const onAdd = useCallback(
    (rect: Rect) => {
      commit([...rects, rect]);
      setSelectedIndex(rects.length);
      // New boxes open their editor right away: the first thing a user wants
      // after drawing is to confirm the style or switch the box off.
      const anchor = anchorForRect(rect);
      if (anchor) {
        activeBox.openNewest(rects.length, anchor);
      }
    },
    [activeBox, anchorForRect, commit, rects],
  );

  const { canvasRef, handlers } = useCanvasEditor({
    image,
    rects,
    selectedIndex,
    onAdd,
    onSelect: setSelectedIndex,
    onPick: activeBox.open,
    interactive,
  });

  useEffect(() => {
    canvasElementRef.current = canvasRef.current;
  });

  // Style and skip changes must reach the type-filter pool too, otherwise
  // toggling a chip off and on would restore the box with its old appearance.
  const patchActiveBox = useCallback(
    (changes: BoxPatch) => {
      const index = activeBox.active?.index;
      if (index === undefined) {
        return;
      }
      const updated = rects.map((rect, i) =>
        i === index ? { ...rect, ...changes } : rect,
      );
      activeBox.patch(changes);
      detectTypes.syncPool(updated);
    },
    [activeBox, detectTypes, rects],
  );

  const openFile = useCallback(
    async (file: File) => {
      setSelectedIndex(-1);
      setExportError(null);
      // A freshly opened image invalidates any pending "confirm start over",
      // and its boxes/chips must not carry over from the previous one.
      setStartOverArmed(false);
      clearDetectResult();
      detectTypes.reset();
      await loadFile(file);
    },
    [clearDetectResult, detectTypes, loadFile],
  );

  useEffect(() => {
    openFileRef.current = (file) => {
      // A paste is a single image, so any "first file only" notice is stale.
      setNotice(null);
      void openFile(file);
    };
  }, [openFile]);

  const runAutoDetect = useCallback(async () => {
    // Existing boxes are handed in so duplicates can be filtered before they
    // ever reach the canvas. The hook returns only the boxes that survived.
    const found = await runDetect(canvasRef.current, rects);
    if (found.length === 0) {
      return;
    }
    // The pool must hold everything detection produced, not just what was new:
    // chip counts and restore-after-uncheck both read from it.
    detectTypes.register(found);
    // Auto boxes join the same history stack, so undo removes them in one step.
    commit([...rects, ...found]);
    setSelectedIndex(-1);
  }, [canvasRef, commit, detectTypes, rects, runDetect]);

  const removeSelected = useCallback(() => {
    if (selectedIndex < 0) {
      return;
    }
    const next = rects.filter((_, i) => i !== selectedIndex);
    // Sync before committing: an auto box the user deleted must not linger in
    // the restore pool, or the next chip toggle would bring it back.
    detectTypes.syncPool(next);
    commit(next);
    setSelectedIndex(-1);
  }, [commit, detectTypes, rects, selectedIndex]);

  const undoAction = useCallback(() => {
    undo();
    setSelectedIndex(-1);
  }, [undo]);

  const redoAction = useCallback(() => {
    redo();
    setSelectedIndex(-1);
  }, [redo]);

  const clearAll = useCallback(() => {
    detectTypes.syncPool([]);
    commit([]);
    setSelectedIndex(-1);
  }, [commit, detectTypes]);

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
    detectTypes.reset();
    setSelectedIndex(-1);
    setExportError(null);
    setNotice(null);
    setStartOverArmed(false);
  }, [detectTypes, reset, resetHistory]);

  // Two-step confirm instead of window.confirm: the first click only arms the
  // button, a second click within the window commits. The timer is cleared on
  // unmount and whenever the arm state flips, so a stale timeout can never
  // disarm a later confirmation.
  useEffect(() => {
    if (!startOverArmed) {
      return;
    }
    const timer = window.setTimeout(
      () => setStartOverArmed(false),
      START_OVER_CONFIRM_MS,
    );
    return () => window.clearTimeout(timer);
  }, [startOverArmed]);

  const requestStartOver = useCallback(() => {
    if (!startOverArmed) {
      setStartOverArmed(true);
      return;
    }
    startOver();
  }, [startOver, startOverArmed]);

  const { dragging, dragProps } = useFileDrop(loadFromList);

  const message = loadError ?? exportError;

  return (
    <div className="flex flex-col gap-6">
      <EditorStatus
        error={message}
        notice={notice}
        busy={busy}
        inputRef={fileInputRef}
        onFiles={loadFromList}
      />

      {image ? (
        <>
          <p className="text-sm text-neutral-600">
            {image.name} — {image.width} × {image.height} px.{" "}
            {interactive
              ? "Drag on the image to draw a box."
              : "Scroll mode: the image does not respond to drags."}
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
              className={`block h-auto w-full bg-neutral-100 ${
                interactive ? "cursor-crosshair" : "cursor-default"
              }`}
              // Draw mode swallows touch gestures so a drag draws instead of
              // scrolling. Scroll mode hands panning back to the browser, which
              // is the only way to reach the rest of a tall screenshot.
              style={{
                touchAction: interactive ? "none" : "pan-y pinch-zoom",
              }}
              {...handlers}
            />
          </div>
          {activeBox.active && activeBox.rect ? (
            <BoxPopover
              // Keyed by index only: including coordinates would remount the
              // panel on every patch, throwing away its measured position.
              key={activeBox.active.index}
              rect={activeBox.rect}
              anchor={activeBox.active.anchor}
              defaultStyle={fillStyle}
              onToggleRedact={(nextSkipped) =>
                patchActiveBox({ skip: nextSkipped })
              }
              onStyleChange={(style) => patchActiveBox({ style })}
              onResetStyle={activeBox.resetStyle}
              onDelete={activeBox.remove}
              onClose={activeBox.close}
            />
          ) : null}
        </>
      ) : (
        <ImageIntake
          dragging={dragging}
          dragProps={dragProps}
          inputRef={fileInputRef}
        />
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
        onClearAll={clearAll}
        onStartOver={requestStartOver}
        startOverArmed={startOverArmed}
        onDownload={() => {
          void download();
        }}
        detecting={detecting}
        detectStage={detectStage}
        detectProgress={detectProgress}
        detectMessage={detectMessage}
        detectHasRun={detectHasRun}
        onAutoDetect={() => {
          void runAutoDetect();
        }}
        typeChips={detectTypes.chips}
        enabledTypes={detectTypes.enabled}
        onToggleType={detectTypes.toggle}
        showModeSwitch={isCoarsePointer}
        canvasMode={canvasMode}
        onCanvasModeChange={setCanvasMode}
      />

      <p className="text-xs leading-relaxed text-neutral-500">
        Your image never leaves this browser tab. Nothing is uploaded, and the
        exported PNG is re-encoded from a canvas, which drops metadata such as
        EXIF.
      </p>
    </div>
  );
}
