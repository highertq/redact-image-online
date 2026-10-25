import type { Metadata } from "next";
import Link from "next/link";

import { GUIDES, guideHref } from "@/lib/content/guides-index";
import { SCENARIOS, scenarioHref } from "@/lib/content/scenarios";
import { OG_IMAGE } from "@/lib/metadata";
import { jsonLdScript, siteLd } from "@/lib/schema";
import { IS_LIVE, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const DEFAULT_TITLE = `${SITE_NAME} — Redact Image Online`;
const DEFAULT_DESCRIPTION =
  "Hide private details in a screenshot before you share it. Solid fill, no upload, nothing leaves your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Redact image online, free and entirely in your browser. Hide private details before you share a screenshot.",
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  ...(IS_LIVE ? {} : { robots: { index: false, follow: false } }),
};

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold tracking-wide text-neutral-900 uppercase">
        {heading}
      </h2>
      <ul className="flex flex-col gap-1.5 text-sm text-neutral-600">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-neutral-900">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-neutral-900">
        <script
          type="application/ld+json"
          // Derived from site constants, never user input.
          dangerouslySetInnerHTML={{ __html: jsonLdScript(...siteLd()) }}
        />

        <header className="border-b border-neutral-200">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              {SITE_NAME}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          {children}
        </main>

        <footer className="border-t border-neutral-200">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
            <FooterColumn
              heading="What to hide"
              links={SCENARIOS.map((item) => ({
                href: scenarioHref(item.slug),
                label: item.navLabel,
              }))}
            />
            <FooterColumn
              heading="Guides"
              links={[
                { href: "/guides", label: "All guides" },
                ...GUIDES.map((item) => ({
                  href: guideHref(item.slug),
                  label: item.navLabel,
                })),
              ]}
            />
            <FooterColumn
              heading="About the tool"
              links={[
                { href: "/methodology", label: "How detection works" },
                { href: "/security-audit", label: "Security audit" },
                { href: "/about", label: "About" },
                { href: "/privacy", label: "Privacy" },
              ]}
            />
          </div>
          <div className="mx-auto w-full max-w-5xl border-t border-neutral-200 px-4 py-4 text-xs text-neutral-500">
            Your image is processed in this browser tab. Nothing is uploaded.
          </div>
        </footer>
      </body>
    </html>
  );
}
