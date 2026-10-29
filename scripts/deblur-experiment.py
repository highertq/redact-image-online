#!/usr/bin/env python3
"""Can covered text in an image be recovered? An experiment, not an opinion.

Run:  python scripts/deblur-experiment.py
Out:  stdout table + /tmp/redact-experiment/results.json and evidence crops.

Three concealment methods are compared against attacks a competent outsider
could run on their own laptop, with no access to the original file:

  black   solid fill, the strongest mode of the redaction tool
  white   same, in the page background colour
  pix4 / pix8 / pix16   pixelation with 4, 8 and 16-pixel blocks
  blur2 / blur4 / blur8  Gaussian blur, radius 2/4/8 px

Blur is included because it is what phone markup and most "blur text online"
features produce, and the question people actually ask is whether that is safe.
It is not offered by this tool as a redaction method.

Attacks, applied in one shared pipeline so every method is treated the same way:

  1. contrast stretch to full range   (levels adjustment)
  2. 4x bicubic upscale then unsharp  (the "make it bigger and sharpen" step)
  3. Richardson-Lucy deconvolution    (iterative Wiener-style inverse filtering,
     the standard textbook attack on defocused or blurred text)
  4. OCR with Tesseract in single-line mode
  5. template matching against glyphs rendered with the same font and the same
     degradation  -- this is the attack that actually breaks small pixelation,
     and it needs the attacker to know the font and the block size. That
     assumption is stated in the results, because it is the whole reason the
     pixelation numbers are not generalised to "pixelation is unsafe".

Scoring is per string: EXACT means the OCR or matcher returned the secret
character for character; CER is the character error rate against the truth.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(tempfile.gettempdir()) / "redact-experiment"
FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Verdana.ttf",
    "/Library/Fonts/Arial.ttf",
]

# Real strings of the shape that gets screenshotted: an SSN, a card tail, a
# mobile number, an email, a name. Mixed case and punctuation, because that is
# what the documents actually contain.
SAMPLES = [
    "123-45-6789",
    "5500 0010 0000 0004",
    "+1 415 555 0132",
    "alice.carter@example.com",
    "Alice B. Carter",
    "2400 Mission St",
    "PIN 4417",
    "IBAN GB82WEST12345698765432",
]

BLOCK_SIZES = (4, 8, 16)
BLUR_RADII = (2, 4, 8)
TEXT_HEIGHT = 26  # roughly 11pt on a phone screenshot at device scale
TEXT_HEIGHT_PX = TEXT_HEIGHT


def pick_font(size: int):
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


@dataclass
class Case:
    method: str
    text: str
    image: np.ndarray  # grayscale uint8, what the attacker sees
    recovered_ocr: str = ""
    recovered_template: str = ""
    notes: dict = field(default_factory=dict)


def render(text: str) -> np.ndarray:
    font = pick_font(TEXT_HEIGHT_PX)
    probe = Image.new("L", (8, 8))
    metrics = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
    w = metrics[2] - metrics[0] + 48
    h = max(48, metrics[3] - metrics[1] + 32)
    img = Image.new("L", (w, h), 255)
    draw = ImageDraw.Draw(img)
    draw.text((24 - metrics[0], (h - (metrics[3] - metrics[1])) // 2 - metrics[1]), text, font=font, fill=10)
    return np.array(img)


def apply_black(img):
    out = img.copy()
    out[20:-20, 20:-20] = 0
    return out


def apply_white(img):
    out = img.copy()
    out[20:-20, 20:-20] = 255
    return out


def apply_pixelate(img, block):
    h, w = img.shape[:2]
    small = cv2.resize(img, (max(1, w // block), max(1, h // block)), interpolation=cv2.INTER_AREA)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)


def apply_blur(img, radius):
    k = int(radius * 2 + 1)
    return cv2.GaussianBlur(img, (k, k), radius)


def attack_pipeline(img: np.ndarray) -> np.ndarray:
    """Stretch, upscale, unsharp: the cheap steps an attacker tries first."""
    norm = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX)
    up = cv2.resize(norm, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
    blur = cv2.GaussianBlur(up, (0, 0), 3)
    return cv2.addWeighted(up, 1.75, blur, -0.75, 0)


def richardson_lucy(img: np.ndarray, kernel_size: int, iterations: int = 120) -> np.ndarray:
    """Richardson-Lucy deconvolution against a Gaussian PSF of the given radius."""
    obs = np.clip(img.astype(np.float64), 1e-6, None) / 255.0
    k = int(kernel_size * 2 + 1)
    psf = cv2.getGaussianKernel(k, kernel_size) @ cv2.getGaussianKernel(k, kernel_size).T
    estimate = np.full_like(obs, obs.mean())
    psf_flip = psf[::-1, ::-1]
    for _ in range(iterations):
        blurred = cv2.filter2D(estimate, -1, psf, borderType=cv2.BORDER_CONSTANT)
        ratio = cv2.divide(obs, np.clip(blurred, 1e-12, None))
        estimate *= cv2.filter2D(ratio, -1, psf_flip, borderType=cv2.BORDER_CONSTANT)
    return np.clip(estimate * 255, 0, 255).astype(np.uint8)


def ocr(img: np.ndarray) -> str:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as handle:
        path = handle.name
    cv2.imwrite(path, img)
    try:
        done = subprocess.run(
            ["tesseract", path, "stdout", "--psm", "7"],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        return " ".join(done.stdout.split())
    except (subprocess.TimeoutExpired, OSError):
        return ""
    finally:
        Path(path).unlink(missing_ok=True)


def template_attack(img: np.ndarray, truth: str, method: str) -> str:
    """Nearest-neighbour matching of degraded glyph tiles to reference glyphs.

    This is the attack that matters for small pixelation: it does not try to
    invert the transform, it asks which candidate character would look exactly
    like this after the same transform. It presumes the attacker knows the font
    and the degradation parameters, which is stated wherever its results appear.
    """
    if not truth.strip():
        return ""
    alphabet = sorted(set("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-_@+ /"))
    refs = {}
    for ch in alphabet:
        ref = render(ch)
        refs[ch] = degrade(ref, method)
    work = cv2.threshold(attack_pipeline(img), 128, 255, cv2.THRESH_BINARY)[1]
    cols = np.where((work < 200).any(axis=0))[0]
    if len(cols) == 0:
        return ""
    gaps = np.where(np.diff(cols) > 3)[0]
    groups = np.split(cols, gaps + 1)
    out = []
    for group in groups:
        if len(group) < 2:
            continue
        x0, x1 = group[0], group[-1] + 1
        crop = img[:, x0:x1]
        if crop.shape[1] < 3:
            continue
        best, best_score = "", 1e9
        for ch, ref in refs.items():
            tw = min(ref.shape[1], crop.shape[1])
            a = cv2.resize(crop[:, :tw], (48, 48), interpolation=cv2.INTER_AREA).astype(np.float32)
            b = cv2.resize(ref[:, :tw], (48, 48), interpolation=cv2.INTER_AREA).astype(np.float32)
            score = float(np.mean(np.abs(a - b)))
            if score < best_score:
                best, best_score = ch, score
        out.append(best)
    guess = "".join(out)
    # Case and O/0 ambiguity is inherent to template matching; score the
    # comparison case-insensitively at the call site instead of pretending here.
    return guess


def messenger_reencode(img: np.ndarray, longest_edge: int = 1600, quality: int = 70) -> np.ndarray:
    """The lossy hop a shared screenshot actually takes.

    A chat app rescales to a target longest edge and re-encodes as JPEG, so this
    runs the same two operations on the covered image and hands back what the
    receiver's attacker would see. Quality 70 at 1600 px is the shape of
    WhatsApp's behaviour on a phone screenshot; it is a simulation of the step,
    not a captured sample from the app.
    """
    h, w = img.shape[:2]
    scale = longest_edge / max(h, w)
    if scale < 1:
        img = cv2.resize(img, (max(1, int(w * scale)), max(1, int(h * scale))), interpolation=cv2.INTER_AREA)
    ok, buf = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        raise RuntimeError("jpeg encode failed")
    return cv2.imdecode(buf, cv2.IMREAD_GRAYSCALE)


def degrade(img: np.ndarray, method: str) -> np.ndarray:
    if method == "black":
        return apply_black(img)
    if method == "white":
        return apply_white(img)
    if method.startswith("pix"):
        return apply_pixelate(img, int(method[3:]))
    if method.startswith("blur"):
        return apply_blur(img, float(method[4:]))
    raise ValueError(method)


def cer(guess: str, truth: str) -> float:
    guess_l, truth_l = guess.lower(), truth.lower()
    if not truth_l:
        return 1.0
    prev = list(range(len(truth_l) + 1))
    for i, gi in enumerate(guess_l, start=1):
        cur = [i]
        for j, tj in enumerate(truth_l, start=1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (gi != tj)))
        prev = cur
    return prev[-1] / len(truth_l)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    methods = ["black", "white", *[f"pix{b}" for b in BLOCK_SIZES], *[f"blur{r}" for r in BLUR_RADII]]
    results = []

    for text in SAMPLES:
        base = render(text)
        for method in methods:
            covered = degrade(base.copy(), method)
            attacked = attack_pipeline(covered)
            # A solid fill has no signal left; running deconvolution on it would
            # invent some, so the pipeline skips straight to reporting.
            has_signal = method not in ("black", "white")
            lucy = richardson_lucy(attacked, 3) if has_signal else attacked
            ocr_plain = ocr(attacked)
            ocr_deconv = ocr(lucy) if has_signal else ""
            template = template_attack(covered, text, method) if has_signal else ""
            # The same attack on the version a recipient would actually get.
            after = messenger_reencode(covered)
            attacked_after = attack_pipeline(after)
            lucy_after = richardson_lucy(attacked_after, 3) if has_signal else attacked_after
            best_after = max(
                (ocr(attacked_after), ocr(lucy_after)),
                key=lambda g: -cer(g, text),
            )
            exact_after = has_signal and best_after.replace(" ", "").lower() == text.replace(" ", "").lower()
            best_ocr = max((ocr_plain, ocr_deconv), key=lambda g: -cer(g, text))
            results.append(
                {
                    "text": text,
                    "method": method,
                    "exactAfterMessenger": exact_after,
                    "ocrAfterMessenger": best_after,
                    "ocrPlain": ocr_plain,
                    "ocrDeconvolved": ocr_deconv,
                    "template": template,
                    "cerBestOcr": round(cer(best_ocr, text), 3),
                    "cerTemplate": round(cer(template, text), 3),
                    "exactOcr": best_ocr.replace(" ", "").lower() == text.replace(" ", "").lower(),
                    "exactTemplate": template.replace(" ", "").lower() == text.replace(" ", "").lower(),
                }
            )
        # Evidence crops for the first sample only, so the report can link them.
        if text == SAMPLES[0]:
            for method in methods:
                cv2.imwrite(str(OUT_DIR / f"evidence-{method}.png"), degrade(base.copy(), method))

    (OUT_DIR / "results.json").write_text(json.dumps(results, indent=2))

    # The size sweep, because "can it be recovered" is mostly a question about
    # how tall the glyphs were before anything happened to them.
    sweep = {}
    heights = (14, 18, 26, 36, 48)
    sweep_methods = ("blur1", "blur2", "blur3", "blur4", "pix4", "pix8")
    for height in heights:
        globals()["TEXT_HEIGHT_PX"] = height
        row = {}
        for method in sweep_methods:
            exact = 0
            for text in SAMPLES[:5]:
                base = render(text)
                att = attack_pipeline(degrade(base.copy(), method))
                guess = max(
                    (ocr(att), ocr(richardson_lucy(att, 2))),
                    key=lambda g: -cer(g, text),
                )
                if guess.replace(" ", "").lower() == text.replace(" ", "").lower():
                    exact += 1
            row[method] = f"{exact}/5"
        sweep[str(height)] = row
    globals()["TEXT_HEIGHT_PX"] = TEXT_HEIGHT
    (OUT_DIR / "size-sweep.json").write_text(json.dumps(sweep, indent=2))

    print("\nexact recoveries by glyph height (5 strings per cell):")
    print(f"{'height':>7} | " + " | ".join(f"{m:>6}" for m in sweep_methods))
    for height in heights:
        print(f"{height:>6}px | " + " | ".join(f"{sweep[str(height)][m]:>6}" for m in sweep_methods))

    print(
        f"{'method':8} {'n':>3} {'OCR exact':>10} {'OCR meanCER':>12} "
        f"{'Template exact':>15} {'Template CER':>13} {'after messenger':>16}"
    )
    for method in methods:
        rows = [r for r in results if r["method"] == method]
        n = len(rows)
        ocr_exact = sum(1 for r in rows if r["exactOcr"])
        tpl_exact = sum(1 for r in rows if r["exactTemplate"])
        ocr_cer = sum(r["cerBestOcr"] for r in rows) / n
        tpl_cer = sum(r["cerTemplate"] for r in rows) / n
        after_exact = sum(1 for r in rows if r["exactAfterMessenger"])
        print(
            f"{method:8} {n:>3} {ocr_exact:>5}/{n:<4} {ocr_cer:>12.3f} {tpl_exact:>10}/{n:<4}"
            f" {tpl_cer:>13.3f} {after_exact:>6}/{n}"
        )

    print(f"\nresults: {OUT_DIR / 'results.json'} and size-sweep.json")
    print(f"evidence crops: {sorted(p.name for p in OUT_DIR.glob('evidence-*.png'))}")
    print(f"tesseract: {shutil.which('tesseract')}")


if __name__ == "__main__":
    main()
