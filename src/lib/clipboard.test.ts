import { describe, expect, it } from "vitest";

import {
  isEditableTarget,
  isImageType,
  pickImageFromClipboard,
  type ClipboardDataLike,
} from "@/lib/clipboard";

function file(type: string) {
  return { type };
}

function clipboardItem(type: string, kind = "file", fileValue = file(type)) {
  return { kind, type, getAsFile: () => fileValue };
}

describe("isImageType", () => {
  it("accepts every image subtype", () => {
    expect(isImageType("image/png")).toBe(true);
    expect(isImageType("image/jpeg")).toBe(true);
    expect(isImageType("IMAGE/WEBP")).toBe(true);
  });

  it("rejects non-image types", () => {
    expect(isImageType("text/plain")).toBe(false);
    expect(isImageType("application/pdf")).toBe(false);
    expect(isImageType("")).toBe(false);
  });
});

describe("pickImageFromClipboard", () => {
  it("returns the image when the clipboard holds one", () => {
    const png = file("image/png");
    const data: ClipboardDataLike<{ type: string }> = { files: [png], items: [] };
    expect(pickImageFromClipboard(data)).toBe(png);
  });

  it("returns null when the clipboard holds no image", () => {
    expect(pickImageFromClipboard({ files: [file("text/plain")] })).toBeNull();
    expect(
      pickImageFromClipboard({ items: [clipboardItem("text/plain", "string")] }),
    ).toBeNull();
  });

  it("skips non-image entries and returns the first image from several files", () => {
    const first = file("image/jpeg");
    const second = file("image/png");
    const data: ClipboardDataLike<{ type: string }> = {
      files: [file("text/plain"), first, second],
    };
    expect(pickImageFromClipboard(data)).toBe(first);
  });

  it("returns null for empty clipboard data", () => {
    expect(pickImageFromClipboard({ files: [], items: [] })).toBeNull();
    expect(pickImageFromClipboard({})).toBeNull();
    expect(pickImageFromClipboard(null)).toBeNull();
    expect(pickImageFromClipboard(undefined)).toBeNull();
  });

  it("falls back to items when files is absent", () => {
    const png = file("image/png");
    const data: ClipboardDataLike<{ type: string }> = { items: [clipboardItem("image/png", "file", png)] };
    expect(pickImageFromClipboard(data)).toBe(png);
  });

  it("ignores string-kind items even when they claim an image type", () => {
    const data: ClipboardDataLike<{ type: string }> = {
      items: [clipboardItem("image/png", "string")],
    };
    expect(pickImageFromClipboard(data)).toBeNull();
  });

  it("keeps looking when getAsFile returns null", () => {
    const png = file("image/png");
    const data: ClipboardDataLike<{ type: string }> = {
      items: [
        { kind: "file", type: "image/png", getAsFile: () => null },
        clipboardItem("image/png", "file", png),
      ],
    };
    expect(pickImageFromClipboard(data)).toBe(png);
  });
});

describe("isEditableTarget", () => {
  it("flags form controls and contenteditable hosts", () => {
    expect(isEditableTarget({ tagName: "INPUT" })).toBe(true);
    expect(isEditableTarget({ tagName: "TEXTAREA" })).toBe(true);
    expect(isEditableTarget({ tagName: "SELECT" })).toBe(true);
    expect(isEditableTarget({ isContentEditable: true })).toBe(true);
  });

  it("lets ordinary elements through", () => {
    expect(isEditableTarget({ tagName: "BUTTON" })).toBe(false);
    expect(isEditableTarget({ tagName: "BODY" })).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget(undefined)).toBe(false);
  });
});
