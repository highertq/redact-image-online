"use client";

import { useEffect } from "react";

type Options = {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  deleteEnabled: boolean;
};

/** Wires Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Delete, and Backspace. */
export default function useEditorShortcuts({
  onUndo,
  onRedo,
  onDelete,
  deleteEnabled,
}: Options): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && deleteEnabled) {
        event.preventDefault();
        onDelete();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteEnabled, onDelete, onRedo, onUndo]);
}
