import type { Guide } from "@/lib/content/types";

export const REDACT_VS_BLUR: Guide = {
  slug: "redact-vs-blur",
  published: "2026-10-25",
  updated: "2026-10-27",
  navLabel: "Redact vs blur",
  h1: "Redaction vs Blur: Which One Actually Removes the Information",
  title: "Redaction vs Blur",
  description:
    "A blur degrades pixels; redaction replaces them. This explains when each fails, why short strings survive blurring, and how overlay-based redaction leaks.",
  lede:
    "The two terms are used interchangeably in most tool interfaces, which is exactly why redacted documents keep leaking. They are not the same operation and they do not produce the same file.",
  sections: [
    {
      heading: "The difference is in what gets written to the file",
      body: [
        "A blur is a filter. For each pixel it computes a weighted average of its neighbors and writes the averaged value. The result is a new image in which the original high-frequency detail has been reduced. Information is degraded, not deleted. Where the original detail was large relative to the filter radius, the degraded result still carries a recognizable shape.",
        "A solid fill is a replacement. The pixels inside the region are assigned a single color value. In the written file there is no averaged remnant of the original — there is a constant. Nothing about the glyph shape, the character count, or the spacing survives, because none of those values were written.",
        "Overlay is a third thing, and it is the one that causes the most embarrassing incidents. Drawing a black rectangle on top of an image without flattening produces a file that contains both the rectangle and the content underneath. Presentation slides, design files, and PDFs all behave this way by default. The redaction looks correct on screen and is empty when anyone looks one layer down.",
      ],
    },
    {
      heading: "Why short strings survive blurring",
      body: [
        "Blur is most effective when the region contains a lot of detail at a scale much smaller than the filter radius — a dense texture, a face at distance, a page of body text. Averaging destroys that kind of detail reliably.",
        "The failure case is a small number of large characters. A nine-digit Social Security number or a four-digit card tail in a screenshot occupies few pixels per character but each character has strong strokes. Averaging across a stroke produces a gradient at exactly the places where the glyph differs from its neighbors. At sufficient zoom, or with a deconvolution step, the character is often recoverable.",
        "There is a second, cheaper attack that does not need deconvolution. If the attacker knows the field type, they can enumerate candidates and compare. A Social Security number has a restricted format; a card number has a checksum. A candidate set of a few thousand possibilities against a degraded image is a tractable problem in a way that recovering an arbitrary sentence is not.",
      ],
    },
    {
      heading: "When a blur is the right choice",
      body: [
        "A blur is defensible when the information underneath is not the thing you are protecting. Blurring a background to make a subject stand out is a composition decision. Blurring a face in a crowd photograph is a reasonable trade-off between privacy and legibility, and it is also a case where a human face has enough redundancy that a low-information blur is genuinely hard to reverse.",
        "A blur is not defensible for credentials, identifiers, names, addresses, or any text a person would be harmed by having read. That includes things that feel minor: an order number that unlocks an account lookup, a workspace name that identifies an employer, a username that links to a public profile.",
        "The working rule is simple. If the region contains a value from which someone can do something — log in, verify, look up, impersonate — use a fill. If the region contains context whose exact form does not matter, a blur is fine.",
      ],
    },
    {
      heading: "Pixelation is a blur with a different kernel",
      body: [
        "Pixelation downsamples the region into blocks and paints each block with a single color. It feels more thorough than a blur because the result looks blockier, but the mechanism is the same category: it averages and writes the average. The block grid is a deterministic function of the block size, which means the averaging can be inverted if the block size is known or can be estimated.",
        "Pixelation has one genuine advantage: it clearly communicates that something was intentionally removed, which matters when a document needs to look processed. It has one genuine disadvantage that is worse than a blur in some cases: the block grid lines up with the character pitch in ways that can preserve spacing information.",
        "This tool offers pixelate because some layouts need the surrounding text to remain legible, and it paints an opaque base underneath the mosaic so nothing shows through. But the mosaic itself is built from original pixels at reduced resolution, and the interface says so. For short strings, solid fill is the safer choice.",
      ],
    },
    {
      heading: "How to tell what a file actually contains",
      body: [
        "Open the exported file, not the editor. The editor shows boxes composited over an image in memory; the file is what a recipient receives. Zoom to actual size and look at the edge of each covered region — a one-pixel sliver of a character is the most common real-world failure.",
        "For a PDF, try selecting the text under the black box. If it is selectable, the redaction did not happen. The reliable fix is to rasterize the page to an image and redact the image, because an image has no text layer to leave behind.",
        "For a JPEG, be aware that the format is lossy and that re-encoding can reintroduce artifacts around an edited region. PNG, which this tool exports, is lossless, so what you see in the editor is what gets written.",
      ],
    },
  ],
  faq: [
    {
      question: "Is a strong blur ever as safe as a solid fill?",
      answer:
        "For arbitrary detail at small scale, a strong blur can be hard to reverse. For short strings of characters, no. The character set is small enough that degraded shapes remain distinguishable, and checksums or format rules narrow the candidate space further.",
    },
    {
      question: "Why is a black rectangle in a PDF not a redaction?",
      answer:
        "Because the PDF still contains the text layer underneath the rectangle. Drawing an object on top does not remove the content below it. Selecting the area or extracting text will reveal the original.",
    },
    {
      question: "Does pixelation count as irreversible?",
      answer:
        "Less so than a solid fill. Pixelation averages original pixels into blocks; if the block size is known, the averaging can be partially inverted. It is significantly harder to reverse than a Gaussian blur, but it is not removal.",
    },
    {
      question: "Which style does this tool default to, and why?",
      answer:
        "Solid black. It replaces pixels rather than degrading them, it is unambiguous to a reader, and it survives compression and re-encoding without becoming less opaque.",
    },
  ],
  related: ["is-blur-safe", "remove-exif", "what-does-redact-mean", "can-blurred-text-be-recovered"],
  relatedScenarios: ["redact-screenshot", "redact-ssn"],
  pillarLink: {
    before:
      "Once you have decided that a fill is the right operation for your file, the tool itself needs no setup. You can",
    anchor: "redact image online",
    after:
      "in any browser, choose the style per box, and check the export at full zoom before sending it.",
  },
};

