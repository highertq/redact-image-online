import type { Scenario } from "@/lib/content/types";

export const INVOICE: Scenario = {
  slug: "redact-invoice",
  navLabel: "Invoices",
  h1: "Redact an Invoice Before You Send It",
  title: "Redact an Invoice",
  description:
    "Hide bank details, tax IDs, and client names on an invoice. Solid fill replaces the pixels and the PNG is re-encoded in your browser. No upload.",
  lede:
    "An invoice is a document built to be paid, which means it carries the exact routing details a fraudster needs. Sending one to a new client, a factor, or an accountant usually requires hiding more than the price.",
  risk: {
    heading: "The invoice is the most-targeted business document there is",
    body: [
      "Business email compromise follows a predictable pattern, and invoices are the vehicle. An attacker who obtains a real invoice learns the supplier's letterhead, the finance contact's name, the invoice numbering format, and — critically — the bank details. They then send a near-identical invoice with the account number changed, timed to a real payment cycle. The recipient has already seen the format, so nothing looks wrong.",
      "That is why the bank block is the field that matters most on an invoice, and why publishing a complete invoice anywhere public is a genuinely bad idea. The amount is commercially sensitive; the account and routing numbers are an attack surface.",
      "There is a second audience problem. Invoices get forwarded. A freelancer sends one to a client, who forwards it to their accountant, who forwards it to a bookkeeper, who stores it in a shared drive. Every hop is a copy, and the original is almost never withdrawn. Reducing the document to what each recipient actually needs is the only way to limit that spread, and it is increasingly what data minimization rules expect.",
    ],
  },
  fields: {
    heading: "What to cover, in the order that matters",
    intro:
      "The first four items are the fraud vector. The rest is commercial and personal disclosure that depends on who is receiving the document.",
    rows: [
      {
        label: "Bank account and routing numbers",
        detail:
          "The single most dangerous field on the page. Cover both in full, including any repetition in a payment-terms block or a footer.",
      },
      {
        label: "IBAN, SWIFT, and sort code",
        detail:
          "The non-US equivalents, often printed alongside an account name and bank address. Cover the whole block rather than the number alone.",
      },
      {
        label: "Tax identification numbers",
        detail:
          "EIN, VAT number, ABN, GST/HST number. These identify the business to a tax authority and are not needed by most recipients.",
      },
      {
        label: "Account holder name in the bank block",
        detail:
          "Usually printed separately from the signature or the letterhead. Combined with the account number it completes the payment instruction.",
      },
      {
        label: "Client name, address, and contact details",
        detail:
          "On an outbound invoice the recipient already knows who they are, so the bill-to block is often safe to keep. On an invoice used as a sample or a portfolio piece, cover it.",
      },
      {
        label: "Line-item descriptions",
        detail:
          "These disclose what was bought, at what rate, sometimes with an internal project code. Cover anything that reveals a client's business.",
      },
      {
        label: "Invoice and purchase-order numbers",
        detail:
          "Usable as a lookup key on a supplier portal, sometimes with nothing more than an email address. Worth covering on anything public.",
      },
      {
        label: "Signature and stamp",
        detail:
          "A scanned signature is reusable on other documents. Cover it if the invoice is going anywhere other than the named recipient.",
      },
      {
        label: "QR codes and payment links",
        detail:
          "Increasingly printed for instant payment. A QR code that resolves to a payment page is worse than a visible account number, because it is not obviously financial at a glance.",
      },
    ],
  },
  auto: {
    heading: "Where automatic detection helps on an invoice",
    intro:
      "Invoices are usually crisp digital documents or clean scans, which is the input the recognition pass handles best. But the fields that matter most here are not the ones it looks for.",
    detects: [
      "Card numbers of 13 to 19 digits that pass the Luhn checksum, when a card was the payment method",
      "Email addresses in the header, footer, and remittance instructions",
      "US phone numbers in the supplier contact block",
      "IPv4 addresses, which occasionally appear in a footer or an e-invoicing reference",
      "Social Security numbers in the separated form, on contractor invoices that should not be printing one",
    ],
    misses: [
      "Bank account and routing numbers. These are not one of the six matched patterns, so the most important field on the page always needs a box drawn by hand.",
      "IBAN and SWIFT codes, for the same reason.",
      "Tax identification numbers. The format varies by country and is not recognized.",
      "Client names, addresses, and line-item descriptions.",
      "Invoice numbers, which are alphanumeric and not a matched pattern.",
      "QR codes and payment links.",
    ],
  },
  steps: {
    heading: "Clearing an invoice for a third party",
    intro:
      "Decide who the recipient is before you start. An accountant needs the totals and the tax breakdown; a new client does not need your bank details in a preview document.",
    items: [
      {
        title: "Convert the PDF to an image first",
        body: "If the invoice is a PDF, screenshot it or export the page as PNG. Covering text in a PDF with a shape leaves the original text layer readable underneath.",
      },
      {
        title: "Cover the bank block completely",
        body: "Draw one box across the whole payment instruction rather than one box per number. A single wide box is easier to verify and cannot leave a digit between two boxes.",
      },
      {
        title: "Cover the tax identifiers",
        body: "EIN, VAT, and equivalents. These sit in the header or footer, which is exactly where people stop looking.",
      },
      {
        title: "Decide on the bill-to block",
        body: "Keep it for the named recipient. Cover it if the invoice is being used as a sample, a portfolio piece, or a template.",
      },
      {
        title: "Cover the codes and the signature",
        body: "QR code, payment link, scanned signature, and company stamp. All four are reusable material.",
      },
      {
        title: "Export and zoom in on the bank block",
        body: "Open the PNG at actual size and check that no digit survives at the edge of the box. Financial documents are the case where a one-pixel sliver is genuinely expensive.",
      },
    ],
  },
  detail: {
    heading: "Why an overlay on a PDF invoice is not enough",
    body: [
      "A PDF stores text as positioned glyphs in a text layer and draws them. Adding a black rectangle adds another drawing object on top. The text is still there, in order, extractable with a select-all or a text dump. This is not a theoretical weakness — it has caused real disclosures from law firms, courts, and public bodies.",
      "Proper PDF redaction requires destroying the underlying glyphs, which most consumer tools do not do. The reliable alternative for a document you only need to share as a page is to rasterize it first: turn the page into an image, then redact the image. What remains is pixels with no text layer behind them.",
      "That is the workflow this tool supports, deliberately. It works on images, not PDFs. Convert, then redact. The trade-off is that the text becomes unselectable for the recipient too, which matters if they need to copy figures into a ledger. For an invoice going to a third party, that trade is usually worth making.",
      "One more thing worth knowing about invoices specifically: the bank block is often the only field that repeats. It appears in the payment terms near the bottom and again in a header summary on some templates. A single box on the first occurrence leaves the second one intact, and the second one is the one a fraudster would change.",
    ],
  },
  faq: [
    {
      question: "Should I redact the bank details before sending an invoice to a client?",
      answer:
        "If the client needs to pay by transfer, they need the details. The safer pattern is to send the redacted invoice as a preview or a quote and provide payment details through a separate, verified channel.",
    },
    {
      question: "Can I redact a PDF invoice directly?",
      answer:
        "Not with this tool. Convert the page to an image first, then redact the image. A shape drawn over a PDF leaves the text layer intact and readable.",
    },
    {
      question: "Does detection find the IBAN or the account number?",
      answer:
        "No. Account, routing, IBAN, and SWIFT formats are not among the six matched patterns. Draw those boxes by hand every time.",
    },
    {
      question: "Will the exported file still carry the invoice's metadata?",
      answer:
        "The export is drawn on a fresh canvas and encoded from pixel data, so the source image's metadata container is not carried across. Document properties from an original PDF are not part of the image at all.",
    },
    {
      question: "Is anything uploaded while I do this?",
      answer:
        "No. There is no upload step and no server-side processing. The image is decoded in the browser tab and the download is created locally.",
    },
  ],
  pillarLink: {
    before:
      "Invoices, statements, and contracts usually arrive as a batch rather than one at a time. If you want the general workflow before working through this specific document, you can",
    anchor: "redact image online",
    after:
      "in four steps, and the mistakes listed there apply to every document on this site.",
  },
  related: ["redact-receipt", "redact-contract", "redact-bank-statement"],
};

