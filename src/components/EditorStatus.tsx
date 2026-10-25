"use client";

import type { RefObject } from "react";

type Props = {
  error: string | null;
  notice: string | null;
  busy: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onFiles: (files: FileList | null) => void;
};

/**
 * The hidden file input plus the three status banners that sit above the canvas.
 *
 * The input stays in the DOM so the native picker works, but `sr-only` +
 * `aria-hidden` + `tabIndex={-1}` keep it out of the tab order — the visible
 * drop-zone button is the only keyboard entry point.
 */
export default function EditorStatus({
  error,
  notice,
  busy,
  inputRef,
  onFiles,
}: Props) {
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {error ? (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {notice}
        </p>
      ) : null}

      {busy ? (
        <p role="status" className="text-sm text-neutral-600">
          Loading image…
        </p>
      ) : null}
    </>
  );
}