export const IS_BLUR_SAFE: Guide = {
  slug: "is-blur-safe",
  published: "2026-10-25",
  updated: "2026-10-27",
  navLabel: "Is blurring safe",
  h1: "Is Blurring Text in a Screenshot Actually Safe?",
  title: "Is Blurring Text Safe?",
  description:
    "Blurring a screenshot usually leaves readable structure. This explains what survives a blur, which attacks work, and which fields should never be blurred.",
  lede:
    "Short answer: for credentials and identifiers, no. For backgrounds and crowds, often yes. The difference is not the strength of the blur, it is what is underneath it.",
  sections: [
    {
      heading: "What a blur leaves behind",
      body: [
        "A Gaussian blur replaces each pixel with a weighted average of its neighborhood. The weights are highest at the center and fall off with distance. Two things follow from that: the result preserves local brightness, and it preserves the boundary between light and dark regions at a scale larger than the radius.",
        "For a character with strong vertical strokes — a 1, a 7, an I, an l — the light-dark boundary is exactly what the blur preserves. Increasing the radius widens the transition but does not eliminate the position of the edge. At sufficient zoom the strokes remain locatable, and the relative positions of strokes are most of what distinguishes one character from another.",
      ],
    },
    {
      heading: "Why the field type matters more than the blur strength",
      body: [
        "Recovering an arbitrary sentence from a blurred image is hard, because the space of possible sentences is unbounded. Recovering a structured value is a different problem, because the space of possible values is small and constrained.",
        "A Social Security number has a fixed shape and a restricted range in each group. A card number has a checksum: for any fifteen digits there is exactly one valid sixteenth. A phone number has a known number of digits and a valid area-code list. In each case, a partially readable blur narrows the candidate set from millions to something a script can enumerate in seconds.",
        "That is the argument against blurring credentials specifically. The blur does not need to be fully reversed; it only needs to leak enough to prune. A degraded image of a random phrase is a puzzle with no answer key. A degraded image of a checksummed number is a puzzle with a verifier built in.",
      ],
    },
    {
      heading: "The cases where blurring is reasonable",
      body: [
        "Faces in a crowd, backgrounds behind a subject, license plates on a distant vehicle, and screen content behind a speaker are all reasonable blur targets. In each case the information is not a value someone can act on directly, and the visual redundancy is high enough that a partial reconstruction does not resolve to a specific identity or credential.",
        "Even here, the standard is not 'blurred therefore safe'. It is 'the residual information does not enable an action I would object to'. A face blurred with a two-pixel radius in a high-resolution photo is not meaningfully anonymized; the same face at low resolution with a large radius is.",
      ],
    },
    {
      heading: "What to do instead",
      body: [
        "Use a solid fill for anything a person could act on: names, addresses, account numbers, card digits, identifiers, email addresses, phone numbers, tokens, and keys. A fill is not a stronger blur; it is a different operation that removes the pixels instead of averaging them.",
        "If the concern is that a solid block looks visually intrusive, the alternative is a fill in a color that matches the surrounding background. It reads as a design element and still removes the content. What is not an alternative is reducing the blur radius until the block looks less obvious — the block's visibility is the point.",
        "Finally, verify in the exported file rather than the editor. Compositing in a live editor can differ from what a flattened export produces, particularly around antialiased edges.",
      ],
    },
  ],
  faq: [
    {
      question: "Can blurred text be unblurred with AI tools?",
      answer:
        "For text at small scale with a known font, tools that fit character models to degraded shapes can recover a surprising amount. For checksummed values, enumeration against the degraded image is often enough without any model at all.",
    },
    {
      question: "Is a heavy mosaic safer than a light blur?",
      answer:
        "Usually, because large blocks discard more local detail. It is still an averaging operation with a recoverable grid, so it is weaker than a solid fill for short strings.",
    },
    {
      question: "Does zooming out make a blur safe?",
      answer:
        "No. Downscaling reduces the pixels available to a reader of the thumbnail, but the original resolution is what is in the file. Anyone can zoom in on the file you sent.",
    },
    {
      question: "What about a blur applied in a screenshot tool before saving?",
      answer:
        "That is a real filter applied to real pixels, so it is the same analysis. It is better than an overlay, and weaker than a fill for credentials. How much weaker is measured rather than argued on the recovery experiment page: a radius-2 blur over 26-pixel text gave back seven of eight strings intact, and still seven of eight after a chat app re-encoded it.",
    },
  ],
  related: ["redact-vs-blur", "remove-exif", "what-does-redact-mean", "can-blurred-text-be-recovered"],
  relatedScenarios: ["redact-screenshot", "redact-card-number"],
  pillarLink: {
    before:
      "Replacing the pixels instead of smearing them is one click in this tool — boxes default to solid black and the export flattens them into the file. That is the safest way to",
    anchor: "redact image online",
    after:
      "for anything a person could act on: numbers, names, tokens, and addresses.",
  },
};

