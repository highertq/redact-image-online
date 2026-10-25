import { describe, expect, it } from "vitest";

import {
  MAX_FILE_BYTES,
  MAX_PIXELS,
  outputFileName,
  pixelateBlockSize,
  validateDimensions,
  validateFileMeta,
  MIN_PIXELATE_BLOCK,
} from "@/lib/image";

describe("validateFileMeta", () => {
  it("accepts PNG, JPEG, and WebP", () => {
    expect(validateFileMeta("image/png", 1000)).toBeNull();
    expect(validateFileMeta("image/jpeg", 1000)).toBeNull();
    expect(validateFileMeta("image/webp", 1000)).toBeNull();
  });

  it("rejects GIF, SVG, and other types", () => {
    expect(validateFileMeta("image/gif", 1000)).toBe("unsupported-type");
    expect(validateFileMeta("image/svg+xml", 1000)).toBe("unsupported-type");
    expect(validateFileMeta("application/pdf", 1000)).toBe("unsupported-type");
    expect(validateFileMeta("", 1000)).toBe("unsupported-type");
  });

  it("rejects files above 25 MB", () => {
    expect(validateFileMeta("image/png", MAX_FILE_BYTES + 1)).toBe("too-large");
  });

  it("accepts a file exactly at the 25 MB limit", () => {
    expect(validateFileMeta("image/png", MAX_FILE_BYTES)).toBeNull();
  });

  it("checks the type before the size", () => {
    expect(validateFileMeta("image/gif", MAX_FILE_BYTES + 1)).toBe(
      "unsupported-type",
    );
  });
});

describe("validateDimensions", () => {
  it("accepts normal dimensions", () => {
    expect(validateDimensions(1920, 1080)).toBeNull();
  });

  it("accepts an image exactly at 40 million pixels", () => {
    expect(validateDimensions(8000, 5000)).toBeNull();
  });

  it("rejects an image above 40 million pixels", () => {
    expect(validateDimensions(8000, 5001)).toBe("too-many-pixels");
    expect(MAX_PIXELS).toBe(40_000_000);
  });

  it("rejects zero or negative dimensions", () => {
    expect(validateDimensions(0, 100)).toBe("decode-failed");
    expect(validateDimensions(100, 0)).toBe("decode-failed");
    expect(validateDimensions(-1, 100)).toBe("decode-failed");
  });
});

describe("pixelateBlockSize", () => {
  it("never goes below the 12 px floor", () => {
    expect(MIN_PIXELATE_BLOCK).toBe(12);
    expect(pixelateBlockSize(100, 100)).toBeGreaterThanOrEqual(12);
    expect(pixelateBlockSize(1, 1)).toBe(12);
  });

  it("scales up on large images", () => {
    expect(pixelateBlockSize(4000, 3000)).toBeGreaterThan(
      pixelateBlockSize(400, 300),
    );
  });
});

describe("outputFileName", () => {
  it("prefixes the base name and forces a png extension", () => {
    expect(outputFileName("screenshot.png")).toBe("redacted-screenshot.png");
    expect(outputFileName("photo.jpeg")).toBe("redacted-photo.png");
    expect(outputFileName("shot.JPG")).toBe("redacted-shot.png");
  });

  it("strips directory components", () => {
    expect(outputFileName("/tmp/a/b/cat.png")).toBe("redacted-cat.png");
    expect(outputFileName("C:\\Users\\me\\cat.png")).toBe("redacted-cat.png");
  });

  it("keeps dots that are not the extension", () => {
    expect(outputFileName("my.shot.v2.png")).toBe("redacted-my.shot.v2.png");
  });

  it("falls back to image when the name is unusable", () => {
    expect(outputFileName("")).toBe("redacted-image.png");
    expect(outputFileName(".png")).toBe("redacted-image.png");
  });
});
