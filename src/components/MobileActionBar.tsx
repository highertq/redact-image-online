"use client";

import { IconDownload, IconSliders } from "@/components/Icons";

type Props = {
  toolsOpen: boolean;
  onToggleTools: () => void;
  onCloseTools: () => void;
  onDownload: () => void;
};

/**
 * Phone-only chrome: the scrim behind the tool drawer and the action bar that
 * keeps Tools and Download reachable while the canvas is immersive. The bar
 * must be a sibling of the drawer rather than its parent — a transform on an
 * ancestor turns `position: fixed` descendants into something that scrolls
 * with the page.
 */
export default function MobileActionBar({
  toolsOpen,
  onToggleTools,
  onCloseTools,
  onDownload,
}: Props) {
  return (
    <>
      {toolsOpen ? (
        <button
          type="button"
          aria-label="Close tools"
          onClick={onCloseTools}
          className="fixed inset-0 z-[35] bg-ink/20 lg:hidden"
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-paper/95 px-4 pb-safe-2 pt-2 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={onToggleTools}
          aria-expanded={toolsOpen}
          aria-controls="tool-panel"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line bg-paper px-3 text-body-sm font-semibold text-ink transition-hover hover:bg-surface-2"
        >
          <IconSliders className="h-4 w-4" />
          Tools
        </button>
        <button
          type="button"
          onClick={onDownload}
          aria-label="Download redacted PNG"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-ink px-3 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
        >
          <IconDownload className="h-4 w-4" />
          Download PNG
        </button>
      </div>
    </>
  );
}