export const REMOVE_EXIF: Guide = {
  slug: "remove-exif",
  published: "2026-10-25",
  updated: "2026-10-27",
  navLabel: "Strip EXIF data",
  h1: "Remove EXIF and GPS Data by Re-Encoding the Image",
  title: "Remove EXIF From an Image",
  description:
    "EXIF carries camera model, timestamps, and GPS coordinates. Re-encoding an image from a canvas drops it, and this explains why rebuilding works.",
  lede:
    "You can hide a face in a photo and still publish the coordinates where it was taken. EXIF is the part of the file nobody looks at, and it is often the most specific information in it.",
  sections: [
    {
      heading: "What is actually stored in the file",
      body: [
        "A JPEG is a container. Alongside the compressed image data it holds a set of metadata segments, and EXIF is the largest of them. A typical phone photo records the camera make and model, the lens, the exposure settings, the orientation, the timestamp with sub-second precision, the software used to edit it, and — when location services were on — the GPS latitude, longitude, altitude, and a timestamp for the fix.",
        "Some cameras and phones also write a thumbnail into the EXIF block. That thumbnail is a separate, unedited copy of the image. A photo that has been cropped to remove something at the edge can still carry a thumbnail of the uncropped original.",
        "PNG has its own metadata chunks, and the same category of data can appear there. Screenshots usually carry much less than camera photos, but they are not guaranteed to carry nothing.",
      ],
    },
    {
      heading: "Why re-encoding removes it",
      body: [
        "Metadata lives in the container, not in the pixel data. When you draw an image onto a canvas and export it, the browser reads the decoded pixels and writes a new file from those pixels. The original container is not copied or consulted. There is no step in that path where EXIF could be carried across, because the code that writes the new file never sees the old metadata.",
        "This is why the operation is reliable rather than best-effort. It is not a metadata-stripping filter that has to know about every possible tag; it is a rebuild that starts from pixels alone.",
        "The same mechanism explains a second effect: a newly encoded file is also a newly compressed file. For JPEG, that means a generation of quality loss. For PNG, which is lossless, it means no loss but often a larger file.",
      ],
    },
    {
      heading: "The thumbnail problem, and why cropping does not fix it",
      body: [
        "Cropping is a common way to remove something from the edge of a photo. It changes the pixel data and leaves the container intact, which means the embedded thumbnail and the GPS block are still there, describing the uncropped original.",
        "This is a genuinely counterintuitive failure: the visible image is clean and the file is not. It is also invisible to any review that looks at the picture rather than the metadata.",
        "Rebuilding from a canvas avoids it, because the thumbnail is metadata. There is no thumbnail in a file that was encoded from pixel data by a browser.",
      ],
    },
    {
      heading: "How to check a file yourself",
      body: [
        "On a desktop, `exiftool` prints every metadata field a file contains, including GPS and the embedded thumbnail. It is the most direct check and it is free.",
        "Without command-line tools, most operating systems will show a subset in the file's properties or Get Info dialog — usually camera and date, sometimes location. Look for a 'location' or 'GPS' line specifically.",
        "A quick structural test: if a JPEG's file size barely changes after an edit that should have altered a large region, the edit may have been applied as a layer rather than baked into the pixels. A rebuilt file usually changes size noticeably, because it was recompressed from scratch.",
      ],
    },
  ],
  faq: [
    {
      question: "Does this tool remove EXIF?",
      answer:
        "The export is drawn on a fresh canvas and encoded from pixel data, so the source file's metadata container is not carried across. That is a structural consequence of rebuilding the image rather than editing it in place.",
    },
    {
      question: "Does cropping a photo remove GPS data?",
      answer:
        "No. Cropping changes pixels and leaves the container, including the GPS block and the embedded thumbnail, intact.",
    },
    {
      question: "Is metadata removal enough to anonymize a photo?",
      answer:
        "No. Visual content, reflections, identifiable objects, and background details all identify a place independently. Metadata removal closes one specific channel.",
    },
    {
      question: "Does re-encoding reduce image quality?",
      answer:
        "For a PNG export from a canvas, the re-encode is lossless. The image has already been decoded once, which for a JPEG source means the decoded pixels are what you get, and re-encoding as PNG does not add further loss.",
    },
    {
      question: "What about the screenshot itself?",
      answer:
        "Screenshots generally carry far less metadata than camera photos, but the same rebuild applies. If the source had any container metadata, it does not survive a canvas re-encode.",
    },
  ],
  related: ["redact-vs-blur", "is-blur-safe", "what-does-redact-mean"],
  relatedScenarios: ["redact-screenshot", "redact-receipt"],
  pillarLink: {
    before:
      "Drawing a box and exporting through this page rebuilds the file from pixels, so the old container never comes along. It is the same rebuild step that lets you",
    anchor: "redact image online",
    after:
      "and drop the metadata in the same download, without opening a dedicated EXIF tool.",
  },
};