export const CONTRACT: Scenario = {
  slug: "redact-contract",
  navLabel: "Contracts",
  h1: "Redact a Contract Before Sharing a Copy",
  title: "Redact a Contract",
  description:
    "Hide names, signatures, addresses, and commercial terms in a contract. Solid fill replaces pixels and the PNG is rebuilt in your browser. No upload.",
  lede:
    "Contracts are shared constantly — as proof of engagement, in due diligence, in disputes, as samples. The problem is that the parts you need to show and the parts that must stay private sit on the same page.",
  risk: {
    heading: "A contract exposes relationships, not just terms",
    body: [
      "The commercial terms in a contract are confidential by default, and that is the part people remember to protect. The more revealing content is the structure around them: who the parties are, what the scope covers, which jurisdictions and governing laws apply, what the notice addresses are, and who signed on each side.",
      "Taken together that is a map of a business relationship. It reveals that two named companies are working together, on what, under which legal framework, and from when. For a startup, that is often more sensitive than the numbers, because it discloses a customer relationship before it is announced.",
      "There is also a practical asymmetry. Contracts get shared in due diligence, in financing, in insurance, and in disputes, and each of those recipients has a legitimate need for a different subset. Sending the whole document to all of them means the most permissive disclosure sets the standard, and copies accumulate in inboxes and shared drives with no way to withdraw them.",
    ],
  },
  fields: {
    heading: "What to cover on a contract page",
    intro:
      "Start with the parties block and the signature block, then work through the clauses. The signature block is the one that gets forgotten because it is on the last page.",
    rows: [
      {
        label: "Full legal names of both parties",
        detail:
          "Including any trading name that appears alongside. On a sample or template, also cover the entity type and registration number.",
      },
      {
        label: "Registered addresses and notice addresses",
        detail:
          "The notice block is usually a specific physical address for legal service. It identifies a real office and often a real person.",
      },
      {
        label: "Signatures and initials",
        detail:
          "Every page may carry initials, not just the last one. A scanned signature is directly reusable on another document.",
      },
      {
        label: "Signatory names, titles, and contact details",
        detail:
          "Printed under each signature line, often with an email and a direct phone number.",
      },
      {
        label: "Commercial terms",
        detail:
          "Fees, rates, payment schedules, discounts, and volume commitments. Confidential by definition and usually the first thing a recipient should not see in full.",
      },
      {
        label: "Company registration and tax identifiers",
        detail:
          "Company number, VAT number, EIN. These identify the entity precisely and are not needed to demonstrate that a contract exists.",
      },
      {
        label: "Governing law and jurisdiction clauses",
        detail:
          "Reveals where a company is established and which courts it accepts. Useful intelligence and rarely necessary for the recipient's purpose.",
      },
      {
        label: "Definitions of scope and deliverables",
        detail:
          "The scope section often names products, internal systems, or client projects that are otherwise undisclosed.",
      },
      {
        label: "Witness and notary details",
        detail:
          "Third-party names, addresses, and licence numbers on notarized pages. Those people did not consent to being published.",
      },
      {
        label: "Schedule and annex references",
        detail:
          "Annex titles often reveal more than the clause that points to them. Cover the title, not just the reference.",
      },
    ],
  },
  auto: {
    heading: "What detection covers on a contract",
    intro:
      "Contracts are text-dense and usually well typeset, which helps recognition. But almost nothing that matters on a contract is a pattern the tool matches.",
    detects: [
      "Email addresses throughout the notices and signature blocks",
      "US phone numbers in the parties and notices sections",
      "Card numbers, occasionally, in a payment schedule appendix",
      "Social Security numbers in the separated form, on contractor or employment agreements",
      "IPv4 addresses in technical schedules or system descriptions",
    ],
    misses: [
      "Party names, entity names, and trading names. There is no named-entity detection at all.",
      "Registered and notice addresses.",
      "Signatures, initials, stamps, and seals.",
      "Signatory names and job titles.",
      "Commercial terms: fees, rates, and payment schedules.",
      "Company registration numbers, VAT numbers, and EINs.",
      "Scope definitions, annex titles, and governing law clauses.",
    ],
  },
  steps: {
    heading: "Producing a shareable contract page",
    intro:
      "Contracts run to many pages, and the fields to cover vary per page. Work page by page rather than trying to plan the whole document at once.",
    items: [
      {
        title: "Rasterize the page",
        body: "Convert the PDF page to a PNG. A shape placed over PDF text leaves the text layer readable and selectable, which defeats the purpose entirely.",
      },
      {
        title: "Cover the parties block on page one",
        body: "Legal names, registration numbers, and addresses. This is the highest-value block on the document.",
      },
      {
        title: "Cover the commercial terms",
        body: "Fees, rates, and schedules. If the recipient needs to verify that an agreement exists, they do not need the pricing.",
      },
      {
        title: "Sweep every page for initials",
        body: "Page footers often carry initials or a short-form signature. Each one is a reusable mark and each one is easy to skip.",
      },
      {
        title: "Cover the signature and witness blocks",
        body: "Names, titles, emails, phone numbers, and any notary details. On a notarized page, the notary's licence number and address belong to a third party.",
      },
      {
        title: "Export and check the last page",
        body: "The signature page is the one people stop before. Open the PNG and verify it at full size, then check that no initials survived in the footers you passed.",
      },
    ],
  },
  detail: {
    heading: "Redaction is not the same as confidentiality",
    body: [
      "Covering the names and the numbers on a contract page reduces disclosure. It does not make the document confidential, and it does not create a legal right to share it. If a contract contains a confidentiality clause — most do — sharing a redacted version with a third party may still breach it, because the obligation usually covers the existence and content of the agreement rather than only the identifying details.",
      "That distinction matters practically. Redaction is a disclosure-reduction technique. Permission to share is a separate question, and it is a question for the counterparty or for a lawyer, not for a tool.",
      "The same caution applies to the visual details. A contract page carries a letterhead, a document reference scheme, a font, a footer format, and sometimes a watermark from a document management system. Each of those can identify the organization even when every name is covered. If the goal is to show a clause without revealing who the clause belongs to, the template around the clause needs attention too.",
      "On the technical side, contracts are the case where rasterizing matters most. A contract is exactly the document type that gets redacted badly in PDF form and then published, and a text layer behind a black box is the single most common failure in that pattern.",
    ],
  },
  faq: [
    {
      question: "Can I redact a signed PDF contract directly?",
      answer:
        "Not in a way that removes the text. A shape over PDF text leaves the underlying glyphs readable. Convert the page to an image and redact the image instead.",
    },
    {
      question: "Is a redacted contract still confidential?",
      answer:
        "Redaction reduces disclosure; it does not change your obligations. If the agreement has a confidentiality clause, check whether you are permitted to share any version before you do.",
    },
    {
      question: "Do I need to cover every page or just the signature page?",
      answer:
        "Every page that carries something identifying. Initials in footers, annex titles, and scope definitions appear throughout, and a single uncovered page can undo the rest.",
    },
    {
      question: "Does the tool detect party names automatically?",
      answer:
        "No. Detection matches six fixed text patterns. Names, addresses, signatures, and entity names always need a box drawn by hand.",
    },
    {
      question: "What happens to the file after I download it?",
      answer:
        "Nothing is stored. The image lives in the browser tab, the boxes live in memory, and reloading the page discards everything. The download is the only file produced.",
    },
  ],
  pillarLink: {
    before:
      "Contracts, statements, and invoices share the same failure mode: a redaction applied to a PDF instead of to the pixels. If you want the underlying explanation first, you can",
    anchor: "redact image online",
    after:
      "after reading why the order of operations decides whether the redaction holds.",
  },
  related: ["redact-invoice", "redact-signature", "redact-bank-statement"],
};

