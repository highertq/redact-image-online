import type { Scenario } from "@/lib/content/types";

export const SCREENSHOT: Scenario = {
  slug: "redact-screenshot",
  navLabel: "Screenshots",
  h1: "Redact Text in a Screenshot Before You Share It",
  title: "Redact Text in a Screenshot",
  description:
    "Hide names, emails, and account numbers in a screenshot. Auto-detect finds common patterns, fill replaces pixels, and the PNG is re-encoded. No upload.",
  lede:
    "A screenshot is not a picture of a screen. It is a copy of everything that happened to be on it — the tab title, the account chip, the notification that arrived mid-capture, and the colleague's name in the sidebar. Most leaks are in the parts nobody was looking at.",
  risk: {
    heading: "The screenshot captures more than the thing you wanted to show",
    body: [
      "People take screenshots to show one thing: an error message, a design detail, a stuck payment. The frame around that thing is captured without being chosen. It includes whatever the application decided to display — the signed-in account in the corner, the shared workspace name in the header, the list of open documents, the timestamp with a timezone, and the notification that popped up while the shutter was effectively open.",
      "This is why screenshot leaks are so common and so hard to self-check. The person reviewing their own screenshot sees the error message, because that is what they were looking at when they took it. The account chip is invisible to them for the same reason it was never considered.",
      "There is a second layer that is specific to screenshots over photographs: text is crisp. The failure modes that make blur acceptable on a photograph — soft edges, motion, noise — do not apply. Crisp small text survives a surprising amount of blurring, and it is trivially readable at full zoom. A screenshot needs a harder redaction than a photo does, not a softer one.",
    ],
  },
  fields: {
    heading: "The checklist most people skip",
    intro:
      "Read this list against your screenshot before you draw anything. It is ordered by how often each item is missed, not by how sensitive it is.",
    rows: [
      {
        label: "Account chip or avatar menu",
        detail:
          "Top-right in nearly every web application, showing the signed-in email or full name. Missed more than any other element.",
      },
      {
        label: "Browser tab title",
        detail:
          "Applications put the document name, the customer name, or the account address in the page title. It shows in the tab strip and in window lists.",
      },
      {
        label: "Workspace, organization, or tenant name",
        detail:
          "In the header or a breadcrumb. It reveals the employer even when personal details are covered.",
      },
      {
        label: "Sidebar and document lists",
        detail:
          "The names of other documents, customers, or colleagues you are not disclosing. Visible in the left rail and often cut off at the edge, which makes it easy to overlook.",
      },
      {
        label: "Notification popups",
        detail:
          "A toast or a system notification that appeared during capture. Usually a message preview with a name and part of the text.",
      },
      {
        label: "Timestamps, timezone, and locale",
        detail:
          "Correlating a timestamp with a public profile is enough to identify a person in some contexts. The clock in a menu bar includes the timezone.",
      },
      {
        label: "URLs and internal hostnames",
        detail:
          "The address bar, and internal links shown in the page. A hostname like admin.internal.example.com is information about infrastructure.",
      },
      {
        label: "API keys and tokens in a code sample",
        detail:
          "A screenshot of a terminal or a config file. Keys have recognizable prefixes, and detection matches several of them.",
      },
      {
        label: "QR codes and barcodes",
        detail:
          "They encode data that a redaction of nearby text does nothing about. Cover them completely if they are not the subject of the screenshot.",
      },
    ],
  },
  auto: {
    heading: "What detection covers, and where it stops",
    intro:
      "Detection reads text in the image and matches eight pattern types, plus a rule that covers the value after a field name. For a screenshot this is a real time saver, because screenshots are exactly the crisp-text case that recognition handles well.",
    detects: [
      "Email addresses",
      "US phone numbers in common separated formats",
      "Social Security numbers in the separated form",
      "Card numbers of 13 to 19 digits that pass the Luhn checksum",
      "IPv4 addresses",
      "API keys with the sk-, AKIA, and ghp_ prefixes",
    ],
    misses: [
      "Names, usernames, and job titles. There is no named-entity detection, so a person's name is never found automatically.",
      "Workspace names, document titles, and internal hostnames.",
      "Faces, avatars, and photographs.",
      "Any text that is small, low contrast, or rendered in a font the recognition pass reads poorly.",
      "Handwriting and annotated screenshots.",
      "QR codes and barcodes, which are graphics rather than text.",
    ],
  },
  steps: {
    heading: "A repeatable pass that catches the corners",
    intro:
      "The order is deliberate: automatic first, then the frame, then the body. Working body-first is what causes corner leaks.",
    items: [
      {
        title: "Open the screenshot",
        body: "Drop it, paste it with Ctrl/Cmd+V, or choose a file. PNG, JPEG, and WebP up to 25 MB and 40 million pixels.",
      },
      {
        title: "Run auto-detect once",
        body: "It reports what it found, grouped by type. Treat the report as a list of candidates, not as a completion signal.",
      },
      {
        title: "Walk the frame",
        body: "Top strip: tabs, account chip, address bar. Left rail: document and people lists. Bottom strip: notifications, status bar, clock. Cover what you find before moving inward.",
      },
      {
        title: "Cover the body content",
        body: "Names, amounts, message text, and anything that identifies a customer or a colleague. Solid black by default; white only where the background is dark and a black box would look like part of the interface.",
      },
      {
        title: "Toggle detected types to double-check",
        body: "The type filter can hide a whole category of detected boxes. Turning email off and looking again is a fast way to confirm whether the remaining boxes cover everything you intended.",
      },
      {
        title: "Export, then zoom to 100%",
        body: "The download is a new PNG at the original resolution. Check each box edge at actual size — a one-pixel sliver of a character is the failure mode that thumbnails hide.",
      },
    ],
  },
  detail: {
    heading: "Crop first, redact second",
    body: [
      "The cheapest way to remove information from a screenshot is to not include it. If the browser chrome, the sidebar, and the taskbar are irrelevant to what you are showing, cropping them away removes a whole category of risk in one operation instead of eight.",
      "Cropping is not always possible. Sometimes the sidebar is the context, or the error only makes sense with the header visible. When that is the case, the frame has to be redacted deliberately rather than assumed harmless.",
      "A related habit worth building: take the screenshot twice. The first capture tells you what is in the frame. Close the notification, switch to a neutral account or a demo workspace, and capture again. A screenshot of a demo environment is fundamentally safer than a redacted screenshot of a production one, because there is no chance of missing a box.",
      "For screenshots that must come from a real account, the reliable sequence is: cover the corners, cover the body, then review the exported file rather than the editor. The editor shows you boxes on top of an image. The exported file shows you what a recipient will actually receive, which is the only thing that matters.",
    ],
  },
  faq: [
    {
      question: "Is blurring text in a screenshot safe?",
      answer:
        "Usually not for small text. Screenshot text is crisp and often occupies few pixels per character, which is the case where a blur leaves enough structure to reconstruct. Use solid fill for anything that must not be read.",
    },
    {
      question: "Can I redact a screenshot on a phone?",
      answer:
        "Yes. On touch screens there is a Draw/Scroll switch so a tall screenshot remains scrollable. Draw mode captures the drag as a box; Scroll mode hands panning back to the browser.",
    },
    {
      question: "Does the tool find names automatically?",
      answer:
        "Only when a field name stands in front of them. Nine rules match fixed formats (email, phone, SSN, card number, IBAN, IPv4, API keys, and Chinese mobile and ID numbers); a separate rule covers the value printed after a field name in any of twelve languages. A username in running text, or a job title, still needs a box drawn by hand.",
    },
    {
      question: "What happens to the screenshot after I download it?",
      answer:
        "Nothing is stored. The image is decoded in the tab, the edit exists only in memory, and reloading the page discards it. The download is the only file that exists.",
    },
    {
      question: "Does the exported PNG keep the original metadata?",
      answer:
        "The export is drawn on a fresh canvas and encoded from pixel data, so the source file's metadata structure is not carried over. This is a property of rebuilding the image rather than editing it in place.",
    },
    {
      question: "Should I use black or white fill?",
      answer:
        "Black is the default and the safest. White is useful on a dark-mode screenshot, where a black box can read as a UI element and confuse a reader about whether something was removed.",
    },
  ],
  pillarLink: {
    before:
      "Screenshots are the most common starting point, and the frame around the content is what usually leaks. If you want the general workflow before working through this checklist, you can",
    anchor: "redact image online",
    after:
      "in four steps, starting with the corners rather than the body text.",
  },
  related: ["redact-email-address", "redact-receipt", "redact-bank-statement", "redact-invoice"],
};

