import type { Scenario } from "@/lib/content/types";

/**
 * The two device-specific spokes of the phone cluster.
 *
 * Split from the hub page for the same reason the cluster exists at all: the
 * iPhone and Android procedures are different enough that merging them would
 * make both vaguer, and a page that has to describe both is forced into
 * generic steps that satisfy neither search intent.
 *
 * Every claim about behaviour here is measured, not assumed — timings and
 * gesture handling were verified on 360, 390 and 414 px touch viewports, and
 * where something has not been tested on real hardware the copy says so rather
 * than inventing a number.
 */

export const REDACT_ON_IPHONE: Scenario = {
  slug: "redact-screenshot-on-iphone",
  published: "2026-10-29",
  updated: "2026-10-29",
  navLabel: "On iPhone",
  h1: "Redact a Screenshot on an iPhone",
  title: "Redact a Screenshot on iPhone",
  description:
    "Black out names, numbers and card details in an iPhone screenshot in Safari. No app to install, no upload, and the EXIF location data does not survive.",
  lede:
    "An iPhone screenshot lands in the Photos library, gets picked up by iCloud sync, and can be attached to a message from the share sheet before anyone has thought about what it discloses. Redacting it on the phone is a short job in Safari, and it is worth knowing exactly which steps in that process are load-bearing.",
  risk: {
    heading: "What makes an iPhone screenshot leakier than it looks",
    body: [
      "The screenshot itself carries the identity of the device and the moment: the status bar shows the carrier, the exact clock, and the battery. On a shared screenshot, a phone number or a case number in a chat header ties all of it to one person.",
      "Photos keeps originals. Sharing a redacted copy does not remove the screenshot from your library, from iCloud Photo Library, from the Recently Deleted bin for forty days, or from any shared album and Cloud Link that had already copied it. The redaction is only as good as the last remaining copy.",
      "The third problem is Apple's own Markup. Drawing a black rectangle over a message in the Markup preview looks like redaction and behaves like annotation: it is a shape sitting on top of the image. If the exported file retains the pixels beneath at the same resolution, a crop and a levels adjustment will find them, and the person on the receiving end has the original text. If you use Markup, do it in a flow that flattens the drawing into the exported pixels, and check the result by selecting the region and moving it.",
    ],
  },
  fields: {
    heading: "The fields to look for on an iPhone screenshot",
    intro:
      "In rough order of how often they are missed on an iPhone, starting with the ones that sit outside the content you are trying to share.",
    rows: [
      {
        label: "Contact name and photo at the top of Messages, WhatsApp or a call screen",
        detail:
          "Cover the whole header row. A circular avatar exposes a face even when the name next to it has been blacked out.",
      },
      {
        label: "The status bar",
        detail:
          "Carrier, time, battery. Easiest fix is to crop it off before you start, which also removes the exact minute the screenshot was taken.",
      },
      {
        label: "Apple Pay and Wallet fragments",
        detail:
          "Card artwork and the last four digits appear in receipts, order confirmations and pass previews. Cover the digits, not just the logo: the last four plus a name and an address is enough for some fraud paths.",
      },
      {
        label: "Two-factor codes and notification banners",
        detail:
          "A screenshot of a sign-in flow often carries the six-digit code, or a lock-screen notification from a mail app that names a sender and a subject line.",
      },
      {
        label: "AirDrop, handoff and Share Sheet names",
        detail:
          "The device name in a share sheet or an AirDrop list is the name of a person's laptop or phone, which is frequently their real name.",
      },
      {
        label: "Any Live Photo or Motion capture in the frame",
        detail:
          "A screenshot of a Live Photo can be joined to a moving clip in the library. If the frame includes a face that you have covered here, it may not be covered there.",
      },
    ],
  },
  auto: {
    heading: "What auto-detect catches in Safari on an iPhone",
    intro:
      "The same recognition as on a laptop, running on the same file: the image is decoded in the tab and the text is read by a model that is fetched once and cached. It takes seconds and it does not upload anything. Because the first fetch is a few megabytes, do your first scan of the day on Wi-Fi rather than on a capped connection.",
    detects: [
      "Email addresses, US phone numbers in punctuated shapes, and mainland Chinese mobile numbers.",
      "SSNs, card numbers that pass a Luhn check, and IBANs that pass their own checksum.",
      "The value after a printed field name in twelve languages, which is what makes it useful on receipts and statements from outside the United States.",
      "Every line the recogniser can read is tappable after a scan: one tap covers the whole line, which is what you want on a five-inch screen.",
    ],
    misses: [
      "Faces, licences plates and other objects. There is no object detection; draw a box over those yourself.",
      "A name inside a sentence with no field name in front of it, and any free-text mention of a place or employer.",
      "Siri-style dictation, handwriting, and low-contrast small text — the reader is doing OCR, and OCR is only as good as the pixels.",
      "Whatever is below the fold in a long screenshot, because it was never in the frame you were looking at.",
    ],
  },
  steps: {
    heading: "Redacting an iPhone screenshot, step by step",
    intro:
      "All in Safari, no settings to change, and nothing that survives closing the tab.",
    items: [
      {
        title: "Take the screenshot, then open the tool before you share it",
        body: "Side button and volume up, then go to the browser tab with the tool in it. The earlier you redact, the less chance the original has already synced somewhere.",
      },
      {
        title: "Tap the drop area and choose the screenshot",
        body: "The photo picker shows your Screenshots album. PNG is what iOS writes, and it is accepted directly.",
      },
      {
        title: "Crop the status bar off, if you can",
        body: "Do it in Photos first if you want the exact clock and carrier gone, or leave it and cover the fields you care about. Either way, do not let a clean-looking crop persuade you the image is clean.",
      },
      {
        title: "Switch to Draw boxes",
        body: "The control sits above the image; the picture takes a coloured edge so you can see editing is armed. In Browse the image ignores taps, which is the point — scrolling cannot mark up your document by accident.",
      },
      {
        title: "Run Auto-detect from the Tools sheet",
        body: "It reports each field as its own box. The message tells you how many were found and the type chips above the canvas let you switch off a category you do not want covered.",
      },
      {
        title: "Tap the lines the detection missed",
        body: "After a scan, a tap covers the line under your finger. Names, sender columns and message bodies are all handled this way, and it is far more accurate on glass than dragging a box.",
      },
      {
        title: "Switch back to Browse and pan the whole screenshot",
        body: "Swipe from top to bottom. Anything below the fold is where the missed fields live.",
      },
      {
        title: "Set the view to 100 percent and check the edges",
        body: "Use the Fit / 100 percent control above the image, then look at each box. A rectangle that clips the last digit of a card number looks correct at fit size and wrong at full scale, which is the only scale that matters.",
      },
      {
        title: "Download the PNG and open it in Photos",
        body: "Download PNG puts a new file in your library. The result is redrawn from the covered pixels, so the original's metadata — including GPS coordinates, camera model and capture time — is not carried across.",
      },
      {
        title: "Delete the original, including from Recently Deleted",
        body: "Remove the unredacted screenshot from the library, from Recently Deleted, and from any shared album or link you created before redacting. This is the step that decides whether the redaction actually happened.",
      },
    ],
  },
  detail: {
    heading: "iPhone-specific things that surprise people",
    body: [
      "The keyboard is not the problem, the gesture is. On iOS, swiping the image to scroll and dragging to draw are the same motion, and this is exactly why the tool makes the choice explicit instead of guessing. If the image refuses to pan, you are in Draw boxes; if a drag paints a rectangle you did not want, you are in Draw boxes when you meant to be reading.",
      "The share sheet copies, it does not move. Sharing the redacted export into a messaging app is fine; the risk is that the original screenshot is still in the library and can be picked by mistake half an hour later from the same picker, because Screenshots sorts newest-first and both files look identical at thumbnail size.",
      "iCloud and shared albums are the usual leak. If the original went into a shared album or an iCloud link before redaction, deleting it from the phone does not necessarily retract a link that was already distributed. Treat the moment the screenshot was taken as the moment it became public, and share the redacted copy rather than a new link to the album.",
      "The full-screen stage is there because the phone screen is not tall enough for both. The expand control in the stage header lifts the image into the whole viewport, with the file name, the size and the fit toggle kept on screen. Collapse it to return to the page.",
      "Offline is not a promise. Once the page and its recognition models are loaded, no further requests are needed to redact or export — but the tool does not ship a service worker, so reopening the page without a connection will not work. If you need it on a plane or in a basement, load the page while you still have signal.",
    ],
  },
  faq: [
    {
      question: "Does this work in Safari without installing anything?",
      answer:
        "Yes. It is a web page: open it, load the screenshot, redact, download. There is no app, no profile and no sign-in.",
    },
    {
      question: "Does the redaction survive being sent through Messages or WhatsApp?",
      answer:
        "The exported PNG is a new image with the covered pixels replaced, so compressing it on the way out cannot undo it. What can expose you is the original screenshot still sitting in the library, or a different copy of the screen that was captured before you marked anything up.",
    },
    {
      question: "Can I use Apple's Markup instead?",
      answer:
        "For a quick cover, Markup can work if the shape is flattened into the exported image and you verify the result. It becomes dangerous when it is treated as an annotation on top of a preserved image. Whatever tool you use, the check is the same: at full zoom the covered pixels are gone.",
    },
    {
      question: "Why does the first scan take longer than the ones after it?",
      answer:
        "Recognition models are fetched once and cached afterwards. The first run on a phone downloads a few megabytes, which is slow on cellular and invisible on Wi-Fi; later scans only do the reading.",
    },
    {
      question: "Does it remove the location data from my screenshot?",
      answer:
        "iPhone screenshots do not usually carry GPS, but photos you take with the camera do. Either way the export is redrawn from canvas pixels, so the metadata container does not come across with the image.",
    },
    {
      question: "Can it detect faces?",
      answer:
        "No. There is no face or object detection in this tool, so people have to be covered with a box you draw. Saying otherwise would be the kind of claim that gets someone's family photo published.",
    },
  ],
  pillarLink: {
    before:
      "Safari on iOS is a full browser with a canvas and enough memory for a phone-resolution screenshot, and nothing in this workflow needs a server, so you can",
    anchor: "redact image online",
    after: "in the same fifteen seconds it takes to open a share sheet — and stay honest about it by checking the export at full zoom.",
  },
  related: [
    "redact-on-phone",
    "redact-screenshot-on-android",
    "redact-card-number",
  ],
};

