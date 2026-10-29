#!/usr/bin/env python3
"""Is the thing you covered actually covered? A checker you can run on your own file.

Run:
    python scripts/redaction-inspect.py my-image.png
    python scripts/redaction-inspect.py my-image.png --attack

Why this exists: the experiment in `deblur-experiment.py` measures concealment
methods applied by a tool. It cannot tell you about the file that came out of
your phone's markup editor, and that file is the one people actually share. The
common failure there is not a weak filter — it is a shape sitting *on top* of
content that is still present underneath, which looks correct in the preview and
is not correct in the file.

What it does:
  1. Loads the image and reports its format, dimensions, colour mode, whether an
     alpha channel exists, and whether any fully or partially transparent
     covering region could be hiding pixels.
  2. Finds uniform rectangular regions — the signature of a solid fill — and for
     each reports how far the values inside it spread. A real fill has a spread of
     about zero: one colour, written over the pixels. A blur or mosaic has a
     large spread because the original detail is still in there, averaged.
  3. With --attack, runs the same pipeline the experiment uses (stretch, upscale,
     unsharp, Richardson-Lucy, OCR) over each region and prints what it reads.
     A fill should return noise; a light blur returns the text.

Scope, stated plainly: this inspects one raster file. PDFs, layered design
exports, Live Photos and HEIC sequences can all carry the original content
somewhere else, and nothing here looks for that. If a document could have been
redacted as a PDF, check the PDF's own object list instead of trusting a
screenshot of it.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

MIN_REGION_PX = 40  # smaller uniform patches are usually icons, not redactions


def load(path: Path):
    img = Image.open(path)
    mode = img.mode
    has_alpha = mode in ("RGBA", "LA", "PA") or (mode == "P" and "transparency" in img.info)
    rgb = img.convert("RGB")
    gray = cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2GRAY)
    alpha = np.array(img.split()[-1]) if has_alpha else None
    return {
        "format": img.format,
        "size": img.size,
        "mode": mode,
        "frames": getattr(img, "n_frames", 1),
        "gamma": img.info.get("gamma"),
        "icc": bool(img.info.get("icc_profile")),
        "gray": gray,
        "alpha": alpha,
        "has_alpha": has_alpha,
    }


def uniform_regions(gray: np.ndarray, alpha) -> list[dict]:
    """Candidate covers: connected areas of one colour, with a rectangle check.

    The obvious approach — a sliding-window standard deviation to find flat
    regions — fails on the exact thing this tool exists to catch. A drawn bar is
    often only a dozen pixels tall, and a window larger than that averages the
    white page into it, so a perfectly solid fill looks "textured" and is
    reported as nothing. A checker that reports nothing on a covered file is the
    worst possible outcome: not an error, a clean bill of health.

    So the segmentation is by quantised colour, and the flatness is measured on
    the component's own pixels: how much of the bounding rectangle holds the
    dominant value, and how wide the values inside the component actually are.
    """
    levels = np.clip(np.round(gray / 16).astype(np.int32), 0, 15)
    mask_base = np.ones(gray.shape, dtype=np.uint8) * 255
    if alpha is not None:
        # A patch where the file is transparent is not a cover; it is a hole.
        mask_base = np.where(alpha < 250, 0, 255).astype(np.uint8)

    regions = []
    for level in range(16):
        mask = ((levels == level).astype(np.uint8) * 255) & mask_base
        if not mask.any():
            continue
        # Close over the glyphs' own holes so a bar drawn across text still
        # forms one component rather than a dozen letter-shaped ones.
        closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
        _n, _labels, stats, _cent = cv2.connectedComponentsWithStats(closed, connectivity=8)
        for i in range(1, stats.shape[0]):
            x, y, w, h, area = (int(v) for v in stats[i])
            if area < MIN_REGION_PX or w < 10 or h < 6:
                continue
            inside = gray[y : y + h, x : x + w]
            fill = np.bincount(inside.reshape(-1), minlength=256)
            dominant = int(np.argmax(fill))
            # Pixels within tolerance of the cover colour, as a share of the
            # rectangle. A real bar is ~1.0; a run of letters of similar colour
            # on a similar background is far below.
            tolerance = 10
            near = int(((np.abs(inside.astype(np.int32) - dominant) <= tolerance)).sum())
            regions.append(
                {
                    "box": [x, y, w, h],
                    "area": area,
                    "dominantValue": dominant,
                    "purity": round(near / max(1, w * h), 4),
                    "stdev": round(float(inside.std()), 2),
                    "coversWholeImage": w >= gray.shape[1] * 0.999 and h >= gray.shape[0] * 0.999,
                }
            )
    return sorted(regions, key=lambda r: -r["purity"] * -r["area"])


def attack_whole(gray: np.ndarray) -> str:
    """The same attack across the entire picture, not just a detected box.

    Needed because the interesting file is the one the checker cannot find a
    cover in: a light blur leaves no uniform region at all, and reporting
    "nothing found" there would read as a pass. Attacking the whole image is what
    turns that case into the loud one — the text comes back, and the reader sees
    it come back.
    """
    return attack_region(gray, [0, 0, gray.shape[1], gray.shape[0]])


def attack_region(gray: np.ndarray, box: list[int]) -> str:
    """Run the experiment's attack over one region and return what OCR reads."""
    x, y, w, h = box
    crop = gray[y : y + h, x : x + w]
    if crop.size == 0:
        return ""
    norm = cv2.normalize(crop, None, 0, 255, cv2.NORM_MINMAX)
    up = cv2.resize(norm, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
    sharp = cv2.addWeighted(up, 1.75, cv2.GaussianBlur(up, (0, 0), 3), -0.75, 0)
    try:
        import importlib.util

        spec = importlib.util.spec_from_file_location(
            "exp", Path(__file__).with_name("deblur-experiment.py")
        )
        exp = importlib.util.module_from_spec(spec)
        sys.modules["exp"] = exp  # the experiment module defines a dataclass
        spec.loader.exec_module(exp)
        return exp.ocr(sharp) or "(nothing)"
    except (OSError, AttributeError, RuntimeError) as error:  # keep the report usable
        return f"attack unavailable: {type(error).__name__}"


def report(path: Path, do_attack: bool) -> int:
    data = load(path)
    gray, alpha = data["gray"], data["alpha"]
    print(f"file            {path}")
    print(f"format / mode   {data['format']} / {data['mode']}")
    print(f"dimensions      {data['size'][0]} x {data['size'][1]}")
    print(f"frames          {data['frames']}" + ("  <-- more than one page/frame: check them all" if data["frames"] > 1 else ""))
    print(f"alpha channel   {'yes' if data['has_alpha'] else 'no'}")

    if data["has_alpha"] and alpha is not None:
        transparent = int((alpha < 250).sum())
        if transparent:
            print(
                f"                WARNING {transparent} px are not fully opaque. Anything drawn "
                "with transparency over content still leaves that content in the file."
            )

    regions = uniform_regions(gray, alpha if data["has_alpha"] else None)
    real = [r for r in regions if not r["coversWholeImage"]]
    if not real:
        print("\nno uniform rectangular region found")
        print(
            "   That is not a pass. A photo with no solid cover in it has nothing here to\n"
            "   measure — if you meant to hide something, this file may not contain a cover\n"
            "   at all, or the cover is a blur, which is the weak case. Check by eye at 100%."
        )
        return 0

    print(f"\n{len(real)} uniform region(s), largest first:\n")
    for region in real[:12]:
        x, y, w, h = region["box"]
        verdict = (
            "SOLID FILL — one value written over the pixels"
            if region["purity"] > 0.97 and region["stdev"] < 6
            else "PARTIALLY FLAT — check this one at full zoom"
            if region["purity"] > 0.85
            else "NOT A FILL — detail survives inside this region"
        )
        print(
            f"  box {x:>5},{y:>5} {w:>4}x{h:<4} purity {region['purity']:.3f}"
            f"  stdev {region['stdev']:>6}  value {region['dominantValue']:>3}  {verdict}"
        )
        if do_attack:
            print(f"      attack reads: {attack_region(gray, region['box'])!r}")

    if do_attack:
        whole = attack_whole(gray)
        print(f"\nwhole-image attack reads: {whole!r}")
        print(
            "   The attack is stretch, 4x upscale, unsharp and Richardson-Lucy\n"
            "   deconvolution, then OCR. Garbage on a solid fill is the good result: the reader is\n"
            "   inventing text because none is left. Anything legible in that line — your name, a\n"
            "   number, an address — is still in the file, whatever the preview looks like."
        )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Check whether a covered region really covers.")
    parser.add_argument("image", type=Path)
    parser.add_argument("--attack", action="store_true", help="run the recovery pipeline on each region")
    args = parser.parse_args()
    if not args.image.exists():
        print(f"no such file: {args.image}", file=sys.stderr)
        return 2
    return report(args.image, args.attack)


if __name__ == "__main__":
    raise SystemExit(main())