export const MEDICAL_RECORD: Scenario = {
  slug: "redact-medical-record",
  navLabel: "Medical records",
  h1: "Redact a Medical Record Before Sharing It",
  title: "Redact a Medical Record",
  description:
    "Hide patient identifiers on a medical record: names, dates of birth, record numbers, insurance IDs. Solid fill replaces pixels. No upload.",
  lede:
    "Medical records are the document type where a partial redaction is most likely to be a reportable incident. Identifiers are spread across headers, footers, and margins, and the sensitive part is often the diagnosis rather than the name.",
  risk: {
    heading: "Health information is the most heavily regulated category here",
    body: [
      "In the United States, a photograph of a medical record containing a name plus a diagnosis, treatment, or date of service is protected health information. Sharing it outside a permitted purpose is a disclosure event with legal consequences, not just an embarrassment. Comparable regimes exist in the EU, the UK, Canada, and Australia, and most of them treat health data as a special category requiring a higher standard of protection.",
      "The identifiers that trigger that classification are broader than people expect. Under the US standard, the list includes names, dates more specific than a year, geographic subdivisions smaller than a state, phone and fax numbers, email addresses, Social Security numbers, medical record numbers, health plan numbers, account numbers, certificate and licence numbers, vehicle identifiers, device serial numbers, URLs, IP addresses, full-face photographs, and any other unique identifying code.",
      "This is why medical records are the one case where the usual advice — cover the name and move on — is clearly insufficient. A discharge summary with the name covered still carries the record number, the admission and discharge dates, the attending physician, the facility, and the diagnosis. Several of those are direct identifiers on their own.",
    ],
  },
  fields: {
    heading: "The identifier list, practically applied",
    intro:
      "Work through this before you decide the document is clean. The items people cover first are rarely the ones that carry the most risk.",
    rows: [
      {
        label: "Patient name in every position",
        detail:
          "Header, footer, page numbers, specimen labels, and any stamp. Medical records repeat the name on every page, which is good for safety and bad for redaction.",
      },
      {
        label: "Medical record number and account number",
        detail:
          "A direct identifier, and it resolves to the full record in the provider's system. Usually printed in the header of every page.",
      },
      {
        label: "Dates more specific than a year",
        detail:
          "Date of birth, admission and discharge dates, date of service, and appointment dates. These are identifiers under the standard, not merely context.",
      },
      {
        label: "Insurance and health plan identifiers",
        detail:
          "Member ID, group number, and policy number. These are financial and identify the person precisely.",
      },
      {
        label: "Provider names and facility details",
        detail:
          "Attending physician, referring physician, clinic name, and address. Identifying the provider plus a date plus a condition often identifies the patient by elimination.",
      },
      {
        label: "Diagnosis and procedure codes",
        detail:
          "ICD and CPT codes are short, structured, and often enough to identify a rare condition. Cover them if the condition itself is sensitive.",
      },
      {
        label: "Photographs and imaging",
        detail:
          "Clinical photographs may include a face or a distinguishing feature. Imaging studies frequently carry burned-in patient details in a corner of the frame.",
      },
      {
        label: "Barcodes and QR codes",
        detail:
          "Specimen labels and wristband printouts encode the record number. Covering the text and leaving the barcode leaves a direct lookup key visible.",
      },
      {
        label: "Free-text notes",
        detail:
          "Clinician notes often restate the name, mention family members, or describe circumstances that identify the patient even with the header removed.",
      },
    ],
  },
  auto: {
    heading: "What detection will find, and why it is not enough here",
    intro:
      "Detection can help with the numeric identifiers. It cannot help with the field that matters most, and it is important to be clear about that before relying on it for a document of this kind.",
    detects: [
      "Social Security numbers in the separated form, which appear on some intake and billing documents",
      "US phone numbers in patient and provider contact blocks",
      "Email addresses",
      "Card numbers of 13 to 19 digits that pass the Luhn checksum, on billing statements",
      "IPv4 addresses, which appear in some system-generated reports",
    ],
    misses: [
      "Patient names. There is no named-entity recognition, so the single most important identifier is never found automatically.",
      "Medical record numbers and account numbers. Not among the six matched patterns.",
      "Dates of birth and dates of service.",
      "Insurance member and group IDs.",
      "Provider names, facility names, and addresses.",
      "Diagnosis and procedure codes.",
      "Faces in clinical photographs.",
      "Barcodes and QR codes on specimen labels.",
    ],
  },
  steps: {
    heading: "A deliberately cautious process",
    intro:
      "For a document in this category, the goal is not a fast pass. The goal is a document you can defend having shared.",
    items: [
      {
        title: "Confirm you are allowed to share it at all",
        body: "Redaction reduces disclosure; it does not create permission. If the record belongs to a patient, sharing any version may require consent or a permitted purpose. Decide this before touching the file.",
      },
      {
        title: "Decide the minimum the recipient needs",
        body: "Covering the diagnosis is often more important than covering the name, depending on who is asking. If the recipient only needs proof of attendance, most of the document can go.",
      },
      {
        title: "Rasterize the page",
        body: "A PDF with a black box over text still contains the text. Convert the page to a PNG so the redaction is applied to pixels.",
      },
      {
        title: "Cover the header and footer of every page",
        body: "Name, record number, account number, and dates repeat there. On a multi-page record this is the bulk of the work and the bulk of the risk.",
      },
      {
        title: "Cover the barcodes",
        body: "Completely, including the quiet zone around them. A specimen label barcode encodes the record number you just covered in text.",
      },
      {
        title: "Read the free-text notes",
        body: "Clinician notes frequently restate names, mention relatives, or describe a circumstance that identifies the patient. Read them rather than scanning them.",
      },
      {
        title: "Export and review at full size",
        body: "Open the PNG, zoom to actual size, and go page by page. On a document of this kind, a missed identifier in a footer is the failure that matters.",
      },
    ],
  },
  detail: {
    heading: "Why this page does not promise a compliant result",
    body: [
      "It would be easy to write a page that says redacting a medical record with this tool makes it safe to share. That would be false, and on this particular document type the falsehood would be consequential.",
      "De-identification under the US standard has two recognized paths. The first is the safe harbor method: remove all eighteen enumerated identifiers, and confirm that no actual knowledge remains that the information could be used to identify the individual. The second is expert determination, where a qualified statistician determines that the risk of re-identification is very small. Neither path is something a browser tool can certify, and the first one requires a judgement about residual identifiability that depends on the specific document.",
      "What this tool does is narrower and verifiable: it replaces the pixels inside the boxes you draw, and it re-encodes the image so metadata from the source file is not carried across. That is a real contribution to de-identification. It is not the whole of it.",
      "The practical consequence is that a medical record needs a human review pass after the redaction, and probably a second one from someone who knows the regulatory requirement that applies. If that sounds like a high bar, it is the correct bar for this category of document. For a receipt or a screenshot, a careful single pass is reasonable. For a patient record, it is not.",
    ],
  },
  faq: [
    {
      question: "Does redacting a medical record make it HIPAA compliant?",
      answer:
        "No, and no browser tool can certify that. De-identification has specific legal standards, including a residual-risk judgement, that depend on the document. Redaction removes what you select; compliance is a separate determination.",
    },
    {
      question: "Can I share a medical record if I cover the patient's name?",
      answer:
        "Usually not sufficient. Record numbers, dates of service, provider names, facility details, and diagnosis codes are identifiers in their own right.",
    },
    {
      question: "Does the tool find patient names automatically?",
      answer:
        "No. Detection matches six fixed text patterns and has no name recognition. On a medical record, assume every identifier needs a box drawn by hand.",
    },
    {
      question: "Is the image uploaded anywhere?",
      answer:
        "No. There is no upload step and no server-side processing. The image is decoded in the tab and the download is created locally. If you reload the page, it is gone.",
    },
    {
      question: "What about photographs and scans of imaging?",
      answer:
        "Clinical photographs can contain a face, and imaging films often carry burned-in patient details in a corner. Both need manual boxes, and a face is not something pattern matching can address.",
    },
  ],
  pillarLink: {
    before:
      "Health documents carry a higher bar than anything else on this site, and the technique is worth understanding before applying it here. You can",
    anchor: "redact image online",
    after:
      "with a solid fill, which matters most when the consequence of a miss is legal rather than embarrassing.",
  },
  related: ["redact-ssn", "redact-bank-statement", "redact-signature"],
};

