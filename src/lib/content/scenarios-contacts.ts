import type { Scenario } from "@/lib/content/types";

export const PHONE_NUMBER: Scenario = {
  slug: "redact-phone-number",
  navLabel: "Phone numbers",
  h1: "Redact a Phone Number From a Screenshot",
  title: "Redact a Phone Number",
  description:
    "Cover a phone number in a screenshot before you post it. Solid fill replaces the digits, and detection finds the common separated formats.",
  lede:
    "A phone number looks like the least dangerous thing in a screenshot. It is the one field that connects a stranger to a SIM swap, a home address, and every account that uses the number as a recovery option. Covering it properly takes one box.",
  risk: {
    heading: "Why a phone number is not a minor detail",
    body: [
      "A number is not just a way to reach you. It is the identity anchor for carrier accounts, two-factor reset flows, and payment profiles. Account-takeover work that starts from a published number is routine, not theoretical: the SIM-swap path needs the number plus a little personal context, and a screenshot often supplies the context too.",
      "Numbers also index. A number published in a support thread ties together a Reddit account, a landlord listing, and an old marketplace post, because people paste the same contact block everywhere. Reverse lookup collapses that work into a few minutes.",
      "The third exposure is domestic. When a listing photo, ride receipt, or delivery screenshot carries a personal mobile number, it is frequently the same number printed on utility and shipping records. The step from 'number' to 'where a person lives' is smaller than the step from any other field in the image.",
    ],
  },
  fields: {
    heading: "What to cover on a page that shows a phone number",
    intro:
      "The number itself is the target, but the fields next to it are what turn it into a usable identity record.",
    rows: [
      {
        label: "Every copy of the number",
        detail:
          "Header, footer, contact block, and any quoted reply underneath. Screenshots of email threads repeat the same signature three or four times, and covering the top one is not covering the page.",
      },
      {
        label: "The person's name",
        detail:
          "Number plus name plus anything else on the card is a marketing dossier. Cover the name too, or the number does most of the work for a lookup.",
      },
      {
        label: "Extension and PIN codes",
        detail:
          "An 'x4417' next to a main line, or a delivery PIN printed under a barcode, both disclose how to reach or authenticate a specific person.",
      },
      {
        label: "International prefixes and secondary lines",
        detail:
          "+44 or +52 style numbers identify a country and often a mobile carrier. Work and personal lines on the same card are two separate risks.",
      },
      {
        label: "The QR or barcode that encodes it",
        detail:
          "Business-card layouts and event badges encode contact data in a code that survives a redaction of the text next to it. Cover the whole symbol.",
      },
      {
        label: "Screens behind the subject",
        detail:
          "A dialer, call log, or messaging header in the background of a photo carries numbers you may not have noticed at thumbnail size.",
      },
    ],
  },
  auto: {
    heading: "What the built-in detection will and will not find",
    intro:
      "Auto-detect reads the text in the image in your browser, then matches it against phone shapes. It handles the common United States formats well and it is deliberately conservative about everything else.",
    detects: [
      "The dotted and dashed forms: 415-555-0132 and 415.555.0132",
      "The parenthesized form: (415) 555-0132, with or without the space",
      "The country-code form: +1 415 555 0132",
      "Several numbers on one page, each reported as its own box",
    ],
    misses: [
      "A bare run of digits with no separator at all, such as 4155550132. The matcher requires punctuation, because flagging every ten-digit string would also flag order numbers, timestamps, and IDs.",
      "Numbers written without punctuation inside a longer digit run, such as a reference number that has the phone embedded in it.",
      "Non-US formats with different grouping, including most UK, German, and Asian conventions, and vanity numbers such as 555-CALL.",
      "Handwritten numbers, low-contrast print, and digits photographed at an angle, where the recognition pass may read them as letters.",
      "Numbers rotated 90 degrees in a two-column layout, or split across a line break.",
    ],
  },
  steps: {
    heading: "Removing the number, step by step",
    intro:
      "The whole flow takes under a minute for one screenshot, and nothing is kept between visits.",
    items: [
      {
        title: "Load the screenshot",
        body: "Drop a PNG, JPEG, or WebP onto the page, paste it with Ctrl/Cmd+V, or pick a file. The image is decoded in the tab and never sent anywhere.",
      },
      {
        title: "Run auto-detect, then treat it as a draft",
        body: "It will usually find the separated US formats. Check each box before trusting it, and expect a bare unformatted number to be missed entirely.",
      },
      {
        title: "Box the number with margin on all four sides",
        body: "Drag a box that extends past the digits on every edge. Tight boxes are the most common failure — the first or last digit sits half outside the fill.",
      },
      {
        title: "Leave the fill on solid black",
        body: "Solid black is the default and the recommended style for digits. A mosaic of a ten-character string keeps enough stroke information to be guessable at full zoom.",
      },
      {
        title: "Sweep the whole frame for repeats",
        body: "Scroll to the bottom of a tall screenshot before exporting. Signatures, quoted history, and footer contact blocks carry the same number again.",
      },
      {
        title: "Download and re-open the PNG",
        body: "The export is a new PNG drawn on a fresh canvas at the original resolution. Open the file and zoom to 100 percent on each covered region before you post it.",
      },
    ],
  },
  detail: {
    heading: "Why a fill and not a blur, for this field specifically",
    body: [
      "Phone numbers are the clearest illustration of the blur problem. A ten-digit value has a tiny candidate space once you know the area code, and a Gaussian blur preserves the light-dark boundary of each stroke. Zooming in on the exported file, or running the degraded shape against a known number, both remain practical attacks. The digit count leaks even when the digits themselves do not.",
      "A solid fill overwrites the values inside the box with a single color. Nothing is averaged and nothing is left in another channel, so there is no shape to inspect and no length to count. The exported PNG contains the fill color where the digits used to be.",
      "One more reason to prefer a fill on this field: phone numbers sit in small, dense text. The regions where a blur works acceptably — faces, foliage, backgrounds — are large and redundant. Ten digits in a 14-point font are neither, so the operation that removes is the only honest choice.",
      "If the number is a business line you are deliberately hiding from a specific audience, note that a cover still communicates that a number was there. A fill in the page's own background color reads as a design element and removes the same pixels.",
    ],
  },
  faq: [
    {
      question: "Is it enough to hide only the last four digits?",
      answer:
        "No. The last four digits are the ones carriers and banks use for verification, and a partial number plus an area code is most of the number. Cover the whole thing.",
    },
    {
      question: "Why does auto-detect miss 4155550132?",
      answer:
        "The matcher requires a separator or parentheses. Without that rule, every ten-digit run in an image — invoice numbers, product SKUs, timestamps — would be reported as a phone number, and the output would be unusable. Draw the box yourself for unpunctuated numbers.",
    },
    {
      question: "Does it handle numbers from other countries?",
      answer:
        "Chinese mobile numbers and resident ID numbers are matched, along with the US formats above. Most other conventions group digits differently and are not patterns the matcher knows, so expect to box those by hand and verify at full zoom.",
    },
    {
      question: "Will the exported PNG still carry metadata?",
      answer:
        "The export is encoded from a canvas, so the source file's metadata container does not come across. The result is a plain PNG containing the pixels you can see.",
    },
    {
      question: "Can I use this on a photo of a paper document?",
      answer:
        "Yes. Recognition is less reliable on a photograph than on a screenshot because of shadows and perspective, so treat detection as a starting point and finish the coverage by hand.",
    },
    {
      question: "Does the image get uploaded?",
      answer:
        "No. There is no upload step and no server-side processing. Reloading the page discards everything, and there is no account to attach it to.",
    },
  ],
  pillarLink: {
    before:
      "A contact card rarely leaks only one field, and the editor keeps every box editable on one canvas. That makes it practical to",
    anchor: "redact image online",
    after:
      "for the number, the name, and the email in a single pass, then export once.",
  },
  related: [
    "redact-email-address",
    "redact-screenshot",
    "redact-card-number",
  ],
};
