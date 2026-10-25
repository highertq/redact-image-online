import type { Metadata } from "next";
import Link from "next/link";

import { OG_IMAGE } from "@/lib/metadata";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

const LAST_UPDATED = "October 25, 2026";

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
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Your image stays on your device
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          When you open a picture in {SITE_NAME}, it is read by your browser and
          drawn on a canvas in the page. There is no upload step. The file is not
          sent to us and we have no way to see it.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          No account, no profile
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          You do not need to sign up or log in. We do not ask for an email
          address, and we do not keep a history of the images you open.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Hosting logs
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          The site is hosted on Vercel. Like most hosting providers, Vercel may
          record standard server logs for each request, such as the page URL,
          your IP address, and your browser&apos;s user agent. Those logs relate
          to loading the page itself. They never contain your image, because your
          image is never sent to the server.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Text detection and third-party files
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Auto-detect uses an open-source text recognition library that runs
          inside your browser. On first use, that library may download its code
          and English language data from a public content delivery network. Those
          requests fetch static files only. They do not include your image or
          anything derived from it.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          No analytics or advertising
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          We do not run analytics, advertising, or tracking scripts on this site.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Changes to this policy
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          If the way this tool handles data changes, this page will be updated and
          the date at the top will change with it.
        </p>
      </section>

      {CONTACT_EMAIL ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Questions about privacy can be sent to{" "}
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

      <p className="text-sm text-neutral-600">
        <Link className="font-medium text-neutral-900 underline" href="/">
          Back to the redaction tool
        </Link>
      </p>
    </div>
  );
}