export const QR_CODE: Scenario = {
  slug: "redact-qr-code",
  navLabel: "QR codes",
  h1: "Cover a QR Code in an Image",
  title: "Cover a QR Code",
  description:
    "Hide a QR code or barcode in a screenshot or photo. Solid fill removes the modules rather than blurring them. The PNG is rebuilt in your browser.",
  lede:
    "A QR code looks like decoration and behaves like a link. Redacting the text next to one while leaving the code visible is the most common way a careful redaction fails completely.",
  risk: {
    heading: "A QR code is a URL that does not look like a URL",
    body: [
      "A QR code encodes up to a few thousand characters and in practice almost always encodes a URL, a payment request, a Wi-Fi credential, or a structured identifier like a ticket or a patient record. It scans instantly, it is not obviously data, and it survives in places people consider decorative — the corner of a receipt, a shipping label, a conference badge, a poster in the background of a photo.",
      "The failure pattern is consistent: someone redacts the account number printed on a receipt and leaves the QR code that opens the same transaction. Or they cover the patient name in a screenshot and leave the specimen label. Or they blur a face in a photo and leave the event badge on the lanyard, which resolves to a named attendee record.",
      "There is a second problem that is specific to machine-readable codes: a partial cover often does not work. QR codes carry error correction data, and at the common levels the format tolerates damage to a meaningful fraction of its modules. Covering the middle third of a code frequently leaves it readable. The finder patterns in three corners do most of the work of locating the symbol, and the rest can be reconstructed from the error correction data.",
    ],
  },
  fields: {
    heading: "Where QR codes and barcodes turn up",
    intro:
      "The first two are the ones people expect. The rest are the ones that leak.",
    rows: [
      {
        label: "Receipts and invoices",
        detail:
          "Often the code resolves to the full digital transaction, including card digits and a customer identifier. It is a direct pointer, not just a summary.",
      },
      {
        label: "Shipping labels and packing slips",
        detail:
          "Encodes the tracking number, which frequently resolves to a delivery address on the carrier's public tracking page.",
      },
      {
        label: "Specimen labels and wristbands",
        detail:
          "Encodes the medical record number. Covering the printed text and leaving the barcode leaves the lookup key intact.",
      },
      {
        label: "Event badges and lanyards",
        detail:
          "Common in conference photos, including background figures. Often resolves to a named attendee record.",
      },
      {
        label: "Posters, menus, and signage",
        detail:
          "In the background of a photo taken in a public place. Rarely the subject, always scannable.",
      },
      {
        label: "Payment requests",
        detail:
          "Person-to-person payment codes. Covering the visible account number does nothing about a code that opens a payment page directly.",
      },
      {
        label: "Wi-Fi credentials",
        detail:
          "On a router label or a printed card in an office photo. A scanned code joins the network without a password being visible anywhere.",
      },
      {
        label: "Ticket and boarding pass codes",
        detail:
          "Aztec and PDF417 codes on travel documents. They encode the booking reference and sometimes the passenger name.",
      },
    ],
  },
  auto: {
    heading: "Detection does not read codes at all",
    intro:
      "This is worth stating plainly because it is the most likely source of a false sense of safety on this page.",
    detects: [
      "Email addresses printed near the code",
      "Phone numbers printed near the code",
      "Card numbers of 13 to 19 digits that pass the Luhn checksum, when printed in full",
      "IPv4 addresses, occasionally in a footer",
    ],
    misses: [
      "The QR code itself. It is a graphic, not text, so the recognition pass never sees it.",
      "Barcodes, including Code 128, EAN, and PDF417.",
      "Aztec codes on travel documents.",
      "The URL or identifier a code encodes.",
      "Any text rendered inside the image area of a code, such as a payment logo.",
    ],
  },
  steps: {
    heading: "Covering a code so it cannot be scanned",
    intro:
      "A code is not covered until it fails to scan. That is a testable condition, and it is worth testing rather than assuming.",
    items: [
      {
        title: "Locate every code, not just the obvious one",
        body: "Scan the whole frame at full zoom. Codes in a photo are often small, in a corner, or on an object in the background rather than the subject.",
      },
      {
        title: "Cover the whole symbol plus its margin",
        body: "Draw the box past the symbol on all four sides, including the blank quiet zone. Cropping into the quiet zone can leave a code readable by a determined scanner.",
      },
      {
        title: "Do not rely on covering the middle",
        body: "Error correction means a partially covered code is often still decodable. Cover the entire symbol rather than the data-bearing center.",
      },
      {
        title: "Use solid fill, never blur",
        body: "A blurred code retains the light-dark structure of its modules, and scanners are designed to work with degraded input. Solid black removes the pattern entirely.",
      },
      {
        title: "Handle codes on curved or angled surfaces carefully",
        body: "A code on a bottle, a lanyard, or a sign photographed at an angle needs a box that follows the shape. Several small overlapping boxes are safer than one loose box.",
      },
      {
        title: "Test the export",
        body: "After downloading, try to scan the exported PNG with a phone. If it scans, the box was not wide enough. This is the only reliable check.",
      },
    ],
  },
  detail: {
    heading: "Why error correction makes partial covers dangerous",
    body: [
      "QR codes are designed to be readable when damaged. That is a feature for a sticker on a shipping box and a hazard for anyone trying to redact one. The format stores redundant data at one of four error correction levels, and at the common medium level it tolerates roughly fifteen percent of the symbol being unreadable. At the highest level it tolerates about thirty percent.",
      "This means the intuitive action — put a box over the middle of the code — is the least effective one. The middle carries data, but the redundancy means the data can often be reconstructed. What a scanner actually needs is the three large square finder patterns in the corners, which establish the symbol's position, scale, and orientation. Leave those visible and cover the middle, and many scanners will still succeed.",
      "The robust approach is therefore to cover the symbol in its entirety, including the quiet zone of blank space around it, with a single solid box. There is no redundancy that survives the complete removal of every module.",
      "Barcodes behave differently but the conclusion is the same. One-dimensional codes carry a check digit and a small amount of redundancy, and linear scanners are tolerant of partial height — a barcode with its top half covered often still reads. Cover the full height and the full width, plus the margins.",
      "The honest limitation of this tool on this task is that it cannot tell you whether you succeeded. It does not read codes, so it cannot verify that a code is gone. A phone camera can, in about three seconds. That is the check to run.",
    ],
  },
  faq: [
    {
      question: "Is blurring a QR code enough to stop it being scanned?",
      answer:
        "Frequently not. Scanners are built to tolerate degraded input, and a blur preserves the light-dark structure of the modules. Use a solid fill.",
    },
    {
      question: "I covered the middle of the code. Is it safe?",
      answer:
        "Probably not. Error correction lets a code survive damage to a meaningful fraction of its modules. Cover the whole symbol including the blank margin around it.",
    },
    {
      question: "Does the tool detect QR codes automatically?",
      answer:
        "No. A QR code is a graphic rather than text, so text recognition never sees it. Every code needs a box drawn by hand.",
    },
    {
      question: "How can I be sure the code is really gone?",
      answer:
        "Try to scan the exported PNG with a phone. If a scanner resolves it, the box was not wide enough. That is the only check that reflects what an attacker would do.",
    },
    {
      question: "What about barcodes on the same document?",
      answer:
        "Same treatment, but cover the full height as well as the full width. Linear scanners tolerate partial height, so a barcode with its top covered can still read.",
    },
  ],
  pillarLink: {
    before:
      "A code is the one thing on a page that cannot be assessed by reading it, which makes it the easiest thing to forget. If you are working through a whole document rather than a single photo, you can",
    anchor: "redact image online",
    after:
      "using the same checklist that covers the codes along with everything printed beside them.",
  },
  related: ["redact-receipt", "redact-signature", "redact-screenshot"],
};

