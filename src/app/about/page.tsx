import type { Metadata } from "next";
import Link from "next/link";

import { H2, PageHeader, Prose, Section } from "@/components/Typography";
import { OG_IMAGE } from "@/lib/metadata";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About This Redaction Tool",
  description: `What ${SITE_NAME} does, what it cannot do, and why automatic detection always needs a human check before you download.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About | ${SITE_NAME}`,
    description: `What ${SITE_NAME} does and where its limits are.`,
    url: "/about",
    siteName: SITE_NAME,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `About | ${SITE_NAME}`,
    description: `What ${SITE_NAME} does and where its limits are.`,
    images: [OG_IMAGE.url],
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader kicker="About" title="About">
        <p>
          {SITE_NAME} is a small browser tool for hiding private details in a
          screenshot or photo before you share it.
        </p>
      </PageHeader>

      <Section>
        <H2>What it does</H2>
        <Prose>
          <p>
            You open an image, draw boxes over anything you want gone, and
            download a PNG. Boxes are filled with a solid color by default,
            which replaces the pixels underneath instead of smudging them. The
            export is rebuilt on a canvas, so metadata such as EXIF is not
            carried over.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Where it falls short</H2>
        <Prose>
          <p>
            Auto-detect looks for text patterns: email addresses, phone numbers,
            Social Security numbers, card numbers, and API keys. It reads what
            the text recognition step manages to see, which means small fonts,
            low contrast, unusual layouts, and handwriting can all cause a miss.
          </p>
          <p>
            Faces, addresses, names, and license plates are not detected at all
            in this version. Those need a box drawn by hand.
          </p>
          <p>
            Because of that, no detection result should be trusted on its own.
            Open the downloaded file and look at it before you send it anywhere.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Why it runs locally</H2>
        <Prose>
          <p>
            Redacting a private document on someone else&apos;s server means
            trusting that server. This tool avoids the question by never
            uploading the image in the first place. Everything happens in the
            tab you already have open.
          </p>
          <p>
            That choice costs something. There is no server to do the heavy
            work, so the text recognition that powers auto-detect has to run in
            your browser and is slower than it would be on a server. There is
            also no way to offer features that need persistence, such as a
            history or an account.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>What it is not</H2>
        <Prose>
          <p>
            It is not a PDF editor. It works on images, and a PDF needs to be
            turned into an image first — otherwise the redaction sits on top of
            a readable text layer. It is not a face blurring tool. It does not
            remove watermarks, and it should not be used to obscure a copyright
            notice.
          </p>
          <p>
            It is also not a guarantee. Redaction removes the regions you select.
            Whether the result identifies a person depends on everything else in
            the picture, and that is a judgement the tool cannot make for you.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Verifying the privacy claim yourself</H2>
        <Prose>
          <p>
            You do not have to take any of this on trust. Open the browser
            developer tools, switch to the network panel, and load an image. The
            requests you see are the page itself. There is no request carrying
            image data, because there is no server code that could receive one.
          </p>
        </Prose>
        <Prose>
          <p>
            The audit behind that statement, including the one third-party
            request the recognition library makes and why it carries no image,
            is written up on the{" "}
            <Link
              className="font-medium text-ink underline decoration-line-strong underline-offset-2 transition-hover hover:text-accent"
              href="/security-audit"
            >
              security audit
            </Link>{" "}
            page. The detection rules and their known failures are on the{" "}
            <Link
              className="font-medium text-ink underline decoration-line-strong underline-offset-2 transition-hover hover:text-accent"
              href="/methodology"
            >
              methodology
            </Link>{" "}
            page.
          </p>
        </Prose>
      </Section>

      {CONTACT_EMAIL ? (
        <Section>
          <H2>Contact</H2>
          <Prose>
            <p>
              You can reach us at{" "}
              <a
                className="font-medium text-ink underline decoration-line-strong underline-offset-2 transition-hover hover:text-accent"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Prose>
        </Section>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-line pt-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
        >
          Open the tool
        </Link>
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-paper px-4 text-body-sm font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
        >
          Privacy policy
        </Link>
      </div>
    </div>
  );
}
