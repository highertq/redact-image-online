import type { Scenario } from "@/lib/content/types";

export const SSN: Scenario = {
  slug: "redact-ssn",
  published: "2026-10-25",
  updated: "2026-10-28",
  navLabel: "Social Security numbers",
  h1: "Redact a Social Security Number From an Image",
  title: "Redact SSN in an Image",
  description:
    "Hide a Social Security number in a screenshot or scan. Solid fill paints the pixels out and the PNG is re-encoded without EXIF. Nothing is uploaded.",
  lede:
    "A nine-digit SSN is the one number that turns a screenshot into an identity theft problem. Covering it with a blur is not enough — the digits have to be painted out of the file itself. This page is about doing that in a browser, with no upload step.",
  risk: {
    heading: "Why an SSN in an image is different from other redactions",
    body: [
      "Most things people hide in a screenshot — a username, an order total, a chat message — are embarrassing or commercially sensitive. A Social Security number is different. It is a permanent identifier that cannot be changed, and it is one of the three pieces of data used to open credit in someone else's name. There is no rotation, no reset, no new password.",
      "The risk is compounded by where SSNs actually appear. They turn up on tax forms, payroll stubs, benefits letters, medical intake sheets, background check results, and — most often — in screenshots that someone took to ask a question. A person photographs a W-2 to ask an accountant about a line item, or screenshots a pay stub to prove income to a landlord. The number rides along in the corner of the frame.",
      "A second problem is that SSNs are short. Nine digits fit in a small area of a screenshot, and small areas are exactly where a low-strength blur fails. If the block size of a pixelation or the radius of a Gaussian blur is tuned for a face, the digits of a nine-digit number stay legible at the original resolution.",
    ],
  },
  fields: {
    heading: "What to cover on a page that shows an SSN",
    intro:
      "The number itself is the obvious target. The surrounding fields are what make it usable, and they are usually overlooked.",
    rows: [
      {
        label: "The nine digits in any format",
        detail:
          "123-45-6789, 123 45 6789, and a bare 123456789 all appear on real documents. Cover every instance, including ones in footers or page numbers that look like unrelated digits.",
      },
      {
        label: "Full legal name",
        detail:
          "An SSN on its own is hard to use. An SSN printed next to a name is a complete identity credential, so the name has to go too.",
      },
      {
        label: "Date of birth",
        detail:
          "Often printed directly above or below the SSN on tax and payroll documents. It is the third leg of the identity stool.",
      },
      {
        label: "Employer ID (EIN)",
        detail:
          "Appears on W-2 and 1099 forms. It is not your SSN, but it identifies your employer and is not something to publish.",
      },
      {
        label: "Account and routing numbers",
        detail:
          "On a direct deposit section, these are printed near the SSN. They let someone move money, not just borrow in your name.",
      },
      {
        label: "Barcodes and QR codes",
        detail:
          "Some payroll systems print a barcode that encodes the employee record. It survives a redaction of the text field and is easy to miss.",
      },
    ],
  },
  auto: {
    heading: "What the built-in detection will and will not find",
    intro:
      "Auto-detect runs a text recognition pass in your browser, then matches the recognized text against patterns. It is genuinely useful here because an SSN has a fixed shape, but it is a starting point, not a guarantee.",
    detects: [
      "The separated form 123-45-6789",
      "The space-separated form 123 45 6789",
      "Multiple SSNs on the same page",
    ],
    misses: [
      "A bare run of nine digits with no separators. The tool deliberately does not treat every nine-digit number as an SSN, because doing so would flag invoice numbers, phone extensions, and dates.",
      "Handwritten numbers, and digits in fonts that the recognition pass reads as letters.",
      "Numbers that are rotated, curved, or printed over a colored background.",
      "Digit groups split across two lines by a page break.",
      "Any SSN that is part of a longer string of digits, such as a reference number with the SSN embedded inside it.",
    ],
  },
  steps: {
    heading: "Removing the number, step by step",
    intro:
      "The whole flow takes under a minute for a single screenshot, and nothing is stored between visits.",
    items: [
      {
        title: "Open the image",
        body: "Drop a PNG, JPEG, or WebP onto the page, paste it with Ctrl/Cmd+V, or choose a file. The image is decoded in the tab; it is never sent anywhere. Files up to 25 MB and 40 million pixels are accepted.",
      },
      {
        title: "Run auto-detect, then read its output critically",
        body: "Auto-detect will usually find the separated SSN. Look at each box it draws before trusting it. If the number on your document is written without separators, expect it to be missed and plan to draw the box yourself.",
      },
      {
        title: "Draw a box with margin on every side",
        body: "Drag a box that extends past the digits on all four sides. Tight boxes are the most common cause of a leaked digit — the characters at the edge sit half outside the fill.",
      },
      {
        title: "Keep the fill on solid black",
        body: "Solid black is the default and the only style recommended for an SSN. Pixelate keeps the shape of the original characters, and the digits of a nine-digit number are short enough that a mosaic can leave them guessable.",
      },
      {
        title: "Cover the second copy",
        body: "If the same number appears twice on the page, cover it twice. Detection reports each occurrence separately, and it is easy to scroll past the second one.",
      },
      {
        title: "Download and re-open the PNG",
        body: "The export is a new PNG drawn on a fresh canvas at the original resolution. Open the downloaded file and zoom in on each covered region before you send it.",
      },
    ],
  },
  detail: {
    heading: "Why a solid fill and not a blur",
    body: [
      "A blur and a solid fill look similar in a thumbnail and behave completely differently in the file. A blur is a filter: it averages neighboring pixels and writes the averaged result. The information is degraded, not removed, and short strings of large characters are exactly the case where degraded information is often still readable — either directly at high zoom, or by someone who knows what the number is supposed to look like and can check candidates against the checksum.",
      "A solid fill replaces the pixel values inside the box with an opaque color. The original pixel data is not averaged, transformed, or pushed into another channel — it is overwritten in the destination canvas. The exported PNG contains the fill color and nothing underneath it.",
      "There is a related mistake worth naming, because it is common in presentation software and design tools: placing a black rectangle on top of an image without flattening. The rectangle is a separate object, and the text underneath is still in the file. Exporting from a flattened canvas avoids that class of error entirely, which is why this tool rebuilds the image from scratch instead of layering a shape over the original.",
      "The pixelate option exists for layouts where you want the document to remain recognizable — a form where the reader needs to see that a field existed. It paints an opaque black base first, then a downsampled mosaic on top, so nothing shows through. But the mosaic is built from the original pixels at reduced resolution, which means it is weaker than solid fill for short strings. For an SSN, use black.",
    ],
  },
  faq: [
    {
      question: "Is it enough to cover just the last four digits?",
      answer:
        "No. The last four digits are the ones routinely used for verification, and a partial SSN is still a partial credential. Cover the entire number.",
    },
    {
      question: "Does the exported file still contain the original EXIF data?",
      answer:
        "The export is a new PNG encoded from a canvas, and EXIF lives in the original file container rather than in pixel data, so camera and GPS fields from the source file are not carried over. Re-encoding also means the original file's metadata structure does not survive.",
    },
    {
      question: "Can I undo a box I drew in the wrong place?",
      answer:
        "Yes. Undo is available as a button and as Ctrl/Cmd+Z, with redo on Ctrl/Cmd+Shift+Z. Clear all removes every box at once, and Start over loads a different image. Because the edit is live in the page, nothing is written to disk until you download.",
    },
    {
      question: "Does it work on a phone?",
      answer:
        "Yes. You can open the page on a phone or tablet and draw boxes with a finger. On touch screens a Draw/Scroll switch is available, because a tall screenshot needs to be scrollable and a draw mode that swallows every drag makes that impossible.",
    },
    {
      question: "What if the number is on a photo of a paper form?",
      answer:
        "That works, but expect the recognition pass to be less reliable on a photograph than on a screenshot. Shadows, perspective, and print quality all reduce accuracy. Draw the boxes by hand and check the result at full zoom.",
    },
    {
      question: "Do you keep a copy of the image?",
      answer:
        "No. There is no upload step, no server-side processing, and no storage. The image is decoded in the tab, and if you reload the page it is gone.",
    },
  ],
  pillarLink: {
    before:
      "If the same screenshot also shows a card number or an address, you do not need to work through them one at a time. You can",
    anchor: "redact image online",
    after:
      "with every box on a single canvas, and each one stays editable until you download.",
  },
  related: ["redact-card-number", "redact-bank-statement", "redact-email-address"],
};