export const BANK_STATEMENT: Scenario = {
  slug: "redact-bank-statement",
  navLabel: "Bank statements",
  h1: "Redact a Bank Statement Before Sending It",
  title: "Redact a Bank Statement",
  description:
    "Hide account numbers, balances, and transaction details on a bank statement. Solid fill replaces pixels and the PNG is re-encoded. Runs in your browser.",
  lede:
    "A bank statement is requested constantly — for a rental application, a visa file, a loan, a mortgage broker. The recipient usually needs to see that money moved, not where it went or which account it came from. Those are different redactions.",
  risk: {
    heading: "A statement discloses behaviour, not just numbers",
    body: [
      "People think of a statement as financial data, and the balances are the part they guard. In practice the transaction list is the more revealing half. It shows where a person lives — rent, utilities, a local supermarket. It shows who they support, which medical providers they use, which subscriptions they hold, and what their habits are. A month of transactions is a behavioral profile.",
      "The account and routing numbers are a different category of risk. They are not card credentials and they cannot be charged directly, but combined with a name and an address they support direct debit fraud and, in the US, are the standard inputs to an ACH pull. Statements print them in full, usually at the top of the first page.",
      "There is a distribution problem too. A statement submitted for a rental application passes through a letting agent, possibly a background check service, and ends up in an email thread. Each copy is a full disclosure, and the original is rarely deleted. Reducing the statement to the minimum a recipient needs is not paranoia; it is the standard practice in jurisdictions with data minimization requirements.",
    ],
  },
  fields: {
    heading: "What a recipient actually needs versus what is printed",
    intro:
      "Decide this before you start drawing boxes. Covering the wrong things means resending, and resending means another copy exists.",
    rows: [
      {
        label: "Account and routing numbers",
        detail:
          "Printed in full at the top of a statement. Cover both, plus any repetition in a footer or a summary box.",
      },
      {
        label: "Statement period and closing balance",
        detail:
          "Usually what the recipient is verifying. Keep these unless the request explicitly does not need them.",
      },
      {
        label: "Individual transaction descriptions",
        detail:
          "The merchant names are the behavioral profile. Cover rows that reveal medical providers, religious organizations, political donations, or personal relationships.",
      },
      {
        label: "Full name and postal address",
        detail:
          "Printed in the header block. The name usually needs to stay if the statement is evidence of income; the street address often does not.",
      },
      {
        label: "Account holder identifiers beyond the name",
        detail:
          "Customer numbers, tax identifiers, and relationship-manager references. None of them help a recipient verify income.",
      },
      {
        label: "Card numbers in the transaction detail",
        detail:
          "Some statements list the card used for each purchase, including the last four digits. Cover the ones you do not need to show.",
      },
      {
        label: "Barcodes and statement IDs",
        detail:
          "Machine-readable identifiers on e-statements. They can resolve to the full document on the issuer's system.",
      },
    ],
  },
  auto: {
    heading: "Detection helps with the numbers, not the story",
    intro:
      "The patterns that match here are the account numbers and any email or phone in the header. The transaction narrative — which is the more sensitive part — is not something pattern matching can address.",
    detects: [
      "Card numbers of 13 to 19 digits that pass the Luhn checksum",
      "IPv4 addresses, which occasionally appear in a footer or a statement ID",
      "Email addresses in the header block",
      "US phone numbers",
      "Social Security numbers in the separated form, when a statement prints one",
    ],
    misses: [
      "Account and routing numbers. The formats are not matched, so they are covered only when the line says Account — otherwise cover them by hand every time.",
      "Merchant names, which are the behavioral disclosure.",
      "Balances and transaction amounts.",
      "Customer numbers and statement identifiers.",
      "Barcodes and QR codes.",
      "Any text in a scanned or photographed statement, where accuracy drops sharply.",
    ],
  },
  steps: {
    heading: "Producing a statement you can send",
    intro:
      "If you have the PDF, export the page to an image first. Editing a PDF leaves a readable text layer underneath an overlay, which is the single most common way a redacted financial document leaks.",
    items: [
      {
        title: "Convert the page to an image",
        body: "Take a screenshot of the page or export it as PNG. Image space is the only place where a redaction actually removes content, because there is no text layer left to read.",
      },
      {
        title: "Open the image here",
        body: "Drop, paste, or choose the file. It is decoded in the tab and never uploaded.",
      },
      {
        title: "Cover the account and routing numbers first",
        body: "They are at the top of page one and are the fields with the most direct abuse path. Use solid black.",
      },
      {
        title: "Decide on the transaction rows",
        body: "Cover the rows that disclose location, health, or relationships. Leaving everything visible is a choice, not a default; make it deliberately.",
      },
      {
        title: "Cover the header identifiers",
        body: "Customer number, tax identifier, and any barcode. These are the fields that let someone pull the original document.",
      },
      {
        title: "Export and verify",
        body: "Open the PNG and check that no account number is partially visible. Then check the page edge — statement layouts often repeat an identifier in a margin.",
      },
    ],
  },
  detail: {
    heading: "Why PDF redaction fails and image redaction does not",
    body: [
      "A PDF stores text as glyphs with positions, in a text layer, and draws them. Adding a black rectangle to a PDF adds a drawing object on top of that text layer. The text is still there. Selecting the area, copying it, running text extraction, or opening the file in a different viewer can expose the content that the black box was supposed to hide. This has caused real, documented disclosures from courts, law firms, and government agencies.",
      "Proper PDF redaction requires removing the underlying glyphs, which is a destructive operation and not something most consumer tools do. The reliable alternative, when you only need to share a page, is to rasterize it: turn the page into an image, then redact the image. What is left is pixels with no text layer.",
      "That is the workflow this tool supports. It works on images, not PDFs, by design. Convert first, then redact.",
      "One consequence worth stating plainly: rasterizing makes the text unselectable for legitimate recipients too. If you are sending a statement to a mortgage broker who needs to extract figures, they will have to read it rather than copy it. That is a real trade-off, and shipping a rasterized redaction is usually still the right call for a document you are handing to a third party.",
    ],
  },
  faq: [
    {
      question: "Can I redact a PDF directly?",
      answer:
        "Not with this tool. It works on images. Convert the PDF page to a PNG first — a screenshot is usually the fastest route — and redact the image. Redacting a PDF with an overlay leaves the original text readable underneath.",
    },
    {
      question: "Which numbers on a statement are the dangerous ones?",
      answer:
        "The account number and the routing number. Together with a name they support direct debit fraud, and unlike a card number they are not routinely rotated.",
    },
    {
      question: "Do I need to hide every transaction?",
      answer:
        "Not necessarily. Decide what the recipient is verifying — usually income or a balance — and cover the rows that disclose information unrelated to that. A rental agent needs to see deposits, not your medical appointments.",
    },
    {
      question: "Does the exported image keep the statement's metadata?",
      answer:
        "The export is a new PNG encoded from canvas pixel data, so the source image's metadata structure is not carried over. If the original PDF had document properties, those are not part of the image at all.",
    },
    {
      question: "Is anything uploaded while I do this?",
      answer:
        "No. There is no upload step and no server-side processing. The image is decoded in the browser tab and the download is created locally.",
    },
  ],
  pillarLink: {
    before:
      "Statements are usually submitted alongside other paperwork, and a PDF has to become an image before any of this works. The order matters more than the tool, and the",
    anchor: "redact image online",
    after:
      "walkthrough starts with rasterizing the page for exactly that reason.",
  },
  related: ["redact-receipt", "redact-card-number", "redact-ssn", "redact-contract"],
};

