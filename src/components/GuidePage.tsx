import Link from "next/link";

import { H2, Kicker, Lede, Prose, Section } from "@/components/Typography";
import { guideHref, relatedGuides } from "@/lib/content/guides-index";
import { scenarioBySlug, scenarioHref } from "@/lib/content/scenarios";
import type { Guide } from "@/lib/content/types";

/** Stable in-page anchor for a section heading, derived from its text. */
function anchorId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Faq({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-semibold text-ink transition-hover hover:text-accent [&::-webkit-details-marker]:hidden">
            {item.question}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-ink-3 transition-state group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="measure pb-4 text-body-sm leading-relaxed text-ink-2">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

function LinkCard({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center rounded-md border border-line px-4 text-body-sm font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
    >
      {children}
    </Link>
  );
}

/** Renderer shared by every /guides/* page. All copy comes from the record. */
export default function GuidePage({ guide }: { guide: Guide }) {
  const related = relatedGuides(guide.slug);
  const scenarios = guide.relatedScenarios.map((slug) => scenarioBySlug(slug));

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-4 border-b border-line pb-8">
        <Kicker>Guide</Kicker>
        <h1 className="text-h1 font-semibold text-ink md:text-display">
          {guide.h1}
        </h1>
        <Lede>{guide.lede}</Lede>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-12">
          {guide.sections.map((section) => (
            <Section key={section.heading} id={anchorId(section.heading)}>
              <H2>{section.heading}</H2>
              <Prose>
                {section.body.map((text) => (
                  <p key={text.slice(0, 48)}>{text}</p>
                ))}
              </Prose>
            </Section>
          ))}

          {/*
            Contextual link to the homepage, identical in role to the one on
            scenario pages: it sends primary-keyword anchor text from the
            guide cluster into the pillar.
          */}
          <p className="measure rounded-lg border border-line bg-surface px-5 py-4 text-body-sm leading-relaxed text-ink-2">
            {guide.pillarLink.before}{" "}
            <Link
              href="/"
              className="font-semibold text-ink underline decoration-line-strong underline-offset-2 transition-hover hover:text-accent hover:decoration-accent"
            >
              {guide.pillarLink.anchor}
            </Link>{" "}
            {guide.pillarLink.after}
          </p>

          <Section>
            <H2>Frequently asked questions</H2>
            <Faq items={guide.faq} />
          </Section>
        </div>

        <aside className="flex flex-col gap-6 rounded-lg border border-line bg-surface p-5 lg:sticky lg:top-20">
          <nav aria-label="On this page" className="flex flex-col gap-2">
            <p className="text-label font-semibold tracking-wide text-ink-3 uppercase">
              On this page
            </p>
            <ol className="flex flex-col gap-1 text-body-sm text-ink-2">
              {guide.sections.map((section, index) => (
                <li key={section.heading} className="flex gap-2">
                  <span className="w-4 shrink-0 text-right font-mono text-label text-ink-3 tabular-nums">
                    {index + 1}
                  </span>
                  <a
                    href={`#${anchorId(section.heading)}`}
                    className="transition-hover hover:text-accent"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>

      <nav
        aria-label="Related reading"
        className="flex flex-col gap-8 border-t border-line pt-8"
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-body font-semibold text-ink">
            Put this into practice
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {scenarios.map((item) => (
              <li key={item.slug}>
                <LinkCard href={scenarioHref(item.slug)}>
                  {item.h1}
                </LinkCard>
              </li>
            ))}
            <li>
              <LinkCard href="/">Open the redaction tool</LinkCard>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-body font-semibold text-ink">Related reading</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <LinkCard href={guideHref(item.slug)}>{item.h1}</LinkCard>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </article>
  );
}
