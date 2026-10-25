import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

const NAV = [
  { href: "/guides", label: "Guides" },
  { href: "/methodology", label: "How detection works" },
  { href: "/security-audit", label: "Security audit" },
];

/**
 * Brand mark: a page with one line redacted. Drawn inline so the header makes
 * no network request for an icon.
 */
function Mark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
    >
      <rect
        x="2.75"
        y="2.75"
        width="18.5"
        height="18.5"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 9.5h10M7 14.5h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="13" y="13" width="4.5" height="3" rx="0.75" fill="currentColor" />
    </svg>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-site items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 text-body font-semibold tracking-tight text-ink transition-hover hover:text-accent"
        >
          <Mark />
          {SITE_NAME}
        </Link>

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center rounded-sm px-3 text-body-sm text-ink-2 transition-hover hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="ml-auto hidden min-h-11 items-center rounded-md bg-ink px-4 text-body-sm font-semibold text-paper transition-hover hover:bg-redact md:ml-2 md:inline-flex"
        >
          Redact image online
        </Link>
      </div>
    </header>
  );
}
