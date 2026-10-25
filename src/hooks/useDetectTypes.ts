"use client";

import { useCallback, useState } from "react";

import {
  applyTypeFilter,
  countByType,
  enableTypes,
  mergeUnique,
  rectKey,
  toggleType,
  type TypeChip,
} from "@/lib/detect-types";
import type { Rect } from "@/lib/geometry";

export type TypeFilterState = {
  enabled: string[];
  chips: TypeChip[];
  toggle: (type: string) => void;
  /** Records a fresh detection result so chips and the restore pool stay in sync. */
  register: (found: readonly Rect[]) => void;
  /** Forgets everything about the previous image. */
  reset: () => void;
  /**
   * Called when boxes disappear for a reason other than a chip toggle (delete,
   * clear all, undo). A vanished auto box must leave the pool too, or the next
   * toggle would resurrect it.
   */
  syncPool: (current: readonly Rect[]) => void;
};

/**
 * Owns the "which auto-detected types are visible" state.
 *
 * Two lists run in parallel: the boxes on the canvas (owned by the history hook)
 * and `pool`, every auto box the latest detection produced for this image. The
 * pool is what makes a toggle reversible — disabling a type only hides its
 * boxes, and re-enabling restores them from the pool.
 */
export default function useDetectTypes(
  rects: readonly Rect[],
  commit: (next: Rect[]) => void,
): TypeFilterState {
  const [enabled, setEnabled] = useState<string[]>([]);
  const [pool, setPool] = useState<Rect[]>([]);

  // Chips count the *detected* boxes, not the visible ones, so a chip keeps
  // showing "Email 2" while its boxes are hidden. That is what tells the user
  // there is something to switch back on.
  const chips = countByType(pool);

  const register = useCallback((found: readonly Rect[]) => {
    // Merge, not replace: a second detection pass can surface types the first
    // one missed, and the already-added boxes must stay in the pool so their
    // chips keep working.
    setPool((previous) => mergeUnique(previous, found));
    setEnabled((current) => enableTypes(current, found));
  }, []);

  const reset = useCallback(() => {
    setPool([]);
    setEnabled([]);
  }, []);

  const syncPool = useCallback(
    (current: readonly Rect[]) => {
      setPool((previous) => {
        if (previous.length === 0) {
          return previous;
        }
        const visible = new Set(current.map(rectKey));
        // Only boxes whose type is still enabled can be judged "gone". A box
        // missing because its chip is off is hidden on purpose and must stay in
        // the pool, otherwise deleting one manual box would wipe a whole type.
        const pruned = previous.filter(
          (rect) =>
            visible.has(rectKey(rect)) ||
            rect.label === undefined ||
            !enabled.includes(rect.label),
        );
        return pruned.length === previous.length ? previous : pruned;
      });
    },
    [enabled],
  );

  const toggle = useCallback(
    (type: string) => {
      const next = toggleType(enabled, type);
      setEnabled(next);
      // Rebuild through the shared filter so a restored box never doubles up
      // with one that already sits on the canvas.
      commit(applyTypeFilter(rects, pool, next));
    },
    [commit, enabled, pool, rects],
  );

  return { enabled, chips, toggle, register, reset, syncPool };
}