export const CARD_NUMBER: Scenario = {
  slug: "redact-card-number",
  published: "2026-10-25",
  updated: "2026-10-28",
  navLabel: "Card numbers",
  h1: "Redact a Credit Card Number From a Screenshot",
  title: "Redact a Card Number",
  description:
    "Cover a card number, expiry, CVV, and cardholder name with solid fill, then download a PNG re-encoded from a canvas. No upload, no account.",
  lede:
    "Card details are the most actively traded personal data there is, and a payment screenshot usually contains four pieces of them rather than one. Covering the sixteen digits and leaving the expiry visible is a common and expensive mistake.",
  risk: {
    heading: "A card number is only part of the credential",
    body: [
      "A sixteen-digit number by itself is close to useless for a fraud attempt. What makes a payment card usable is the combination: the number, the expiry date, and the security code. Add the cardholder name and billing address and you have everything a merchant needs to accept a card-not-present transaction.",
      "This matters because screenshots rarely show one field in isolation. A checkout confirmation shows the last four digits and the expiry. A receipt shows the last four plus the cardholder name. A photo of the physical card shows all of it. A support conversation about a declined payment often includes a screenshot of the payment form, which can contain the full number in an input field.",
      "There is also a timing problem. Card numbers are short-lived credentials — they expire, and a compromised card can be cancelled. That makes the damage bounded, which is why people treat them casually. But the window between exposure and cancellation is exactly when the fraud happens, and a number posted publicly is scraped within hours, not days.",
    ],
  },
  fields: {
    heading: "Every field that has to go",
    intro:
      "Cover all four of the first group, or the redaction does not accomplish anything. The second group is what usually gets missed.",
    rows: [
      {
        label: "The full card number",
        detail:
          "Thirteen to nineteen digits, often grouped in fours with spaces or dashes. Cover all of it, including the groups at the ends — a leaked first six digits reveals the issuer and card type.",
      },
      {
        label: "Expiry date",
        detail:
          "Usually written MM/YY near the number. It is one of the three fields required for a card-not-present charge, so it is not optional.",
      },
      {
        label: "Security code (CVV / CVC)",
        detail:
          "Three or four digits on the signature strip or the back of the card. If it appears in the screenshot, it has to be covered.",
      },
      {
        label: "Cardholder name",
        detail:
          "Printed on the card and usually repeated on the receipt. Combined with the number, it is what makes the transaction look legitimate.",
      },
      {
        label: "Billing address and postcode",
        detail:
          "Frequently used as an additional verification step. It shows up in confirmation emails and invoices more often than people expect.",
      },
      {
        label: "Last four digits in the confirmation line",
        detail:
          "Payment confirmations repeat the last four digits in a summary or header line, separate from the main detail block. Cover both copies.",
      },
      {
        label: "Transaction and authorization IDs",
        detail:
          "Not a card credential, but enough for a support agent impersonation attempt. Usually worth covering on a public post.",
      },
    ],
  },
  auto: {
    heading: "How the detection handles card numbers",
    intro:
      "Card numbers have a built-in check: the Luhn checksum. The tool uses it, which means it reports far fewer false positives than a plain digit-count rule — but also that a mistyped or partially obscured number will not be found.",
    detects: [
      "13 to 19 digit numbers that pass the Luhn checksum",
      "Numbers written with single spaces or dashes between groups",
      "Several card numbers on the same page",
    ],
    misses: [
      "Numbers that fail the Luhn check because a digit is obscured, mistyped, or cut off by the edge of the screenshot.",
      "Numbers where the grouping is broken by other characters, such as a slash or a label inserted mid-string.",
      "Expiry dates, which are not a matched pattern at all. A CVV or PIN is covered only on a line that names it; an expiry date always needs a box drawn by hand.",
      "Cardholder names and billing addresses, which are not detected in this version.",
      "A physical card photographed at an angle, where the embossed digits produce uneven contrast.",
    ],
  },
  steps: {
    heading: "The order that avoids a second pass",
    intro:
      "Cover the credentials first, then the context. Doing it the other way around makes it easy to lose track of which box covers what.",
    items: [
      {
        title: "Open the screenshot",
        body: "Drop it, paste it, or pick a file. PNG, JPEG, and WebP up to 25 MB and 40 million pixels.",
      },
      {
        title: "Box the number first",
        body: "Draw one box across the whole digit group rather than one box per group of four. A single wider box is harder to misalign and easier to verify at a glance.",
      },
      {
        title: "Then expiry, then security code",
        body: "These are two or four characters each, so the boxes will be small. Use solid black and give each box a few pixels of margin, because a single visible digit of a CVV narrows the search space enormously.",
      },
      {
        title: "Then the name and any repeated last-four",
        body: "Scan the header, the footer, and the summary line. Payment UIs like to restate the card in a compact form at the top of the page.",
      },
      {
        title: "Check for reflections and second screens",
        body: "On a photo of a physical card, look for the number reflected in a glossy surface or visible on a second screen in the background. This is a real cause of leaks and it is invisible unless you look for it.",
      },
      {
        title: "Download and inspect at 100%",
        body: "Open the exported PNG and zoom to actual size on each region. Thumbnails hide exactly the kind of one-pixel leak that matters here.",
      },
    ],
  },
  detail: {
    heading: "Why pixelation is the wrong default for digits",
    body: [
      "Pixelation works by averaging blocks of pixels into single color values. When the block size is large relative to the characters, the characters become unrecognizable. When the block size is small relative to the characters — which is what happens with small text in a screenshot — each digit may occupy its own block or two, and the block colors still encode the shape of the glyph.",
      "Digits are the worst case for this, because there are only ten of them and they differ by a small number of strokes. A human or a script that knows the field is a card number and knows the Luhn checksum can prune candidates aggressively. That is the difference between a blur that is merely weak and a redaction that is adequate.",
      "Solid fill does not have this failure mode. It does not degrade the glyph; it removes the pixels. There is no residual structure to reason about, because the region in the exported file contains one color.",
      "One more point that matters for cards specifically: the tool's auto-detect uses the Luhn checksum to decide whether a digit run is a card number. That is a good filter for false positives, but it has a subtle consequence worth knowing. A number that has been partially covered by the screenshot crop, or that contains an OCR error, will not pass the checksum and will not be reported. Detection agreeing with you is not evidence that the number is gone; it is only evidence that a well-formed number was found.",
    ],
  },
  faq: [
    {
      question: "Is covering the middle digits enough?",
      answer:
        "No. The first six digits identify the issuer and card product, and the last four are used for verification. If an attacker has both ends plus the expiry, the remaining search space is small enough to be a real problem.",
    },
    {
      question: "Why did auto-detect not find my card number?",
      answer:
        "Most likely the digits fail the Luhn checksum — because of an OCR misread, a partially obscured digit, or a number that is not a valid card number at all, such as an order reference. Draw the box by hand in that case.",
    },
    {
      question: "Does the tool store the card number anywhere?",
      answer:
        "No. There is no server component and no storage. The recognition runs in your browser, the boxes live in memory, and reloading the page discards everything.",
    },
    {
      question: "Can I redact several areas at once?",
      answer:
        "Yes, draw as many boxes as you need. Each box can be edited separately: you can toggle it off, change its fill style, or delete it from the panel that opens when you click it.",
    },
    {
      question: "What file format should I share afterwards?",
      answer:
        "The tool exports PNG. Re-encoding from a canvas means the file is rebuilt rather than edited in place, and metadata from the source file is not carried across.",
    },
  ],
  pillarLink: {
    before:
      "Card numbers rarely appear alone on a payment screenshot, so it is usually worth covering the expiry and the name in the same session. You can",
    anchor: "redact image online",
    after:
      "in one pass, and the export is drawn on a fresh canvas so nothing is layered on top of the original.",
  },
  related: ["redact-ssn", "redact-bank-statement", "redact-receipt"],
};

