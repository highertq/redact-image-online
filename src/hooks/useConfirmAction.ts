"use client";

import { useCallback, useEffect, useState } from "react";

const CONFIRM_WINDOW_MS = 3000;

/**
 * Two-step confirm for "Start over", extracted from the editor to keep that
 * component inside the project's size ceiling. `request(action)` arms on the
 * first call and runs the action on a second call within the window. The timer
 * is cleared on unmount and whenever the arm state flips, so a stale timeout
 * can never disarm a later confirmation.
 */
export default function useConfirmAction() {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) {
      return;
    }
    const timer = window.setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS);
    return () => window.clearTimeout(timer);
  }, [armed]);

  const request = useCallback((action: () => void) => {
    if (!armed) {
      setArmed(true);
      return;
    }
    action();
  }, [armed]);

  const disarm = useCallback(() => setArmed(false), []);

  return { armed, request, disarm };
}
