"use client";

import { useCallback, useState } from "react";

import type { Rect } from "@/lib/geometry";
import type { FillStyle } from "@/lib/image";

export type Anchor = { left: number; top: number; width: number; height: number };

export type ActiveBox = { index: number; anchor: Anchor };

/** The only mutations the popover can request. */
export type BoxPatch = { style?: FillStyle | undefined; skip?: boolean };

type Options = {
  rects: readonly Rect[];
  commit: (next: Rect[]) => void;
  setSelectedIndex: (index: number) => void;
  /** Lets the type-filter pool drop boxes that were deleted here. */
  onRectsRemoved: (next: readonly Rect[]) => void;
};

/**
 * Owns "which box currently has its editor open" plus every mutation that editor
 * can perform. Kept out of Redactor because the component was already near the
 * 400-line ceiling and this is a self-contained concern.
 */
export default function useActiveBox({
  rects,
  commit,
  setSelectedIndex,
  onRectsRemoved,
}: Options) {
  const [active, setActive] = useState<ActiveBox | null>(null);

  const open = useCallback(
    (index: number, anchor: Anchor) => {
      // A negative index means "clicked empty canvas": close instead of opening.
      if (index < 0) {
        setActive(null);
        setSelectedIndex(-1);
        return;
      }
      setActive({ index, anchor });
      setSelectedIndex(index);
    },
    [setSelectedIndex],
  );

  const close = useCallback(() => {
    setActive(null);
  }, []);

  /** Called after a fresh box is committed, so the new box is immediately editable. */
  const openNewest = useCallback(
    (index: number, anchor: Anchor) => {
      setActive({ index, anchor });
    },
    [],
  );

  const patch = useCallback(
    (changes: BoxPatch) => {
      if (!active) {
        return;
      }
      const next = rects.map((rect, index) =>
        index === active.index ? { ...rect, ...changes } : rect,
      );
      commit(next);
    },
    [active, commit, rects],
  );

  const remove = useCallback(() => {
    if (!active) {
      return;
    }
    const next = rects.filter((_, index) => index !== active.index);
    onRectsRemoved(next);
    commit(next);
    setSelectedIndex(-1);
    setActive(null);
  }, [active, commit, onRectsRemoved, rects, setSelectedIndex]);

  const resetStyle = useCallback(() => {
    if (!active) {
      return;
    }
    const next = rects.map((rect, index) => {
      if (index !== active.index) {
        return rect;
      }
      // Rebuild without the `style` key entirely, so the box goes back to
      // following the toolbar default rather than pinning the current value.
      const copy: Rect = {
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h,
      };
      if (rect.label !== undefined) {
        copy.label = rect.label;
      }
      if (rect.auto !== undefined) {
        copy.auto = rect.auto;
      }
      if (rect.skip !== undefined) {
        copy.skip = rect.skip;
      }
      return copy;
    });
    commit(next);
  }, [active, commit, rects]);

  const activeRect = active ? rects[active.index] : undefined;

  return {
    active: activeRect ? active : null,
    rect: activeRect,
    open,
    openNewest,
    close,
    patch,
    remove,
    resetStyle,
  };
}
