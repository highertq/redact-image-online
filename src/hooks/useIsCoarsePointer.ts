"use client";

import { useSyncExternalStore } from "react";

const COARSE_POINTER = "(pointer: coarse)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const query = window.matchMedia(COARSE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(COARSE_POINTER).matches;
}

/** Server and hydration render both assume a fine pointer. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * True on touch-first devices (phones, tablets).
 *
 * `useSyncExternalStore` is what keeps this hydration-safe: the server snapshot
 * is always `false`, so the first client render matches the server HTML, and the
 * real value arrives on the very next tick without a setState-in-effect cascade.
 * It also reacts if the pointer type changes (e.g. a tablet docking a mouse).
 */
export default function useIsCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
