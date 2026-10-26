"use client";

import type { ReactNode } from "react";

import { IconClose } from "@/components/Icons";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * The tool panel's placement shell. One instance, two modes: a right-hand
 * column on desktop (always visible, static) and a bottom drawer on a phone
 * (toggled by the action bar). Only visibility lives here — the controls are
 * passed in so their state stays in the editor.
 */
export default function ToolPanel({ open, onClose, children }: Props) {
  return (
    <div
      id="tool-panel"
      className={`fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-lg border-t border-line bg-paper p-4 shadow-pop transition-page max-lg:bottom-[calc(3.75rem+env(safe-area-inset-bottom))] lg:static lg:z-auto lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-lg lg:border lg:border-line lg:bg-surface lg:p-4 lg:opacity-100 lg:shadow-none ${
        open
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-full opacity-0 lg:visible"
      }`}
    >
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <p className="text-body font-semibold text-ink">Tools</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close tools"
          className="-mr-1 grid h-11 w-11 place-items-center rounded-md text-ink-2 transition-hover hover:bg-surface-2 hover:text-ink"
        >
          <IconClose className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  );
}
