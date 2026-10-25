"""Generates the static social share card and icon set for RedactMy.pics.

Run from the repo root:
  /Users/qing/.workbuddy/binaries/python/envs/default/bin/python scripts/make-assets.py

Outputs (all written into public/):
  og-image.png            1200x630  Open Graph / social card
  apple-touch-icon.png     180x180  iOS home screen
  icon-192.png             192x192  PWA manifest
  icon-512.png             512x512  PWA manifest
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

FONT_DIR = Path("/System/Library/Fonts/Supplemental")

# Palette mirrors the site: neutral-900 ink on white, amber accent for the
# redaction bar so the card reads as "something was removed here".
INK = (23, 23, 23)
MUTED = (115, 115, 115)
PAPER = (255, 255, 255)
RULE = (212, 212, 212)
BAR = (23, 23, 23)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size)


def draw_card() -> Image.Image:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(image)

    # Thin frame so the card keeps an edge on white chat backgrounds.
    draw.rectangle([(0, 0), (width - 1, height - 1)], outline=RULE, width=2)

    title_font = font("Arial Bold.ttf", 74)
    sub_font = font("Arial.ttf", 30)
    small_font = font("Arial.ttf", 24)
    pill_font = font("Arial Bold.ttf", 22)

    draw.text((80, 128), "Redact Image Online", font=title_font, fill=INK)
    draw.text((80, 218), "Free. No upload. Nothing leaves your browser.", font=sub_font, fill=MUTED)

    # Mock document with a few lines of "text" and solid black redaction bars.
    panel = [80, 300, 700, 552]
    draw.rectangle(panel, outline=RULE, width=2)

    line_heights = [340, 380, 420, 460, 500]
    redacted = {1, 3}
    for index, y in enumerate(line_heights):
        if index in redacted:
            draw.rectangle([(112, y - 6), (112 + 420, y + 16)], fill=BAR)
        else:
            # Grey blocks stand in for unredacted text lines at varying lengths.
            run = 300 + (index * 61) % 200
            draw.rectangle([(112, y - 4), (112 + run, y + 12)], fill=(232, 232, 232))

    # Callout on the right explaining the promise.
    callouts = [
        ("Solid fill, not blur", "Pixels are replaced."),
        ("Runs on your device", "No upload step exists."),
        ("EXIF stripped", "The PNG is re-encoded."),
    ]
    y = 300
    for heading, body in callouts:
        draw.ellipse([(760, y + 4), (776, y + 20)], fill=INK)
        draw.text((792, y), heading, font=pill_font, fill=INK)
        draw.text((792, y + 30), body, font=small_font, fill=MUTED)
        y += 82

    draw.text(
        (80, 566),
        "redactmy.pics",
        font=small_font,
        fill=INK,
    )

    return image


def draw_icon(size: int) -> Image.Image:
    image = Image.new("RGB", (size, size), PAPER)
    draw = ImageDraw.Draw(image)

    radius = int(size * 0.22)
    draw.rounded_rectangle(
        [(0, 0), (size - 1, size - 1)], radius=radius, outline=RULE, width=max(2, size // 90)
    )

    # A single thick redaction bar on a faint document, readable at 192px.
    pad = int(size * 0.20)
    draw.rectangle(
        [(pad, int(size * 0.24)), (size - pad, int(size * 0.36))],
        fill=(236, 236, 236),
    )
    draw.rectangle(
        [(pad, int(size * 0.44)), (size - int(pad * 0.4), int(size * 0.60))], fill=INK
    )
    draw.rectangle(
        [(pad, int(size * 0.68)), (size - pad, int(size * 0.80))],
        fill=(236, 236, 236),
    )

    return image


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)

    card = draw_card()
    card.save(PUBLIC / "og-image.png", "PNG", optimize=True)

    draw_icon(512).save(PUBLIC / "icon-512.png", "PNG", optimize=True)
    draw_icon(192).save(PUBLIC / "icon-192.png", "PNG", optimize=True)

    # Apple's touch icon has no transparency and no rounded corners of its own.
    draw_icon(180).resize((180, 180), Image.LANCZOS).save(
        PUBLIC / "apple-touch-icon.png", "PNG", optimize=True
    )

    for name in ("og-image.png", "icon-512.png", "icon-192.png", "apple-touch-icon.png"):
        path = PUBLIC / name
        print(f"{name:24} {path.stat().st_size:>7} bytes")


if __name__ == "__main__":
    main()