export const EMAIL: Scenario = {
  slug: "redact-email-address",
  published: "2026-10-25",
  updated: "2026-10-28",
  navLabel: "Email addresses",
  h1: "Hide an Email Address in a Screenshot",
  title: "Hide an Email in a Screenshot",
  description:
    "Cover email addresses in a screenshot before posting it. Auto-detect finds them, solid fill replaces the pixels, and the PNG is rebuilt. Nothing is uploaded.",
  lede:
    "Email addresses are the least dramatic thing on this list and the most frequently leaked. They appear in headers, sidebars, profile cards, and notification popups — and unlike a card number, there is no way to cancel one.",
  risk: {
    heading: "Why a visible address is a durable problem",
    body: [
      "A leaked card number can be cancelled in a phone call. An email address cannot. It is the account identifier for banking, work, social media, and password resets, and it is the delivery address for every phishing attempt that follows.",
      "The specific mechanism matters. Once an address is public, it enters lists that are sold and reused. Those lists drive targeted phishing — messages that reference a real project, a real colleague, or a real invoice number, because the sender now knows where the person works and who they correspond with. A screenshot that also reveals an internal system name or a ticket number makes that message far more convincing.",
      "There is a quieter problem too. Screenshots of a shared inbox, a support queue, or a CRM record contain dozens of addresses at once. Covering the one address you were asked about and leaving the rest of the list visible turns a single-person disclosure into a mailing list disclosure, and in some jurisdictions that is a notifiable data incident rather than an inconvenience.",
    ],
  },
  fields: {
    heading: "Where addresses hide in a screenshot",
    intro:
      "The visible body text is the obvious place. Most leaks come from the chrome around it.",
    rows: [
      {
        label: "The address in the message body",
        detail:
          "The one you noticed. Cover the whole address, not just the local part before the @.",
      },
      {
        label: "Account switchers and profile chips",
        detail:
          "The top-right corner of most web apps shows the signed-in address. It is small, grey, and easy to forget.",
      },
      {
        label: "Browser tab titles and the address bar",
        detail:
          "Some applications put the account address in the document title, which means it is visible in the tab and in any window list included in the screenshot.",
      },
      {
        label: "Notification popups and toasts",
        detail:
          "A toast that says a message was sent to an address will sit in the corner of the frame for a few seconds and is often captured.",
      },
      {
        label: "Reply-to and CC lines",
        detail:
          "In an email screenshot, the collapsed header hides a list of recipients. Expanding it before capture is a common way to leak a whole thread's participants.",
      },
      {
        label: "Signatures and footers",
        detail:
          "Contact blocks at the bottom of a message repeat the address, plus a phone number and a job title.",
      },
      {
        label: "Other addresses in the same list",
        detail:
          "If the screenshot shows a table of users, cover every row you are not authorized to disclose, not just the row you were asked about.",
      },
    ],
  },
  auto: {
    heading: "Email detection is the most reliable pattern here",
    intro:
      "An address has a rigid shape: something, an @, a domain, and a dot-separated suffix. That makes it the pattern the recognition pass handles best — but reliability is not certainty.",
    detects: [
      "Standard addresses such as name@example.com",
      "Addresses with dots, plus signs, underscores, and percent signs in the local part",
      "Multiple addresses in a list or table",
      "Addresses in a signature block",
    ],
    misses: [
      "Addresses that the recognition pass splits at a line break or a wide letter space. Recognition returns words separately, so an address broken across two visual runs may be rejoined with a space and fail to match.",
      "Addresses inside an image, such as a logo lockup or a screenshot of a screenshot.",
      "Obfuscated forms like name [at] example [dot] com, which are deliberately not matched.",
      "Addresses rendered in very low contrast grey, which is exactly how profile chips are usually styled.",
      "An address that is partially covered by another box you drew first.",
    ],
  },
  steps: {
    heading: "A two-minute pass over a shared screenshot",
    intro:
      "Work from the edges inward. The body text is what you are focused on, and focus is why the corners get missed.",
    items: [
      {
        title: "Open the screenshot",
        body: "Drop, paste, or choose a file. PNG, JPEG, and WebP up to 25 MB and 40 million pixels.",
      },
      {
        title: "Run auto-detect and check the count",
        body: "The tool reports how many items it found, grouped by type. If the number is lower than the number of addresses you can see with your own eyes, do not trust the result — find the missing ones manually.",
      },
      {
        title: "Use the type filter to isolate the email boxes",
        body: "Detected boxes are grouped by type. Toggling a type off hides those boxes without deleting them, which is useful for checking whether you have covered everything else.",
      },
      {
        title: "Sweep the four corners",
        body: "Top-right for the account chip, top-left for the tab, bottom-left for notifications, bottom-right for toasts. This is where the missed addresses live.",
      },
      {
        title: "Cover whole addresses",
        body: "A partially covered address still reveals the domain, which identifies the employer. If the point is to hide who the person is, cover the domain too.",
      },
      {
        title: "Export and read the result",
        body: "Open the PNG at full size and check that no address is partially visible at the edge of a box. Solid black gives a clean edge to check against.",
      },
    ],
  },
  detail: {
    heading: "The domain is the part people forget",
    body: [
      "Most redaction advice focuses on the local part — the name before the @. That is understandable, since the name is the personal identifier. But the domain is often more identifying in a professional context. First.Last@company.com identifies a person and their employer; the domain alone narrows a public post down to one organization, and combined with a job title in a signature it is usually enough to find the person on a company page.",
      "That is why covering half an address is a common and self-defeating move: the result looks private while still publishing the organization. Cover the whole string.",
      "There is a structural reason the tool is useful for this specific job. Addresses repeat. The same address appears in the header chip, the message body, the signature, and the reply-to line of a single screenshot. Doing this by hand across four locations invites a miss; detection reports each occurrence as its own box, so you can see the count and reason about whether it matches what is on screen.",
      "The honest limit is that detection reads text. It does not read the DOM, the image's alt text, or the underlying application. It sees what a person would see in the rendered picture — which is the right scope for a screenshot, and the wrong tool for an exported HTML file.",
    ],
  },
  faq: [
    {
      question: "Can I cover just the name and leave the domain?",
      answer:
        "You can, but be deliberate about it. The domain identifies the organization, and for a professional address that is often the part that reveals who the person is. If the goal is anonymity rather than simply hiding the inbox, cover the entire address.",
    },
    {
      question: "Does detection find addresses in a table?",
      answer:
        "Yes, each address is reported separately. Note that cover means covering every row you are not cleared to disclose — detection finding twelve addresses does not mean you should only cover the one you were asked about.",
    },
    {
      question: "Why was an address split across two lines missed?",
      answer:
        "The recognition step returns words individually and the tool rebuilds lines from them. An address broken by a line break or an unusually wide gap can end up joined with a space and fail the pattern match. Draw that box by hand.",
    },
    {
      question: "Does the tool send the text it recognizes anywhere?",
      answer:
        "No. Recognition runs locally in your browser and the results stay in the page. The only network requests are the static library and language files the recognition engine needs, and those do not include your image or anything derived from it.",
    },
    {
      question: "Is there a limit on how many boxes I can draw?",
      answer:
        "There is no limit in the interface. Very large images with a few hundred boxes will feel slower to redraw, since the canvas is repainted on each change.",
    },
  ],
  pillarLink: {
    before:
      "An address is almost never the only thing on the page, which makes doing the whole screenshot at once worthwhile. You can",
    anchor: "redact image online",
    after:
      "directly in the tab, with no list of addresses to paste into a form and no account to create.",
  },
  related: ["redact-screenshot", "redact-card-number", "redact-ssn"],
};
