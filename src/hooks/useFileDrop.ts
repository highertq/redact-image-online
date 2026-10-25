"use client";

import { useCallback, useState, type DragEvent } from "react";

/**
 * Drag-and-drop plumbing shared by the drop zone and the canvas container.
 *
 * `dragleave` also fires when the pointer crosses onto a child element, so the
 * related target is checked before clearing the highlight — otherwise the border
 * flickers the moment the cursor touches the label text.
 */
export default function useFileDrop(onFiles: (files: FileList | null) => void) {
  const [dragging, setDragging] = useState(false);

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) {
      return;
    }
    setDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragging(false);
      onFiles(event.dataTransfer.files);
    },
    [onFiles],
  );

  return { dragging, dragProps: { onDragOver, onDragLeave, onDrop } };
}
