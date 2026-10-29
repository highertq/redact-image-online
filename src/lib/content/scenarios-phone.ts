import type { Scenario } from "@/lib/content/types";

/**
 * The hub of the phone cluster. Its two spokes live in `scenarios-phone-devices.ts`:
 * the device pages answer "how do I do this on *my* phone" and carry the
 * platform-specific traps; this page answers the generic query and links to both,
 * which is what keeps the cluster reinforcing itself instead of three pages
 * competing for the same phrase.
 *
 * These pages exist because the product has a real, specific mobile behaviour
 * that no competitor describes accurately — an explicit edit permission, a
 * gesture that pans instead of painting, and a tap that covers a whole line of
 * recognised text. Writing that truthfully requires the behaviour to have been
 * measured, which it was: 360, 390 and 414 pixel viewports with touch events
 * dispatched at browser level, checking what scrolls and what paints a box.
 *
 * Where a number has not been measured on a handset, the copy says "on a phone"
 * rather than quoting a millisecond figure. Claiming performance we have not
 * observed on real hardware is the one thing this site's whole argument rests on
 * not doing.
 */

export const REDACT_ON_PHONE: Scenario = {
  slug: "redact-on-phone",
  published: "2026-10-29",
  updated: "2026-10-29",
  navLabel: "On a phone",
  h1: "Redact a Screenshot on a Phone",
  title: "Redact a Screenshot on a Phone",
  description:
    "Black out a phone number, address or card number in a screenshot using only your phone. No app, no upload, and the image stays on the device.",
  lede:
    "Most screenshots that need redacting are made on a phone and shared from the same phone, so the editing has to happen there too. This page is about doing it in a browser tab on a small touchscreen, where the two hard parts are hitting the right line of text with a fingertip and not losing the rest of a tall screenshot off the bottom of the screen.",
  risk: {
    heading: "Why phone redaction goes wrong more often than desktop redaction",
    body: [
      "The failure is geometric. A screenshot that is 1,170 pixels wide has to be shown across roughly 390 pixels of screen, so the picture is scaled to about a third of its own size. A line of text that took a comfortable swipe to click on a monitor is now somewhere under twenty pixels tall on the glass, and the fingertip covering it is wider than the line. The box gets drawn over the row above, or clips the bottom of the digits it was meant to hide.",
      "The second failure is the one people notice least: the thing you were trying to hide is usually not in the part of the screenshot you are looking at. A chat thread, an order confirmation, a bank app statement — the identifying detail is often at the top (a name, an avatar) while the reason for sharing is at the bottom. Anything below the fold on a phone screen gets missed.",
      "The third is that a phone has no reliable equivalent of hovering with a magnifier over the export. It is possible to check your work on a phone, but nobody does it under time pressure, and the tool that made the mistake looks identical to the tool that caught it.",
    ],
  },
  fields: {
    heading: "What actually needs covering on a phone screenshot",
    intro:
      "Phone screenshots leak through the parts that feel like interface furniture rather than content. These are the ones to check first.",
    rows: [
      {
        label: "The header row: contact name, avatar, group name",
        detail:
          "The single most-missed region in a chat screenshot. A name in the header identifies everyone in the thread below it, including the ones you carefully covered.",
      },
      {
        label: "Timestamps and status-bar clutter",
        detail:
          "A time narrows an alibi or a schedule, and the carrier name, battery percentage and clock in the status bar identify the device and the moment. Crop the status bar away if it is in frame.",
      },
      {
        label: "Delivery receipts and read ticks",
        detail:
          "Those marks prove a specific person saw a specific message. In a dispute screenshot they matter more than the text.",
      },
      {
        label: "Anything reflecting or displayed behind the subject",
        detail:
          "A photo of a screen, or a screenshot taken with a second device in shot, carries other windows. Zoom to 100 percent before you decide the frame is clean.",
      },
      {
        label: "The payment or account fragment below the fold",
        detail:
          "Card art, last four digits, an IBAN, a balance. On a phone this is usually off-screen when you start editing, which is why scanning the whole image matters more than the first pass.",
      },
      {
        label: "The file name the phone gives the export",
        detail:
          "Not part of the pixels, but screenshots keep place and time in their names in some galleries, and the original file stays in your camera roll after you share the redacted one.",
      },
    ],
  },
  auto: {
    heading: "What auto-detect finds on a phone, and what it will miss",
    intro:
      "Recognition runs on the phone itself: the image is decoded in the tab, the text is read, and each detected field is drawn as a reviewable box. Nothing is uploaded to make this work, which is also why the first scan on a phone downloads the recognition models and is best done on Wi-Fi.",
    detects: [
      "Email addresses wherever they appear in the frame, including inside quoted messages.",
      "US phone numbers in the usual punctuated shapes, and mainland Chinese mobile numbers.",
      "Card numbers that pass a Luhn check, so a random twelve-digit run is not reported as a card.",
      "IBAN bank account numbers in any of the countries that use them, checked against their own checksum.",
      "Any value printed after a field name in twelve languages — the word for Phone, Email, Card, Account, Total or Name in English, Spanish, French, German, Portuguese, Italian, Russian, Turkish, Arabic, Chinese, Japanese or Korean. This is the rule that works on documents the number formats were never written for.",
      "Whole recognised lines: after a scan, a tap anywhere on a line of text covers that line.",
    ],
    misses: [
      "Faces and licence plates. There is no object detection here, so a photo of a person still has to be handled by drawing a box over the face yourself.",
      "Names and addresses in running prose. A name with no label in front of it is not a pattern, and matching on anything that looks like a name would cover half the document.",
      "Text too small or too low-contrast to be read: fine print on a photo of paper, grey text on a coloured background, or an emoji-heavy row.",
      "Handwriting, and digits photographed at an angle, where the recogniser tends to return letters instead.",
      "Anything that never reached the pixels in the first place. Redaction can only hide what is in the image.",
    ],
  },
  steps: {
    heading: "The workflow, start to finish",
    intro:
      "Roughly half a minute once you have done it twice. Nothing is uploaded and nothing is kept after you close the tab.",
    items: [
      {
        title: "Open the tool and load the screenshot",
        body: "Tap the drop area and pick the image from your photo library or Files app. PNG, JPEG and WebP are accepted up to 25 MB and 40 million pixels.",
      },
      {
        title: "Read the picture first, in Browse mode",
        body: "The tool starts in Browse: swipe to scroll the whole screenshot, pinch to zoom. The image will not react to taps while you are reading it, so you cannot accidentally mark something up while looking for what needs marking.",
      },
      {
        title: "Switch to Draw boxes",
        body: "The control sits above the image, and the picture takes a coloured edge while editing is live so you can see which mode you are in. Only now does the image answer you.",
      },
      {
        title: "Run auto-detect and treat the result as a draft",
        body: "Recognition runs on the device and returns boxes you can move, edit or delete. The count and the type filter appear above the canvas; every box stays editable, which is the point of automatic detection rather than a reason to trust it.",
      },
      {
        title: "Tap each line of text you want gone",
        body: "After a scan, tapping a line covers the whole line, which is far more reliable on glass than trying to drag a rectangle exactly around it. Tap a covered box to open its editor, where you can change the fill or remove it.",
      },
      {
        title: "Switch back to Browse to check the rest of the image",
        body: "Pan from the top of the screenshot to the bottom before exporting. Missed fields are nearly always below the fold.",
      },
      {
        title: "Zoom to 100 percent and look at each edge",
        body: "Use the Fit / 100 percent control above the image. At fit size a box that clips the last digit of a card number looks perfectly adequate, and on a phone that is where the mistakes are.",
      },
      {
        title: "Download the PNG, then open it in your gallery",
        body: "The export is a new PNG redrawn from the covered pixels, so the metadata that came with the screenshot — including GPS coordinates and camera model — is not carried across. Open the result and check it again on the device you are about to send it from.",
      },
      {
        title: "Delete or hide the original screenshot",
        body: "The redacted copy is a separate file. The unredacted original stays in your photo library, in your trash, and in any sync folder or shared album that picked it up on the way. That is the last step, and the one most often skipped.",
      },
    ],
  },
  detail: {
    heading: "Why the edit permission is a switch and not a default",
    body: [
      "The obvious design for a redaction tool on a phone is to let you draw at any moment. This one deliberately does the opposite: the image ignores your fingers until you say it may respond, and while it is listening it can no longer be panned.",
      "Both halves of that are forced by the touchscreen. For a drag to draw a rectangle, the browser has to hand the gesture to the page instead of scrolling with it — and the moment it does, the swipe you meant as scrolling paints a box across your document. The two gestures are indistinguishable at the pixel level, so they cannot both live on the same surface.",
      "The reason to default to the reading half is what the other half costs. An accidental rectangle is recoverable in two taps; an accidental cover of the wrong row, noticed only after you have sent the file, is not recoverable at all. On a surface where a line of text is under twenty pixels tall, the mistake is not rare, so the tool makes you opt in to making it.",
      "The consequence is one extra tap per session and a coloured edge around the image whenever editing is armed. That edge is not decoration. Most confusion of this kind is a person believing the page is broken because it stopped scrolling; the edge says why.",
    ],
  },
  faq: [
    {
      question: "Do I need an app to redact a screenshot on my phone?",
      answer:
        "No. It runs in the browser you already have. The image never leaves the device, so there is nothing to sync, nothing to sign in to, and no upload to wait for.",
    },
    {
      question: "Is my screenshot uploaded anywhere?",
      answer:
        "No. Decoding, text recognition, redaction and re-encoding all happen in the tab. You can confirm it yourself: open the network inspector on a desktop browser and run a redaction — the only requests are the page's own files. On a phone, put it in airplane mode after the page has loaded and it still works.",
    },
    {
      question: "Why does the image stop scrolling when I switch to Draw boxes?",
      answer:
        "Because a swipe and a drag are the same finger movement. The tool has to be told which one you mean, which is what the switch is for. Switch back to Browse to pan and pinch again.",
    },
    {
      question: "Can I blur instead of blacking out, on a phone?",
      answer:
        "There is a pixelate option, but a light blur over readable text is the weakest thing you can do to a phone screenshot: the region is small, the strokes stay recoverable at full zoom, and the pixel count you are working with on a phone is exactly where that bites. A solid fill is the honest choice for text.",
    },
    {
      question: "Does it work on a tall screenshot?",
      answer:
        "Yes — the stage scrolls and zooms to 100 percent, and detection reads the whole image rather than only the visible part. The risk with a long screenshot is not that it fails but that you export before checking the bottom of it.",
    },
    {
      question: "Is there a limit on how large an image a phone can handle?",
      answer:
        "Files are capped at 25 MB and 40 million pixels. Very tall or very large images are also limited by what the browser on your handset can hold in memory, so if a huge panorama fails to open, crop it into two pieces and redact each one.",
    },
  ],
  pillarLink: {
    before:
      "The editor on a phone is the same editor as on a laptop, with the same three fills, the same reviewable boxes and the same re-encoded export, which is why it is reasonable to",
    anchor: "redact image online",
    after: "from the device the screenshot was taken on instead of waiting for a desk.",
  },
  related: [
    "redact-screenshot-on-iphone",
    "redact-screenshot-on-android",
    "redact-screenshot",
  ],
};

