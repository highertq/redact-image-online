import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { OG_IMAGE } from "@/lib/metadata";
import { jsonLdScript, siteLd } from "@/lib/schema";
import { IS_LIVE, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time: no request to Google is made by the browser, so
// the font adds nothing to the network surface the security page audits.
const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full scroll-pt-20 ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          // Derived from site constants, never user input.
          dangerouslySetInnerHTML={{ __html: jsonLdScript(...siteLd()) }}
        />

        <SiteHeader />

        <main className="mx-auto w-full max-w-site flex-1 px-4 py-8 sm:px-6 lg:py-10">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
