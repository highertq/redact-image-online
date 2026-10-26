import type { Metadata } from "next";
import Link from "next/link";

import { H2, PageHeader, Prose, Section } from "@/components/Typography";
import { OG_IMAGE } from "@/lib/metadata";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

const LAST_UPDATED = "October 25, 2026";

const GLANCE = [
  {
    label: "No upload",
    detail: "The file is read by your browser and drawn on a canvas in the page.",
  },
  {
    label: "No account",
    detail: "No sign-up, no email address, no history of the images you open.",
  },
  {
    label: "No analytics",
    detail: "No analytics, advertising, or tracking scripts on this site.",
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles your images: everything is processed in your browser, nothing is uploaded, and there is no account to create.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `How ${SITE_NAME} handles your images and what stays on your device.`,
    url: "/privacy",
    siteName: SITE_NAME,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `How ${SITE_NAME} handles your images and what stays on your device.`,
    images: [OG_IMAGE.url],
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader kicker="Privacy" title="Privacy Policy">
        <p className="text-body-sm text-ink-3">Last updated: {LAST_UPDATED}</p>
      </PageHeader>

      <ul className="grid gap-3 sm:grid-cols-3">
        {GLANCE.map((item) => (
          <li
            key={item.label}
            className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4"
          >
            <span className="text-body font-semibold text-ink">
              {item.label}
            </span>
            <span className="text-body-sm leading-relaxed text-ink-2">
              {item.detail}
            </span>
          </li>
        ))}
      </ul>

      <Section>
        <H2>Your image stays on your device</H2>
        <Prose>
          <p>
            When you open a picture in {SITE_NAME}, it is read by your browser
            and drawn on a canvas in the page. There is no upload step. The file
            is not sent to us and we have no way to see it.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>No account, no profile</H2>
        <Prose>
          <p>
            You do not need to sign up or log in. We do not ask for an email
            address, and we do not keep a history of the images you open.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Hosting logs</H2>
        <Prose>
          <p>
            The site is hosted on Vercel. Like most hosting providers, Vercel
            may record standard server logs for each request, such as the page
            URL, your IP address, and your browser&apos;s user agent. Those logs
            relate to loading the page itself. They never contain your image,
            because your image is never sent to the server.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Text detection and third-party files</H2>
        <Prose>
          <p>
            Auto-detect uses an open-source text recognition library that runs
            inside your browser. On first use, that library may download its
            code and English language data from a public content delivery
            network. Those requests fetch static files only. They do not include
            your image or anything derived from it.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>No analytics or advertising</H2>
        <Prose>
          <p>
            We do not run analytics, advertising, or tracking scripts on this
            site.
          </p>
        </Prose>
      </Section>

      <Section>
        <H2>Changes to this policy</H2>
        <Prose>
          <p>
            If the way this tool handles data changes, this page will be updated
            and the date at the top will change with it.
          </p>
        </Prose>
      </Section>

      {CONTACT_EMAIL ? (
        <Section>
          <H2>Contact</H2>
          <Prose>
            <p>
              Questions about privacy can be sent to{" "}
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

      <div className="border-t border-line pt-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
        >
          Back to the redaction tool
        </Link>
      </div>
    </div>
  );
}
