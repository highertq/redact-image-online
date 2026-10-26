import Link from "next/link";

import { GUIDES, guideHref } from "@/lib/content/guides-index";
import { SCENARIOS, scenarioHref } from "@/lib/content/scenarios";
import { SITE_NAME } from "@/lib/site";

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-label font-semibold tracking-wide text-ink uppercase">
        {heading}
      </h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-body-sm text-ink-2 sm:flex sm:flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="-mx-2 flex min-h-9 items-center rounded-sm px-2 py-1 transition-hover hover:bg-surface hover:text-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line bg-surface/60 sm:mt-16">
      <div className="mx-auto w-full max-w-site px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-body-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{SITE_NAME}</p>
          <p>Your image is processed in this browser tab. Nothing is uploaded.</p>
        </div>
      </div>
    </footer>
  );
}