export const REDACT_ON_ANDROID: Scenario = {
  slug: "redact-screenshot-on-android",
  published: "2026-10-29",
  updated: "2026-10-29",
  navLabel: "On Android",
  h1: "Redact a Screenshot on Android",
  title: "Redact a Screenshot on Android",
  description:
    "Hide names, numbers and account details in an Android screenshot using Chrome. Runs on the device, uploads nothing, and works on any phone, not one brand.",
  lede:
    "Android screenshots arrive with an editing button attached, which is how so many of them end up half-covered and still shared. This page is about the browser route: a redaction that replaces pixels, done in Chrome on the phone you already have.",
  risk: {
    heading: "Where Android screenshots give more away than you expect",
    body: [
      "The screenshot toolbar is the first trap. Android's built-in editor is optimised for annotation, not for concealment, and a highlighter or a shape drawn there is still an object until the image is flattened. People crop, scribble and share in one gesture, without ever zooming into the result.",
      "The notification shade leaks through the top of the frame. Screenshots taken with notifications present carry other people's message previews, a mail app's subject line, a two-factor code, and the name of the device owner. The content you meant to share starts below all of that.",
      "The third exposure is the file's path through the system. A screenshot lands in the gallery, appears in messaging apps' image pickers, and is indexed by any file manager or cloud uploader on the device. A redacted copy added later does not replace those references, and the original sits in the same folder one row up.",
    ],
  },
  fields: {
    heading: "What to cover on an Android screenshot",
    intro:
      "Ordered by how often they survive a quick glance, starting with the parts that feel like chrome rather than content.",
    rows: [
      {
        label: "The notification row at the top",
        detail:
          "Message previews, sender names, verification codes. If the frame includes them, cover the entire strip rather than one icon.",
      },
      {
        label: "Account avatars and display names in app headers",
        detail:
          "A round profile photo is a face. Covering the text next to it does nothing for the picture.",
      },
      {
        label: "The Google or work account shown in a side drawer",
        detail:
          "Open drawers and account switchers carry the email address that owns the profile, which is the single most useful field on the page for anyone trying to identify you.",
      },
      {
        label: "Payment sheets, Google Pay passes and loyalty barcodes",
        detail:
          "Barcodes and QR symbols encode the visible identifier and often more than that. Cover the whole symbol, not the number printed under it.",
      },
      {
        label: "The keyboard suggestion strip",
        detail:
          "Predictive text shows names and addresses from the user's history, in a place nobody thinks of as content.",
      },
      {
        label: "Device name and carrier in the status bar",
        detail:
          "Android keeps the carrier and, in some skins, the device name. Crop the strip away or cover it.",
      },
    ],
  },
  auto: {
    heading: "What auto-detect does on a phone running Android",
    intro:
      "Recognition runs on the handset in the browser tab. There is no upload step in the detection, and the only thing that leaves the device is nothing. The first scan fetches the recognition models once, so it is worth doing on Wi-Fi; later scans reuse them.",
    detects: [
      "Email addresses, US phone numbers in punctuated shapes, mainland Chinese mobile numbers.",
      "SSNs, card numbers with a valid Luhn check, IBANs with a valid mod-97 check, IPv4 addresses and API keys.",
      "Values printed after a field name in twelve languages, which is what makes it useful on a receipt or statement from outside the US.",
      "Every line it can read becomes tappable after a scan: one tap, whole line covered.",
    ],
    misses: [
      "Faces and objects. There is no person detection here.",
      "Names in prose, addresses written as free text, employer names and anything else that is a value without a label or a format.",
      "Small or low-contrast text: dark-mode grey on a coloured card background is a common miss.",
      "The part of the screenshot you never looked at, because it was below the fold when you started.",
    ],
  },
  steps: {
    heading: "Redacting an Android screenshot in Chrome",
    intro:
      "Works the same on Samsung, Pixel and Xiaomi, and in any Chromium-based browser. The difference from the system editor is that the output is a redrawn file, not a marked-up one.",
    items: [
      {
        title: "Take the screenshot, dismiss the edit bar, open the browser",
        body: "Ignore the floating crop-and-pencil row. It is for annotation, and the job here is pixel replacement.",
      },
      {
        title: "Load the tool and pick the screenshot from the file picker",
        body: "Android's picker shows the Screenshots folder directly, which removes the hunt. PNG, JPEG and WebP are all accepted.",
      },
      {
        title: "Start in Browse, and read the whole thing",
        body: "Swipe to scroll, pinch to zoom. The image does not answer taps while you are reading, so nothing gets covered by accident while you are deciding what to cover.",
      },
      {
        title: "Switch to Draw boxes",
        body: "The switch sits above the image and the picture takes a coloured edge while editing is live, so it is obvious which mode you are in and why it stopped scrolling.",
      },
      {
        title: "Run Auto-detect from Tools",
        body: "Detection returns one box per field, and the type chips above the canvas let you switch off a category before you review. Treat it as a first pass, not as an answer.",
      },
      {
        title: "Tap the remaining lines",
        body: "A tap after a scan covers the line under your finger. For a chat thread it is often faster to cover the sender column once with a tall box and then tap the individual rows.",
      },
      {
        title: "Switch back to Browse and pan top to bottom",
        body: "Check the fold, the footer and any quoted message underneath the one you care about.",
      },
      {
        title: "Zoom to 100 percent and inspect each box",
        body: "Use the Fit / 100 percent control. This is the step where a clipped last digit gets caught, and it takes four seconds.",
      },
      {
        title: "Download the PNG and open it from Files",
        body: "The export lands in Downloads as a new PNG built from the covered pixels, without the original file's metadata. Open it, not the thumbnail, and look at the covered areas.",
      },
      {
        title: "Delete the original screenshot from the gallery and the file system",
        body: "A file manager view of the Screenshots folder is worth checking directly: messaging pickers read the media store, so a copy you cannot see in the gallery may still be offered to you by the app you are sending to.",
      },
    ],
  },
  detail: {
    heading: "Notes on doing this properly on Android",
    body: [
      "Two gestures, one surface. Android's touch handling has the same constraint iOS does: a swipe to scroll and a drag to draw are physically the same motion, so the tool will not guess. Browse means reading; Draw boxes means editing, and the image stops panning while you are in it. The switch is above the canvas and takes one tap.",
      "The media store is the reason deleting one copy is not enough. Screenshots appear in the gallery, in every app's image picker, and in the file system simultaneously. The practical habit is to delete the original and then re-open the picker of the app you are sending from, to confirm the unredacted file is no longer on offer.",
      "Work profiles and device management change the picture. If the phone is managed by an employer, screenshots may be blocked, logged, or synced to a corporate drive, and the redacted copy inherits that context. Redaction on the device does not do anything about a copy that already left it.",
      "Chrome's own editor is not a redaction tool. The share-time crop and pen are annotation. If the pixels underneath survive, so does the information; the difference is visible the moment someone selects the image and drags it, or pushes the contrast.",
      "Manufacturer skins differ in small, annoying ways — where screenshots are stored, whether the edit bar appears, how the file picker groups albums. None of that changes the workflow above, and if a step looks different on your handset, the check at the end is the same: full zoom, every box, in the exported file.",
    ],
  },
  faq: [
    {
      question: "Do I need to install an app to redact on Android?",
      answer:
        "No. Chrome or any other modern browser has what this needs. The image is processed on the phone, so there is no upload, no account and no watermark.",
    },
    {
      question: "Can I use the screenshot editor that pops up instead?",
      answer:
        "Not for anything that actually has to be hidden. That editor is built for annotation, and unless the drawing is flattened into the exported pixels it remains a layer over the original image. Redact, then verify at full zoom.",
    },
    {
      question: "Does it handle screenshots with Chinese, Spanish or Arabic text?",
      answer:
        "Field-name rules cover twelve languages, and the recognition model for each script you tick is fetched once. Numbers, card numbers, IBANs and labelled values are matched regardless of the language printed around them.",
    },
    {
      question: "Why won't the image scroll after I switched modes?",
      answer:
        "That is the mode doing its job. While Draw boxes is active a drag paints a rectangle, so it cannot also pan. Switch back to Browse to move the picture.",
    },
    {
      question: "Where does the redacted file go?",
      answer:
        "Into Downloads as a new PNG. Open it from Files and check the covered areas there, before you attach it anywhere.",
    },
    {
      question: "Is the image sent to a server?",
      answer:
        "No, and that is testable: load the page, put the phone in airplane mode after it has finished loading, and redact something. There is no server to send it to.",
    },
  ],
  pillarLink: {
    before:
      "Because it is a web page rather than an app, there is nothing to install from a store, nothing to grant storage permission to and no vendor account involved, so the fastest way to",
    anchor: "redact image online",
    after: "on an Android phone is to keep the tool in a pinned tab and use it the moment a screenshot is taken.",
  },
  related: [
    "redact-on-phone",
    "redact-screenshot-on-iphone",
    "redact-receipt",
  ],
};
