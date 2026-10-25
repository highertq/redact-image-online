import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `What ${SITE_NAME} does, what it cannot do, and why automatic detection always needs a human check before you download.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About | ${SITE_NAME}`,
    description: `What ${SITE_NAME} does and where its limits are.`,
    url: "/about",
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="text-sm leading-relaxed text-neutral-600">
          {SITE_NAME} is a small browser tool for hiding private details in a
          screenshot or photo before you share it.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">What it does</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          You open an image, draw boxes over anything you want gone, and download
          a PNG. Boxes are filled with a solid color by default, which replaces
          the pixels underneath instead of smudging them. The export is rebuilt on
          a canvas, so metadata such as EXIF is not carried over.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Where it falls short
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Auto-detect looks for text patterns: email addresses, phone numbers,
          Social Security numbers, card numbers, and API keys. It reads what the
          text recognition step manages to see, which means small fonts, low
          contrast, unusual layouts, and handwriting can all cause a miss.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Faces, addresses, names, and license plates are not detected at all in
          this version. Those need a box drawn by hand.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Because of that, no detection result should be trusted on its own. Open
          the downloaded file and look at it before you send it anywhere.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Why it runs locally
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Redacting a private document on someone else&apos;s server means
          trusting that server. This tool avoids the question by never uploading
          the image in the first place. Everything happens in the tab you already
          have open.
        </p>
      </section>

      {CONTACT_EMAIL ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            You can reach us at{" "}
            <a
              className="font-medium text-neutral-900 underline"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      ) : null}

      <div className="flex gap-6 text-sm">
        <Link className="font-medium text-neutral-900 underline" href="/">
          Open the tool
        </Link>
        <Link
          className="font-medium text-neutral-900 underline"
          href="/privacy"
        >
          Privacy policy
        </Link>
      </div>
    </div>
  );
}
