import type { Scenario } from "@/lib/content/types";

/**
 * The non-English document page.
 *
 * This is the page the multilingual work earns. It is deliberately not written as
 * a capability list: the interesting and useful fact about language support is
 * where it quietly fails, and both of the failure cases below were observed
 * rather than imagined — Japanese labels read through the Simplified Chinese
 * model come back in simplified form, and digits written in non-ASCII numeral
 * systems have to be folded before any number rule can see them.
 */
export const FOREIGN_LANGUAGE_DOCUMENT: Scenario = {
  slug: "redact-foreign-language-document",
  published: "2026-10-29",
  updated: "2026-10-29",
  navLabel: "Non-English documents",
  h1: "Redact a Document That Is Not in English",
  title: "Redact a Non-English Document",
  description:
    "Cover names, numbers and account details on a receipt, statement or invoice written in Spanish, German, Arabic, Chinese, Japanese or eight other languages.",
  lede:
    "Most redaction tools stop at the Latin alphabet, and most privacy advice stops at US document formats. The screenshot you actually need to clean is a Chinese payment receipt, a German invoice with an IBAN, or a Japanese delivery note — and the reason those are hard is not the drawing of boxes, it is that automatic detection was written for the other language.",
  risk: {
    heading: "Why non-English documents get shared unredacted",
    body: [
      "The tooling assumes an American document. Email, US phone number, Social Security number, card number, IP address: those are the patterns most detectors implement, because that is what their authors' users screenshot. Hand the same detector a bill where the phone number is grouped 090-1234-5678 or where the account identifier is a 24-character IBAN and it returns nothing, which is worse than returning something wrong — an empty result looks like a clean document.",
      "There is a second failure specific to non-Latin scripts. Optical recognition of Han, Kana and Hangul text does not return words the way it does in English. The engine emits one character or small cluster at a time, so 電話番号 arrives as four separate pieces with spaces between them. Anything matched as a phrase misses unless the spaces are put back, which is why a tool that works perfectly on an English PDF can find nothing on a Chinese one with identical content.",
      "The third is numerals. Arabic-language documents frequently use the Eastern Arabic digit forms, Persian printing adds its own variants, and South Asian scripts bring ten more sets. Those look like numbers to a person and like unknown characters to a matcher, so a card number printed in Arabic-Indic digits is not a card number as far as most detectors are concerned.",
    ],
  },
  fields: {
    heading: "What to cover on a foreign-language document",
    intro:
      "The field names differ; what identifies a person does not. These are the values to look for on documents written in languages other than English.",
    rows: [
      {
        label: "The account identifier",
        detail:
          "IBAN in Europe and the Gulf, a sort code and account number in the UK, an IFSC and account number in India, a bank account line on a Chinese or Japanese receipt. It is the field that ties the document to one person at a bank.",
      },
      {
        label: "The national identity number",
        detail:
          "Not everyone has a Social Security number. China has the 18-digit resident ID, India the Aadhaar and PAN, most of continental Europe a tax or identity number, Japan a My Number. These are as damaging as an SSN and are printed on ordinary paperwork.",
      },
      {
        label: "Mobile numbers in local grouping",
        detail:
          "090-1234-5678 in Japan, 0xx xxx xxxx in China, +49 and no separators in Germany, mobile numbers written with an international prefix on receipts across the Gulf.",
      },
      {
        label: "The name, in its own script",
        detail:
          "Where the name field is a contact name, a payee, a policyholder, or the person the delivery is addressed to. Transliteration is not an option in an image; the glyphs are the leak.",
      },
      {
        label: "Address lines and postal codes",
        detail:
          "Japanese addresses start at the prefecture and get more specific, which means the identifying part is at the beginning of the line. European addresses put the postal code before the city, and the code alone narrows a search area.",
      },
      {
        label: "The document number that identifies you to an institution",
        detail:
          "Contract references, tax assessment numbers, insurance policy numbers, order identifiers that resolve to a customer account when typed into the issuer's own website.",
      },
    ],
  },
  auto: {
    heading: "What it recognises across languages, and what still needs a hand-drawn box",
    intro:
      "Two things have to go right for auto-detect to help you on a foreign document: the text has to be read, and the read text has to match a rule. Reading is the part you choose — you pick which languages are loaded, because recognition models are a download. The rules are the part that is already language-independent, and they do most of the work.",
    detects: [
      "Email addresses, IPv4 addresses and API keys, which look the same in every language.",
      "Card numbers that pass a Luhn check and IBANs that pass their ISO 7064 mod-97 checksum, in either the compact or the four-character-grouped print form.",
      "Mainland China mobile numbers and 18-digit resident ID numbers, validated against the ID's own check digit and date of birth.",
      "US phone numbers and Social Security numbers.",
      "The value after a printed field name, in twelve languages: 390 terms including Teléfono, Telefonnummer, Téléphone, رقم الجوال, 电话号码, 電話番号, 카드번호 and their equivalents. This is the rule that works on a document whose numbering plan nobody wrote a pattern for — the word for Phone is stable even when the number is not.",
      "Digits written in fifteen non-ASCII numeral systems — Arabic-Indic, Persian, the Devanagari and South Asian sets, Thai, Lao, Myanmar, Khmer and fullwidth forms — folded to ASCII before the rules run, so a card number printed in Eastern Arabic digits is still recognised as a card number.",
      "Text lines in twelve languages for tap-to-cover: after a scan, one tap covers the whole line, and it does not care what language the line is in.",
    ],
    misses: [
      "Languages with no model loaded. Twelve languages are available and a maximum of four are used at once, because the engine merges the selected models and each extra language costs accuracy as well as download. If you redact documents in Thai, Vietnamese, Polish or Hindi, none of that is on by default and you have to tick the box; there is no model for Thai or Vietnamese at all in the current selection.",
      "Japanese text read through the Simplified Chinese model. It is the nearest thing available and it half works: on a test invoice the label 電話番号 came back as the simplified form 电话 番号, which still matches some rules and silently misses others. The fix is to load Japanese, which took the same document from three detected fields to seven.",
      "Names, addresses and free-text descriptions in any language. There is no language model for what counts as a person's name in running prose, so those need a tap or a drawn box.",
      "Small print, low-contrast coloured backgrounds, handwriting and photographed paper, where recognition returns letters instead of digits regardless of language.",
      "Anything below the part of the screenshot you were looking at when you ran the scan.",
    ],
  },
  steps: {
    heading: "Redacting a foreign-language document",
    intro:
      "The extra step compared with an English document is the one nobody remembers: choosing which languages to load before scanning.",
    items: [
      {
        title: "Load the image",
        body: "Drop it in or tap to choose. PNG, JPEG and WebP up to 25 MB, decoded in the tab.",
      },
      {
        title: "Open Languages and tick the ones on the document",
        body: "Up to four. Each shows the download size before you commit to it. Keep English loaded — it is what reads the digits and any Latin fragments, and it is the fallback for a script the other models handle poorly.",
      },
      {
        title: "Run auto-detect",
        body: "Recognition runs on your device and returns one reviewable box per match. The first scan of a session downloads the models, so do it on Wi-Fi if the connection is metered.",
      },
      {
        title: "Read the type chips before trusting the count",
        body: "If a field-name category you expected is missing from the list, the language was probably wrong rather than the document clean. That is the failure to watch for: an empty result is not the same as a safe image.",
      },
      {
        title: "Tap every line that should be covered",
        body: "After a scan, a tap covers the whole line under your finger. This works in any script the recognition read, which makes it the reliable path on documents the rules were not written for.",
      },
      {
        title: "Draw boxes over anything left",
        body: "Faces, stamps, handwriting, the name in the letterhead. Switch to Draw boxes first if you are on a phone.",
      },
      {
        title: "Check at full resolution, then export",
        body: "Zoom to 100 percent on every covered region. Non-Latin glyphs are denser than Latin ones, and a box that looks generous at fit size can be clipping the tails of a Chinese or Japanese character.",
      },
    ],
  },
  detail: {
    heading: "Why a word list and not more language models",
    body: [
      "The obvious way to support more languages is to load more recognition models. That is real but expensive: each model is one to three megabytes that a visitor's browser has to fetch, and the engine merges the selected models into one recogniser, so past about four the extra languages start costing accuracy on the ones that already worked. A tool that quietly reads your German invoice worse because it loaded four languages you did not ask for has made the wrong trade.",
      "A list of field names costs nothing to ship, works on any document the text can be read from, and covers ground no number pattern reaches. The word for phone number on a form is short, stable and the same across every document a given institution produces; the number after it follows a national convention that would take a rule per country to match. Anchor on the word and the value falls out.",
      "The two halves only work together if the offsets survive. Recognition of Han, Kana and Hangul text returns characters separated by spaces, and non-ASCII digits have to be rewritten as ASCII ones to be matched. Rewriting and rejoining both change the text, so every character maps back to its original position — which is the unglamorous plumbing that makes a Spanish phone number and a Chinese one land the box in the same place.",
      "The honest summary: this handles documents in twelve languages reasonably, a wider set of numbering conventions than most tools, and nothing at all in a language whose model you did not load. The visible language list is there so that last sentence is your decision rather than a surprise.",
    ],
  },
  faq: [
    {
      question: "Can I redact a Chinese or Japanese document?",
      answer:
        "Yes. Simplified Chinese and Japanese models are both available, 390 field-name terms across twelve languages drive the labelled-field rule, and Chinese mobile numbers and resident ID numbers have their own validated patterns. Japanese is not in the default set — tick it for a Japanese document, which on a test invoice took the result from three detected fields to seven.",
    },
    {
      question: "Does it work on Arabic text and Arabic numerals?",
      answer:
        "The Arabic model is selectable and the labelled-field rules include Arabic field names. Digits printed in Arabic-Indic or Persian forms are folded to ASCII before matching, so a number printed as ٤١٥١٢٣ is seen as 415123. Writing direction does not change which pixels are yours to cover.",
    },
    {
      question: "Which languages are supported?",
      answer:
        "Twelve for recognition: English, Spanish, French, German, Portuguese, Italian, Russian, Turkish, Arabic, Simplified Chinese, Japanese, Korean. A maximum of four can be loaded at once, because merging more models degrades accuracy. Languages outside that list still get the format rules — email, cards, IBANs, IP addresses — wherever the text can be read.",
    },
    {
      question: "Why did auto-detect find nothing on a foreign document?",
      answer:
        "Almost always the language selection rather than the document. Check the language list first, then read the document at full size and tap the lines yourself. A zero result on a document you know contains an account number is a signal to look harder, not a clean bill of health.",
    },
    {
      question: "Is the document uploaded somewhere to be translated or read?",
      answer:
        "No. Recognition models are downloaded to your browser and the reading happens there. There is no translation feature, and nothing needs a server for any of this to work.",
    },
    {
      question: "Should I use a fill or a mosaic on small non-Latin text?",
      answer:
        "A fill. Dense glyphs carry far more information per pixel than Latin letters, so the block size needed to make a Chinese or Japanese character unrecoverable is coarser than the one that works on English, and a fill does not require you to pick it correctly.",
    },
  ],
  pillarLink: {
    before:
      "The recognition models and the field-name vocabulary both ship from this site rather than a third-party content delivery network, so you can",
    anchor: "redact image online",
    after: "on a document in another language without its text, or its image, leaving the device.",
  },
  related: [
    "redact-bank-statement",
    "redact-receipt",
    "redact-on-phone",
  ],
};