export const SIGNATURE: Scenario = {
  slug: "redact-signature",
  navLabel: "Signatures",
  h1: "Remove a Signature From an Image",
  title: "Remove a Signature",
  description:
    "Cover a handwritten signature, initials, or a stamp in a document image. Solid fill removes the pixels and the PNG is re-encoded. No upload.",
  lede:
    "A signature is not identification. It is a mark that authorizes something, and a clean copy of one is reusable. That is why a signature appearing in a shared document matters more than its visual weight suggests.",
  risk: {
    heading: "A signature is a reusable authorization",
    body: [
      "Most of what people redact from a document is information: a number, a name, an address. A signature is different in kind. It is a mark whose entire purpose is to bind a person to a document, and an image of one can be lifted, placed on a different document, and used to make that document look authorized.",
      "The practical risk is not forgery by a skilled hand. It is copy and paste. A signature cropped from a published contract is a transparent PNG away from appearing on an invoice, a letter, or a consent form. The person whose signature it is may never know until the document is acted on.",
      "Initials compound the problem because they are small, numerous, and treated as decoration. A contract may carry initials in the footer of every page. Each one is a smaller, simpler mark — and simpler marks are easier to reproduce and harder to notice.",
      "There is also a class of signature that people forget is a signature: the digital one. A scanned stamp, a company seal, a physician's signature block on a prescription, a notary's stamp with a commission number. Each carries the same authorizing function and each is equally reusable.",
    ],
  },
  fields: {
    heading: "Every mark that authorizes something",
    intro:
      "Signatures are not confined to the signature line. Check all of these before considering a document clear.",
    rows: [
      {
        label: "The handwritten signature itself",
        detail:
          "On the signature line, and again wherever a clause requires a separate signature. Multi-party documents have several.",
      },
      {
        label: "Initials on every page",
        detail:
          "Common in contracts and initialled amendments. Usually in a footer or a margin, small enough to read as a page decoration.",
      },
      {
        label: "Company stamps and seals",
        detail:
          "A round or rectangular stamp carries the legal entity name and sometimes a registration number. It functions as an organizational signature.",
      },
      {
        label: "Notary stamps and commission details",
        detail:
          "Include the notary's name, commission number, and expiry. These belong to a third party who did not agree to be published.",
      },
      {
        label: "Physician and clinician signatures",
        detail:
          "On prescriptions, referrals, and certificates. Often accompanied by a licence number, which is itself an identifier.",
      },
      {
        label: "Signatures embedded in a letterhead",
        detail:
          "Some organizations print a facsimile signature in the letterhead itself, which means it appears on every page rather than only the last.",
      },
      {
        label: "Wet-ink signatures photographed on paper",
        detail:
          "A photo of a signed page carries the signature plus the pressure marks, the paper texture, and sometimes a shadow that reveals the pen stroke.",
      },
      {
        label: "Digital signature images in a PDF",
        detail:
          "An inserted signature image sits in the content stream. Covering it with a shape does not remove it from the file.",
      },
    ],
  },
  auto: {
    heading: "Signatures are invisible to pattern matching",
    intro:
      "This is the simplest limitation on the site and the one most worth repeating: a signature is an image of handwriting, and this tool matches text patterns.",
    detects: [
      "Email addresses printed near the signature block",
      "Phone numbers in the contact block under a signature",
      "Card numbers, when a signed payment authorization is included",
      "Social Security numbers in the separated form, on some signed forms",
    ],
    misses: [
      "The signature itself, in every case. Handwriting is not reliably recognized as text, and a signature is not a text pattern.",
      "Initials.",
      "Company stamps and seals.",
      "Notary stamps and commission numbers.",
      "Physician signatures and licence numbers.",
      "Anything printed in a script or calligraphic typeface intended to look like handwriting.",
    ],
  },
  steps: {
    heading: "Removing a signature without leaving a trace",
    intro:
      "The steps are short because there is no detection to lean on. Every mark is placed by hand.",
    items: [
      {
        title: "Rasterize the document",
        body: "If it is a PDF, convert the page to an image first. A signature inside a PDF is an object in the content stream, and a shape drawn over it does not remove it.",
      },
      {
        title: "Find the signature, then find it again",
        body: "Check the signature block, then check the footer of every page for initials, then check the letterhead. Facsimile signatures in letterheads are the most commonly missed.",
      },
      {
        title: "Box the whole mark with margin",
        body: "Signatures usually have a descender or a flourish that extends beyond where the eye stops. Give the box a wide margin on all sides.",
      },
      {
        title: "Cover stamps as complete shapes",
        body: "A round stamp needs a box that contains the entire circle, not a box over the text inside it. Partial stamps are still recognizable and still carry information.",
      },
      {
        title: "Cover the licence or commission number too",
        body: "These numbers sit next to a professional signature and identify the person independently of the mark.",
      },
      {
        title: "Export and inspect the whole page",
        body: "Open the PNG and look at it as a page rather than at the signature area. Initials in footers and a facsimile in the letterhead only become obvious when you view the whole thing.",
      },
    ],
  },
  detail: {
    heading: "Why covering a signature in a PDF does not work",
    body: [
      "There are two ways a signature ends up in a PDF, and neither is removed by drawing over it.",
      "The first is an inserted image. The signature is a raster object placed in the content stream with a position and a size. Drawing a black rectangle on top adds another object; the signature object is still there, still extractable, still croppable out of the file by anyone who opens it in a tool that lists the images.",
      "The second is a scanned page. Here the whole page is one image, so a black rectangle on top is also a separate object — the signature pixels are underneath it in the same image, and a tool that examines the image data rather than the rendered view will find them.",
      "Rasterizing the page and then redacting the resulting image changes the situation, because the redaction is now applied to the pixels that will be exported. A solid fill writes a constant color over the region, and the signature data is not preserved anywhere in the output.",
      "There is one case where rasterizing is not enough: a photographed signature. If you photograph a signed page, the signature is already pixels, and a solid box over it works. But the photograph also carries the paper texture, the pressure marks, and any shadow cast by the pen, and those can reveal the shape of a stroke even when the ink is covered. For a document where the signature's shape matters, a slightly oversized box and a check at full zoom is the right minimum.",
    ],
  },
  faq: [
    {
      question: "Does the tool find signatures automatically?",
      answer:
        "No. A signature is an image of handwriting, not a text pattern. Every signature, initial, and stamp needs a box drawn by hand.",
    },
    {
      question: "Can I just put a black box over a signature in a PDF?",
      answer:
        "Not if you need it gone. The signature object remains in the file and can be extracted. Convert the page to an image and redact the image.",
    },
    {
      question: "Do I need to cover initials as well as the main signature?",
      answer:
        "Yes. Initials authorize pages the same way a full signature authorizes the document, and they are small enough that they are routinely missed.",
    },
    {
      question: "What about a company stamp or a notary seal?",
      answer:
        "Cover the entire shape including its outline. A partially covered stamp is still recognizable and still carries the entity name and often a registration or commission number.",
    },
    {
      question: "Is anything uploaded while I do this?",
      answer:
        "No. The image is decoded in the browser tab, the boxes live in memory, and the download is created locally. Reloading the page discards everything.",
    },
  ],
  pillarLink: {
    before:
      "A signature is a small mark with an outsized consequence, and it is the clearest example of why an overlay is not a redaction. You can",
    anchor: "redact image online",
    after:
      "with a replacement fill rather than a shape on top, which is the difference that actually removes it.",
  },
  related: ["redact-contract", "redact-medical-record", "redact-qr-code"],
};
