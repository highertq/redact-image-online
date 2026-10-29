import type { Guide } from "@/lib/content/types";

/**
 * The recovery experiment: measured, not asserted.
 *
 * Every number below came out of `scripts/deblur-experiment.py`, which is in the
 * repository for the same reason the results are: a page that tells people to
 * trust its conclusion is worth less than a page that lets them check it. The
 * script renders strings, degrades them with each concealment method, runs one
 * shared attack pipeline over all of them, and scores the result. Re-running it
 * on another machine with the same font will move these figures around at the
 * margin; the ordering between methods is what the page argues from.
 *
 * Where the experiment does not settle a question, the copy says so.
 */
export const CAN_BLUR_BE_REVERSED: Guide = {
  slug: "can-blurred-text-be-recovered",
  published: "2026-10-29",
  updated: "2026-10-29",
  navLabel: "Can blur be reversed?",
  h1: "Can Blurred Text in an Image Be Recovered?",
  title: "Can Blurred Text Be Recovered?",
  description:
    "A measured test: light blur over 26px text was read back correctly 7 times out of 8. Solid fill and pixelation returned nothing.",
  lede:
    "People ask this because they have blurred something in a phone's markup tool and want to know if that was enough. The honest answer depends on a number nobody states — the radius of the blur relative to the height of the letters — so this page measures it: five concealment settings, one attack pipeline, and the exact strings that came back out.",
  sections: [
    {
      heading: "What was tested, and how",
      body: [
        "Eight strings of the kind that actually appears in screenshots — a Social Security number, a card number, a mobile number, an email address, a name, a street address, a PIN, an IBAN — were rendered with the same font at a fixed pixel height, then obscured five ways: a solid black fill, a solid white fill, pixelation at 4, 8 and 16-pixel blocks, and Gaussian blur at radii 1 to 8 pixels. Every obscured image then went through one shared attack: contrast stretch to full range, 4x bicubic upscale, unsharp mask, Richardson-Lucy deconvolution against a Gaussian point-spread function, then OCR in single-line mode. Each method was treated identically, so the comparison is between concealment methods and not between attack pipelines.",
        "A second attack ran alongside it: template matching, which renders every candidate character, degrades it the same way, and asks which glyph would look like this pixel patch afterwards. That is the attack that threatens small pixelation, and it assumes the attacker knows the font and the block size.",
        "Two things to keep in mind while reading the numbers. The samples are clean synthetic renders on a plain background, which is the easiest case for an attacker — real screenshots arrive with compression artifacts, subpixel rendering and coloured backgrounds. And OCR is one reader: a person willing to squint at an upscaled image can sometimes read what a machine cannot, and the reverse is also true.",
      ],
    },
    {
      heading: "The results: light blur is not concealment",
      figure: {
        src: "/experiments/blur-recovery-evidence.png",
        alt: "Five stacked crops of the same nine-digit string: rendered sharply, blurred at radius 2, the blurred crop after upscaling and Richardson-Lucy deconvolution, covered by a solid black fill, and pixelated at 4-pixel blocks.",
        caption:
          "The same Social Security number five ways. Row two is what a radius-2 blur looks like to a person; row three is the same crop after the attack pipeline, and it reads back the digits. Rows four and five are a solid fill and a 4-pixel mosaic, and neither gives the reader anything to work with.",
        width: 908,
        height: 448,
      },
      body: [
        "At a glyph height of about 26 pixels — roughly 11pt text in a phone screenshot at device scale — a Gaussian blur of radius 2 was read back correctly 7 times out of 8, with a character error rate of 0.03. That is not 'partially recovered'. That is the Social Security number, the card number and the email address coming back intact, in one pass, with software that fits in a laptop.",
        "Radius 1 was worse still: five of five strings recovered at every text height tested, including 14-pixel text. A blur so light it looks like a softening filter leaves the content completely readable to a machine.",
        "Radius 3 recovered one of eight at 26 pixels, radius 4 none, radius 8 none. So there is a threshold between 'not concealment' and 'not recoverable by this pipeline' — and it sits at a radius that is comparable to the height of the letters themselves. That is the number that matters, and it is why the size of the text is half the answer: the same radius 4 blur that fails at 26 pixels recovered three of five strings at 36 pixels and four of five at 48 pixels. Larger letters survive a fixed blur because more detail fits inside the surviving smudge.",
        "Solid fills recovered nothing at any size: zero of eight for black, zero of eight for white, character error rate around 0.96 to 0.99. What OCR reported on those images was noise on a blank rectangle — strings like 'Ete = = AF td' — which is the signature of a reader inventing text where none was written rather than of text being hard to read. The pixels inside a solid fill hold one constant value; there is no glyph left to invert.",
        "Pixelation at 4, 8 and 16 pixels recovered zero of eight through the OCR path at 26-pixel text. The template-matching attack also returned nothing — see the caveat below before treating that as a result.",
      ],
    },
    {
      heading: "The measurement that argues against pixelation, not for it",
      body: [
        "At 48-pixel text, pixelation with 4-pixel blocks was read back correctly two times out of five. That is the one result in this page that cuts against the tool's own options, and it is worth stating plainly rather than burying: pixelation is not uniformly strong. Its strength scales with the ratio of block size to letter height. Four-pixel blocks on a 48-pixel letter leaves 12 blocks across the height of a glyph, which is enough for a machine to pick out an 8 from a 3.",
        "The practical rule follows from the ratio, not the method: coarse blocks over small text are strong; fine blocks over large text are a soft blur with extra steps. If a document has big display type in it, a solid fill is the setting to use.",
        "The template-matching numbers should not be read as 'pixelation defeats template attacks'. The matcher implemented here segments the line by finding columns of dark pixels and compares a 48x48 thumbnail of each patch. On a pixelated image, adjacent blocks blur that segmentation, and it produced a character error rate near 0.94 on every method including the ones OCR could read — which tells you the matcher failed at the segmentation step, not that the pixelation held. Depixelisation is a real research area with stronger tools than the one written for this page. Treat the pixelation results as 'this attack pipeline did not break it' and use a solid fill when the value matters.",
      ],
    },
    {
      heading: "So what should someone actually do",
      body: [
        "For any value that must not survive — an identity number, a card, an account reference, a name — use a solid fill. It is the only setting tested that produced no partial information: no glyph shape, no stroke count, no character length. Everything else in the test leaked something, including pixelation at the wrong block size.",
        "If a blur or a light mosaic is already on the image and it is being shared, the answer from these numbers is that a motivated reader with a laptop can plausibly get the text back at the radii consumer tools default to. The fix is not a stronger blur, it is a fill.",
        "And cover a little wider than the value. The failure mode with a fill is not the algorithm, it is the box: the last digit left outside the edge of the rectangle is a perfectly readable last digit, and at the size a phone screenshot is normally viewed, that edge is hard to see.",
      ],
    },
    {
      heading: "Reproduce it yourself",
      body: [
        "The script is short and has no unusual dependencies: `python scripts/deblur-experiment.py`. It needs OpenCV, Pillow and a tesseract binary on the PATH. It writes a table to the console plus results.json and size-sweep.json in a temporary directory, along with the covered crops it tested, so you can point the tools at your own images and your own font instead.",
        "Changing the glyph heights, the font or the strings is the point. A test that only proves something about a synthetic 26-pixel Arial line is not worth a page of reading; run it on the text you actually intend to hide.",
      ],
    },
  ],
  faq: [
    {
      question: "Can you Unblur an Image, Then Read the Text?",
      answer:
        "At small blur radii, yes, in this test. Radius 1 came back 5 of 5 at every text height and radius 2 came back 7 of 8 at 26-pixel text, using a contrast stretch, a 4x upscale, unsharp masking, Richardson-Lucy deconvolution and OCR. That is why a light blur is a design choice and not a privacy control.",
    },
    {
      question: "Is Pixelation Safer Than Blur?",
      answer:
        "In this run, at the sizes where it mattered, yes: zero of eight recovered through OCR at 4, 8 and 16-pixel blocks on 26-pixel text, where the equivalent blur was read back. But the ratio decides it — the same 4-pixel blocks over 48-pixel text gave up 2 of 5. A solid fill is the option that does not depend on getting a ratio right.",
    },
    {
      question: "Does Making the Blur Stronger Fix It?",
      answer:
        "Partly, and the threshold is not where people expect. Radius 4 and 8 defeated this pipeline at 26-pixel text, but radius 4 recovered 4 of 5 at 48-pixel text. Because it depends on letter height, blur cannot be the control you rely on for a value that must not come back.",
    },
    {
      question: "Can AI Recover Blurred Text Better Than This?",
      answer:
        "Almost certainly, and this page deliberately does not measure it. Generative restoration models reconstruct plausible text where the pixels are ambiguous, which makes them good at exactly the task this test declares out of scope. The absence of an AI attack is a limitation of the experiment, not evidence that a strong blur is safe. A fill has nothing for a model to work from.",
    },
    {
      question: "Why Does Text Size Change the Answer So Much?",
      answer:
        "Because the attack is a resolution problem and blur destroys resolution in absolute pixels, not in proportion to the letters. A 4-pixel blur across a 14-pixel letter collapses most of the stroke; the same blur across a 48-pixel letter leaves the middle of every stroke untouched.",
    },
    {
      question: "Is a Black Rectangle Enough by Itself?",
      answer:
        "The fill is the right operation; the risk moves to the edges. Cover the whole value with margin, then check the export at full zoom rather than at the size it appears in the editor, and remember the fill only touches the pixels inside the region you covered — the original file, any copy of it, and any metadata still hold what they hold.",
    },
  ],
  pillarLink: {
    before:
      "Since the strongest result in this test came from the one option that overwrites pixels instead of degrading them, the practical conclusion is to",
    anchor: "redact image online",
    after: "with a solid fill rather than reaching for a blur radius and hoping it is large enough.",
  },
  related: ["is-blur-safe", "redact-vs-blur"],
  relatedScenarios: ["redact-ssn", "redact-card-number", "redact-screenshot"],
};
