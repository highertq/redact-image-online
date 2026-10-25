"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import BoxPopover from "@/components/BoxPopover";
import EditorStatus from "@/components/EditorStatus";
import EditorToolbar, { type CanvasMode } from "@/components/EditorToolbar";
import ImageIntake from "@/components/ImageIntake";
import { IconClose, IconDownload, IconSliders } from "@/components/Icons";
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
  const [toolsOpen, setToolsOpen] = useState(false);
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
    setToolsOpen(false);
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

  // Escape closes the phone drawer. On desktop the panel is always visible, so
  // the handler is harmless there.
  useEffect(() => {
    if (!toolsOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setToolsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toolsOpen]);

  const { dragging, dragProps } = useFileDrop(loadFromList);

  const message = loadError ?? exportError;

  const toolbar = (
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
  );

  return (
    <div className={`flex flex-col gap-4 ${image ? "pb-24 lg:pb-0" : ""}`}>
      <EditorStatus
        error={message}
        notice={notice}
        busy={busy}
        inputRef={fileInputRef}
        onFiles={loadFromList}
      />

      {image ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="min-w-0 truncate text-body-sm text-ink-2">
                  <span className="font-medium text-ink">{image.name}</span>
                  <span className="text-ink-3">
                    {" "}
                    · {image.width} × {image.height} px
                  </span>
                </p>
                <p className="text-label text-ink-3">
                  {interactive
                    ? "Drag on the image to draw a box."
                    : "Scroll mode: the image does not respond to drags."}
                </p>
              </div>
              <div
                {...dragProps}
                className={`overflow-hidden rounded-lg border bg-surface transition-state ${
                  dragging ? "border-accent" : "border-line"
                }`}
              >
                <canvas
                  ref={canvasRef}
                  width={image.width}
                  height={image.height}
                  role="img"
                  aria-label={`Image being redacted, ${image.width} by ${image.height} pixels`}
                  className={`block h-auto w-full ${
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
              <p className="text-label leading-relaxed text-ink-3">
                Your image never leaves this browser tab. Nothing is uploaded,
                and the exported PNG is re-encoded from a canvas, which drops
                metadata such as EXIF.
              </p>
            </div>

            {/* One panel, two placements: right column on desktop, bottom
                drawer on a phone. Visibility is CSS-only. */}
            <div
              id="tool-panel"
              className={`fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-lg border-t border-line bg-paper p-4 pb-safe-2 shadow-pop transition-page lg:static lg:z-auto lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-lg lg:border lg:border-line lg:bg-surface lg:p-4 lg:opacity-100 lg:shadow-none ${
                toolsOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible translate-y-full opacity-0 lg:visible"
              }`}
            >
              <div className="mb-3 flex items-center justify-between lg:hidden">
                <p className="text-body font-semibold text-ink">Tools</p>
                <button
                  type="button"
                  onClick={() => setToolsOpen(false)}
                  aria-label="Close tools"
                  className="-mr-1 grid h-11 w-11 place-items-center rounded-md text-ink-2 transition-hover hover:bg-surface-2 hover:text-ink"
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>
              {toolbar}
            </div>
          </div>

          {toolsOpen ? (
            <button
              type="button"
              aria-label="Close tools"
              onClick={() => setToolsOpen(false)}
              className="fixed inset-0 z-40 bg-ink/20 lg:hidden"
            />
          ) : null}

          {/* Phone action bar: the two things that must never be scrolled away. */}
          <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-line bg-paper/95 px-4 pb-safe-2 pt-2 backdrop-blur-md lg:hidden">
            <button
              type="button"
              onClick={() => setToolsOpen((open) => !open)}
              aria-expanded={toolsOpen}
              aria-controls="tool-panel"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line bg-paper px-3 text-body-sm font-semibold text-ink transition-hover hover:bg-surface-2"
            >
              <IconSliders className="h-4 w-4" />
              Tools
            </button>
            <button
              type="button"
              onClick={() => {
                void download();
              }}
              aria-label="Download redacted PNG"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-3 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
            >
              <IconDownload className="h-4 w-4" />
              Download PNG
            </button>
          </div>
        </>
      ) : (
        <ImageIntake
          dragging={dragging}
          dragProps={dragProps}
          inputRef={fileInputRef}
        />
      )}

      {activeBox.active && activeBox.rect ? (
        <BoxPopover
          // Keyed by index only: including coordinates would remount the
          // panel on every patch, throwing away its measured position.
          key={activeBox.active.index}
          rect={activeBox.rect}
          anchor={activeBox.active.anchor}
          defaultStyle={fillStyle}
          onToggleRedact={(nextSkipped) => patchActiveBox({ skip: nextSkipped })}
          onStyleChange={(style) => patchActiveBox({ style })}
          onResetStyle={activeBox.resetStyle}
          onDelete={activeBox.remove}
          onClose={activeBox.close}
        />
      ) : null}
    </div>
  );
}