export const WHAT_DOES_REDACT_MEAN: Guide = {
  slug: "what-does-redact-mean",
  published: "2026-10-25",
  updated: "2026-10-27",
  navLabel: "What redact means",
  h1: "What Does Redact Mean?",
  title: "What Does Redact Mean?",
  description:
    "Redaction means removing content from a document before release, not covering it. The legal origin, how it differs from censoring, and why overlays fail.",
  lede:
    "The word comes from editing, not from secrecy. To redact a document is to prepare it for release by removing the parts that should not be published — and the operative word is remove.",
  sections: [
    {
      heading: "The origin is editorial, not adversarial",
      body: [
        "Redaction began as an editorial task: selecting and arranging material for publication. The modern usage narrowed to the removal step, and it entered legal and governmental vocabulary because institutions needed a formal term for releasing a document with specific parts withheld.",
        "That origin explains a distinction that still matters. Redaction is not the same as censorship. Censorship suppresses material that would otherwise be published in full. Redaction withholds a subset of a document that is otherwise released. In practice the line is blurry, but the technical meaning is narrower: the released artifact is the original minus the removed parts.",
        "The word is also used loosely in everyday speech. 'Redacted' on a social media post often means 'covered with a black bar', which may or may not be true removal. That looseness is the source of most of the confusion this page exists to clear up.",
      ],
    },
    {
      heading: "In law and government, removal has to be real",
      body: [
        "When a court or an agency releases a redacted document, the requirement is that the withheld content cannot be recovered from the released copy. Applying a black rectangle over text in a PDF does not satisfy that requirement, because the text layer remains and can be extracted. There is a documented history of exactly this failure in filings and freedom-of-information releases.",
        "The technical standard that follows is the one worth borrowing for personal use: the released file must not contain the removed content in any recoverable form. Not in a layer, not in a text run, not in an embedded thumbnail, not in a revision history.",
        "This is why 'flatten and re-encode' is the phrase that shows up in document-handling guidance. Flattening collapses layers into pixels; re-encoding writes a new file from those pixels. Both steps are load-bearing.",
      ],
    },
    {
      heading: "What redaction is not",
      body: [
        "It is not blurring, which degrades rather than removes. It is not pixelation, which averages. It is not covering with a shape, which leaves everything underneath. It is not cropping, which changes the frame but leaves the container and any embedded copies.",
        "It is also not anonymization in the formal sense. Anonymization means the data can no longer be linked to an individual by any means. Redaction removes specific fields. A photo with the face and the EXIF location removed can still identify a place through background details, and a screenshot with names covered can still identify a company through the interface.",
        "Keeping that distinction clear is useful, because it prevents the common overconfidence after a successful redaction. Removing the field you were worried about is a good step. It is not a guarantee that the artifact is anonymous.",
      ],
    },
    {
      heading: "Doing it on an image",
      body: [
        "An image has no text layer, so the failure mode of overlay-based PDF redaction does not apply. What does apply is the choice of operation. Filling a region with an opaque color overwrites the pixels; blurring or pixelating transforms them and leaves a residual.",
        "A second consideration specific to images is the export path. If the editor composites boxes in memory and the export flattens that composite, the result is a clean file. If the editor exports the original plus a separate overlay object, the result is not. This tool draws everything into a single canvas and encodes that canvas, so there is no second object in the output.",
        "For documents that arrive as PDFs, rasterize first. Converting the page to an image and then redacting the image is the only route that reliably produces a released file without a readable text layer.",
      ],
    },
  ],
  faq: [
    {
      question: "Is redacting the same as censoring?",
      answer:
        "Not exactly. Censorship suppresses material that would otherwise be published; redaction removes a subset of a document that is otherwise released. The technical methods overlap, the intent differs.",
    },
    {
      question: "Does a black box count as redaction?",
      answer:
        "Only if it actually removes the content. A shape drawn over text in a layered file is not a redaction, because the text is still in the file.",
    },
    {
      question: "Is a redacted image anonymous?",
      answer:
        "Not necessarily. Redaction removes specific fields. Other details — objects, background, interface elements, writing style — can still identify a person or an organization.",
    },
    {
      question: "Why do people say a redacted PDF is not really redacted?",
      answer:
        "Because overlays are common and ineffective. The text layer survives, and extracting it reveals the content that appears to be hidden.",
    },
  ],
  related: ["redact-vs-blur", "remove-exif", "is-blur-safe"],
  relatedScenarios: ["redact-bank-statement", "redact-screenshot"],
  pillarLink: {
    before:
      "Knowing the definition does not do the work; an operation that overwrites pixels and re-encodes the file does. If you want to apply the real meaning of the word to a photo or screenshot,",
    anchor: "redact image online",
    after:
      "here — the box replaces what is underneath it, and the download is a freshly encoded PNG.",
  },
};
