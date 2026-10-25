/**
 * Helpers for pulling an image out of a paste event's clipboard data.
 *
 * Typed structurally rather than against `DataTransfer` / `DataTransferItem` so
 * the selection logic can be unit-tested in a plain Node environment (the vitest
 * config uses `environment: "node"`, where those DOM types do not exist). The
 * file type is generic, so in the browser the result is a real `File`.
 */

/** Minimum shape a clipboard entry must expose for the picker to inspect it. */
export type ClipboardFileLike = { type: string };

export type ClipboardItemLike<T extends ClipboardFileLike> = {
  kind?: string;
  type: string;
  getAsFile?: () => T | null;
};

export type ClipboardDataLike<T extends ClipboardFileLike> = {
  files?: ArrayLike<T> | null;
  items?: ArrayLike<ClipboardItemLike<T>> | null;
};

export function isImageType(type: string): boolean {
  return type.toLowerCase().startsWith("image/");
}

/**
 * Returns the first `image/*` file found on the clipboard data, or `null`.
 *
 * `files` is checked before `items` because every browser that populates
 * `clipboardData.files` also duplicates those entries in `items`, and `files`
 * needs no `getAsFile()` round-trip. Non-image entries are skipped rather than
 * aborting the search, so a clipboard holding both text and a screenshot still
 * yields the screenshot.
 */
export function pickImageFromClipboard<T extends ClipboardFileLike>(
  data: ClipboardDataLike<T> | null | undefined,
): T | null {
  if (!data) {
    return null;
  }

  const files = data.files;
  if (files) {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      if (file && isImageType(file.type)) {
        return file;
      }
    }
  }

  const items = data.items;
  if (items) {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item) {
        continue;
      }
      // `kind` is "string" for plain-text payloads; only file entries can be
      // turned back into something loadable.
      if (item.kind !== undefined && item.kind !== "file") {
        continue;
      }
      if (!isImageType(item.type)) {
        continue;
      }
      const file = item.getAsFile?.();
      if (file) {
        return file;
      }
    }
  }

  return null;
}

const EDITABLE_TAGS = /^(INPUT|TEXTAREA|SELECT)$/;

/**
 * True when the event target sits inside a control that expects its own paste
 * handling, so a global paste listener must stay out of the way.
 */
export function isEditableTarget(
  target: { tagName?: string; isContentEditable?: boolean } | null | undefined,
): boolean {
  if (!target) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName ?? "";
  return EDITABLE_TAGS.test(tag.toUpperCase());
}
