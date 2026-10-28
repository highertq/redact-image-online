"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import BoxPopover from "@/components/BoxPopover";
import CanvasStage, { type FitMode } from "@/components/CanvasStage";
import { PRIVACY_NOTE } from "@/components/privacy-note";
import EditorStatus from "@/components/EditorStatus";
import EditorToolbar from "@/components/EditorToolbar";
import ImageIntake from "@/components/ImageIntake";
import MobileActionBar from "@/components/MobileActionBar";
import ToolPanel from "@/components/ToolPanel";
import useActiveBox, { type BoxPatch } from "@/hooks/useActiveBox";
import useAutoDetect from "@/hooks/useAutoDetect";
import useCanvasEditor from "@/hooks/useCanvasEditor";
import useConfirmAction from "@/hooks/useConfirmAction";
import useEditorShortcuts from "@/hooks/useEditorShortcuts";
import useExportPng from "@/hooks/useExportPng";
import useFileDrop from "@/hooks/useFileDrop";
import useImageLoader from "@/hooks/useImageLoader";
import useCanvasMode from "@/hooks/useCanvasMode";
import useIsCoarsePointer from "@/hooks/useIsCoarsePointer";
import useDetectTypes from "@/hooks/useDetectTypes";
import useOcrPacks from "@/hooks/useOcrLangs";
import useRectHistory from "@/hooks/useRectHistory";
import type { FillStyle } from "@/lib/image";
import type { Rect } from "@/lib/geometry";

const MULTI_FILE_NOTICE = "Only the first image was opened.";

export default function Redactor() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [fillStyle, setFillStyle] = useState<FillStyle>("black");
  const [exportError, setExportError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  // On a phone the editor takes the viewport by default; collapsing it puts the
  // stage back in the page flow.
  const [stageExpanded, setStageExpanded] = useState(true);
  const [fit, setFit] = useState<FitMode>("fit");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCoarsePointer = useIsCoarsePointer();
  // A finger device starts in Scroll: Draw captures every touch gesture, which
  // is right for marking boxes and fatal for reading a long screenshot.
  const { mode: canvasMode, setMode: setCanvasMode } = useCanvasMode(isCoarsePointer);
  const ocrPacks = useOcrPacks();
  // The hook forces "draw" for a fine pointer, so this is the whole rule.
  const interactive = canvasMode === "draw";

  const {
    running: detecting,
    stage: detectStage,
    progress: detectProgress,
    message: detectMessage,
    hasRun: detectHasRun,
    lines: detectLines,
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

  const onAdd = useCallback(
    (
      rect: Rect,
      anchor: { left: number; top: number; width: number; height: number },
    ) => {
      commit([...rects, rect]);
      setSelectedIndex(rects.length);
      // On a mouse the box editor opens right away. On a finger it is a bottom
      // sheet that would cover the image after every rectangle — accidental ones
      // included — so there it stays a deliberate tap on the box.
      if (!isCoarsePointer) {
        activeBox.openNewest(rects.length, anchor);
      }
    },
    [activeBox, commit, isCoarsePointer, rects],
  );

  const { canvasRef, handlers } = useCanvasEditor({
    image,
    rects,
    selectedIndex,
    onAdd,
    onSelect: setSelectedIndex,
    onPick: activeBox.open,
    mode: canvasMode,
    lines: detectLines,
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

  const {
    armed: startOverArmed,
    request: requestStartOver,
    disarm: disarmStartOver,
  } = useConfirmAction();

  const startOver = useCallback(() => {
    reset();
    resetHistory();
    detectTypes.reset();
    setSelectedIndex(-1);
    setExportError(null);
    setNotice(null);
    setToolsOpen(false);
    setStageExpanded(true);
    disarmStartOver();
  }, [detectTypes, disarmStartOver, reset, resetHistory]);

  const openFile = useCallback(
    async (file: File) => {
      setSelectedIndex(-1);
      setExportError(null);
      // A freshly opened image invalidates any pending "confirm start over",
      // and its boxes/chips must not carry over from the previous one.
      disarmStartOver();
      setStageExpanded(true);
      clearDetectResult();
      detectTypes.reset();
      await loadFile(file);
    },
    [clearDetectResult, detectTypes, disarmStartOver, loadFile],
  );

  useEffect(() => {
    openFileRef.current = (file) => {
      // A paste is a single image, so any "first file only" notice is stale.
      setNotice(null);
      void openFile(file);
    };
  }, [openFile]);

  const runAutoDetect = useCallback(async () => {
    // Recognition reads the decoded original, not the on-screen canvas, so the
    // tool's own overlay can never be mistaken for document text. Existing boxes
    // are handed in so duplicates can be filtered before they reach the canvas.
    const found = await runDetect(image, rects, ocrPacks.ids);
    if (found.length === 0) {
      return;
    }
    // The pool must hold everything detection produced, not just what was new:
    // chip counts and restore-after-uncheck both read from it.
    detectTypes.register(found);
    // Auto boxes join the same history stack, so undo removes them in one step.
    commit([...rects, ...found]);
    setSelectedIndex(-1);
  }, [commit, detectTypes, image, ocrPacks.ids, rects, runDetect]);

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
      onStartOver={() => requestStartOver(startOver)}
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
      packs={ocrPacks}
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
            <div className="min-w-0">
              <CanvasStage
                image={image}
                canvasRef={canvasRef}
                handlers={handlers}
                interactive={interactive}
                dragging={dragging}
                dragProps={dragProps}
                expanded={stageExpanded}
                onToggleExpanded={() => setStageExpanded((open) => !open)}
                fit={fit}
                onFitChange={setFit}
                showModeSwitch={isCoarsePointer}
                canvasMode={canvasMode}
                onCanvasModeChange={setCanvasMode}
              />
            </div>

            {/* One panel, two placements: right column on desktop, bottom
                drawer on a phone. Visibility is CSS-only. */}
            <ToolPanel open={toolsOpen} onClose={() => setToolsOpen(false)}>
              {toolbar}
            </ToolPanel>
          </div>

          <MobileActionBar
            toolsOpen={toolsOpen}
            onToggleTools={() => setToolsOpen((open) => !open)}
            onCloseTools={() => setToolsOpen(false)}
            onDownload={() => {
              void download();
            }}
          />
        </>
      ) : (
        <>
          <ImageIntake
            dragging={dragging}
            dragProps={dragProps}
            inputRef={fileInputRef}
          />
          <p className="measure text-label leading-relaxed text-ink-3">{PRIVACY_NOTE}</p>
        </>
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