export const RECEIPT: Scenario = {
  slug: "redact-receipt",
  navLabel: "Receipts",
  h1: "Redact a Receipt Before Posting or Sending It",
  title: "Redact a Receipt",
  description:
    "Hide card digits, order numbers, addresses, and QR codes on a receipt. Solid fill replaces pixels and the PNG is rebuilt in your browser. No upload.",
  lede:
    "Receipts get shared for expense claims, warranty proof, returns, and resale listings. They carry more identifiers than most people expect, and the small ones at the bottom are the ones that matter.",
  risk: {
    heading: "A receipt is a compact identity document",
    body: [
      "A printed receipt often contains the last four digits of a card, the cardholder's name in some jurisdictions, a store and register number, a cashier identifier, a timestamp to the minute, a loyalty account number, and a QR code or barcode that resolves to the full transaction on the retailer's system. Individually these are minor. Together they are enough to answer verification questions or to retrieve the complete order record.",
      "The resale-listing case is the most exposed. Someone photographs a receipt to prove a device was purchased, posts it publicly with the item, and publishes a timestamp, a store location, and a payment identifier alongside the serial number. That is a strong correlation set for anyone building a profile.",
      "Expense claims have a different problem: the receipt travels through an internal system and often a third-party processor, and it is retained. Redacting the payment digits before submission is both a data minimization step and, in a growing number of jurisdictions, the expected handling for payment data that is not needed for the claim.",
    ],
  },
  fields: {
    heading: "What to cover on a receipt, top to bottom",
    intro:
      "Receipt layouts vary, but the fields cluster in the same places. Work downward.",
    rows: [
      {
        label: "Card digits and payment method",
        detail:
          "Usually near the total: 'VISA ****1234' or a masked number. Cover the digits; the card network alone is not identifying.",
      },
      {
        label: "Cardholder name and signature line",
        detail:
          "Printed on some merchant copies and on signed slips. Both identify a person.",
      },
      {
        label: "Store number, register, and cashier ID",
        detail:
          "These identify which transaction it was, not just where. Useful for a retailer to look up the full record.",
      },
      {
        label: "The QR code or barcode",
        detail:
          "Retail receipts increasingly print a code that opens the digital receipt. It is a direct pointer to the full transaction and usually encodes an order identifier.",
      },
      {
        label: "Loyalty or membership number",
        detail:
          "Links the purchase to a named account, which is a stronger identifier than the payment digits.",
      },
      {
        label: "Exact timestamp",
        detail:
          "To the minute, plus a store location. Consider whether your use case needs it; a warranty claim usually needs the date, not the time.",
      },
      {
        label: "Order and invoice numbers",
        detail:
          "Frequently usable as a lookup key on the merchant's order-tracking page, sometimes with just an email address.",
      },
      {
        label: "Delivery address on shipped orders",
        detail:
          "Printed in full on packing slips. Cover it when the receipt is being shared publicly.",
      },
    ],
  },
  auto: {
    heading: "Receipts are the hardest input for text recognition",
    intro:
      "Thermal paper is low contrast, glossy, and often photographed at an angle. Expect the detection pass to find less here than it would on a screenshot, and plan to draw most boxes by hand.",
    detects: [
      "Card numbers of 13 to 19 digits that pass the Luhn checksum, when printed in full",
      "Email addresses, which appear on e-receipts and loyalty sign-ups",
      "US phone numbers, on merchant footers and customer service lines",
      "IPv4 addresses, rarely, on network-printed receipts",
    ],
    misses: [
      "Masked card digits such as ****1234. Four digits alone do not match the card pattern, and they are exactly what a receipt prints.",
      "The QR code and barcode. These are graphics, not text, and detection does not read them at all.",
      "Store numbers, register IDs, and cashier identifiers.",
      "Order numbers, which are usually alphanumeric and match only when a label such as Order or 订单号 stands in front of them.",
      "Most text on a curved, glossy, thermally printed receipt, where recognition accuracy drops significantly.",
    ],
  },
  steps: {
    heading: "Getting a receipt clean enough to share",
    intro:
      "Photograph or scan it flat, then redact the image. Trying to redact a photo taken at an angle makes every box harder to place accurately.",
    items: [
      {
        title: "Get a flat, even image",
        body: "A scanner or a flat-lay photo in even light gives the recognition pass and your own eye the best chance. Curved thermal paper with a highlight across the middle is the worst case.",
      },
      {
        title: "Open it here",
        body: "Drop, paste, or choose the file. PNG, JPEG, and WebP up to 25 MB and 40 million pixels. Nothing is uploaded.",
      },
      {
        title: "Cover the payment block first",
        body: "Card digits, cardholder name, signature. This is the group with the most direct abuse path and the one that is most consistently overlooked on expense receipts.",
      },
      {
        title: "Cover the codes",
        body: "The QR code and the barcode, completely — not just the middle. A partial code can still be reconstructed if enough of the finder patterns survive.",
      },
      {
        title: "Cover the lookup keys",
        body: "Order number, loyalty number, cashier and register IDs. These are what let someone else retrieve the full transaction.",
      },
      {
        title: "Decide on the timestamp",
        body: "Keep the date for warranty purposes, and consider covering the exact time if the receipt is going somewhere public.",
      },
      {
        title: "Export and check the edges",
        body: "Thermal receipts fade at the edges, and a box that looks complete on screen may leave a sliver of a digit visible in the exported file. Zoom in.",
      },
    ],
  },
  detail: {
    heading: "A four-digit tail is still a disclosure",
    body: [
      "Receipts almost never print a full card number. They print the last four digits, sometimes with the card network. That feels safe, and it is much safer than the full number — but it is not nothing.",
      "The last four digits are one of the standard verification fields for a merchant. Combined with an order number, a name, and a date, they are often sufficient for a phone agent to discuss an order or change a delivery address. In a resale listing, they sit next to a serial number and a timestamp, which is a coherent set for someone assembling an identity.",
      "This is where the tool's detection has a blind spot worth stating explicitly. The card pattern requires 13 to 19 digits. A four-digit tail does not match, so detection will never find it. If you run auto-detect on a receipt and it reports nothing, that is not evidence the receipt is clean — it is evidence that no full-length number was found.",
      "The QR code has the same property for a different reason. It is not text, it encodes the transaction identifier, and a redaction of the surrounding text leaves it completely intact. Cover it as a block.",
    ],
  },
  faq: [
    {
      question: "Auto-detect found nothing on my receipt. Is it clean?",
      answer:
        "Not necessarily. Receipts usually print masked card digits rather than full numbers, and masked digits do not match the card pattern. If detection reports nothing, check the payment block, the QR code, and the order number by hand.",
    },
    {
      question: "Should I cover the QR code?",
      answer:
        "Yes, if the receipt is going anywhere public. Retail QR codes typically resolve to the full digital transaction, so leaving one visible defeats the purpose of covering the text.",
    },
    {
      question: "Do I need to hide the total?",
      answer:
        "Only if the amount itself is sensitive. For a warranty or expense claim, the total is usually the point. For a public post, consider whether the amount says something about you that you did not intend to publish.",
    },
    {
      question: "Can I photograph the receipt instead of scanning it?",
      answer:
        "Yes, and phone photos are usually fine. Get the receipt flat, avoid a highlight across the middle, and check the exported file at full zoom — thermal printing fades unevenly and can hide a partially visible digit.",
    },
    {
      question: "What format do I get back?",
      answer:
        "A PNG at the original resolution. It is drawn on a fresh canvas and encoded from pixel data, so the file is rebuilt rather than edited in place.",
    },
  ],
  pillarLink: {
    before:
      "A receipt is one of the easier documents to clear, because the fields cluster in the same two blocks every time. If you are working through a batch of paperwork rather than a single receipt, the",
    anchor: "redact image online",
    after:
      "tool runs one image at a time with no per-export cost and no account to manage.",
  },
  related: ["redact-bank-statement", "redact-card-number", "redact-screenshot", "redact-invoice"],
};
