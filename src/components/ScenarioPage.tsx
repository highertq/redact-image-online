import Link from "next/link";

import { IconCheck } from "@/components/Icons";
import { H2, Lede, Prose, Section } from "@/components/Typography";
import { scenarioHref, relatedScenarios } from "@/lib/content/scenarios";
import type { Scenario } from "@/lib/content/types";

function FieldTable({ rows }: { rows: { label: string; detail: string }[] }) {
  return (
    <dl className="overflow-hidden rounded-lg border border-line">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`grid gap-1 px-4 py-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4 ${
            index > 0 ? "border-t border-line" : ""
          }`}
        >
          <dt className="text-body-sm font-semibold text-ink">{row.label}</dt>
          <dd className="text-body-sm leading-relaxed text-ink-2">
            {row.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AutoCards({
  detects,
  misses,
}: {
  detects: string[];
  misses: string[];
}) {
  const columns = [
    { heading: "Found automatically", items: detects, found: true },
    { heading: "Needs a box by hand", items: misses, found: false },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {columns.map((column) => (
        <div
          key={column.heading}
          className={`flex flex-col gap-3 rounded-lg border p-5 ${
            column.found
              ? "border-accent/30 bg-accent-soft"
              : "border-line bg-paper"
          }`}
        >
          <h3 className="text-body font-semibold text-ink">{column.heading}</h3>
          <ul className="flex flex-col gap-2 text-body-sm text-ink-2">
            {column.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                    column.found
                      ? "bg-accent text-paper"
                      : "border border-line-strong text-transparent"
                  }`}
                >
                  <IconCheck className="h-2.5 w-2.5" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function StepGrid({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {items.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-5"
        >
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-full bg-ink text-label font-semibold text-paper tabular-nums"
          >
            {index + 1}
          </span>
          <h3 className="text-body font-semibold text-ink">{step.title}</h3>
          <p className="text-body-sm leading-relaxed text-ink-2">{step.body}</p>
        </li>
      ))}
    </ol>
  );
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

/** Renderer shared by every scenario page. All copy comes from the record. */
export default function ScenarioPage({ scenario }: { scenario: Scenario }) {
  const related = relatedScenarios(scenario.slug);

  return (
    <article className="flex flex-col gap-14">
      <header className="flex flex-col gap-5 border-b border-line pb-8">
        <h1 className="text-h1 font-semibold text-ink md:text-display">
          {scenario.h1}
        </h1>
        <Lede>{scenario.lede}</Lede>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
          >
            Open the redaction tool
          </Link>
          <p className="text-body-sm text-ink-3">
            Free, no account, and the image never leaves your browser.
          </p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-14">
      <Section>
        <H2>{scenario.risk.heading}</H2>
        <Prose>
          {scenario.risk.body.map((text) => (
            <p key={text.slice(0, 48)}>{text}</p>
          ))}
        </Prose>
      </Section>

      <Section>
        <H2>{scenario.fields.heading}</H2>
        <p className="measure text-body-sm leading-relaxed text-ink-2">
          {scenario.fields.intro}
        </p>
        <FieldTable rows={scenario.fields.rows} />
      </Section>

      <Section>
        <H2>{scenario.auto.heading}</H2>
        <p className="measure text-body-sm leading-relaxed text-ink-2">
          {scenario.auto.intro}
        </p>
        <AutoCards
          detects={scenario.auto.detects}
          misses={scenario.auto.misses}
        />
      </Section>

      <Section>
        <H2>{scenario.steps.heading}</H2>
        <p className="measure text-body-sm leading-relaxed text-ink-2">
          {scenario.steps.intro}
        </p>
        <StepGrid items={scenario.steps.items} />
      </Section>

      <Section>
        <H2>{scenario.detail.heading}</H2>
        <Prose>
          {scenario.detail.body.map((text) => (
            <p key={text.slice(0, 48)}>{text}</p>
          ))}
        </Prose>
      </Section>

      {/*
        Contextual link to the homepage. It sits in the body flow rather than in
        the footer so it reads as a real recommendation, and it passes consistent
        keyword-bearing anchor text back to the pillar page.
      */}
      <p className="measure rounded-lg border border-line bg-surface px-5 py-4 text-body-sm leading-relaxed text-ink-2">
        {scenario.pillarLink.before}{" "}
        <Link
          href="/"
          className="font-semibold text-ink underline decoration-line-strong underline-offset-2 transition-hover hover:text-accent hover:decoration-accent"
        >
          {scenario.pillarLink.anchor}
        </Link>{" "}
        {scenario.pillarLink.after}
      </p>

      <Section>
        <H2>Frequently asked questions</H2>
        <Faq items={scenario.faq} />
      </Section>

      <nav
        aria-label="Related redaction guides"
        className="flex flex-col gap-4 border-t border-line pt-8"
      >
        <h2 className="text-body font-semibold text-ink">
          Other things to hide
        </h2>
        <ul className="grid gap-2 text-body-sm sm:grid-cols-2">
          {related.map((item) => (
            <li key={item.slug}>
              <Link
                href={scenarioHref(item.slug)}
                className="flex min-h-11 items-center rounded-md border border-line px-4 font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
              >
                {item.h1}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="flex min-h-11 items-center rounded-md border border-line px-4 font-medium text-ink transition-hover hover:border-accent hover:bg-accent-soft"
            >
              Redact an image in your browser
            </Link>
          </li>
        </ul>
      </nav>
        </div>

        {/* The rail keeps the tool one click away on a page that exists to
            explain why the tool is needed. */}
        <aside className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 lg:sticky lg:top-20">
          <p className="text-body font-semibold text-ink">
            Ready to hide it?
          </p>
          <p className="text-body-sm leading-relaxed text-ink-2">
            Solid fill, no upload, no account. The image stays in this browser
            tab.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
          >
            Open the redaction tool
          </Link>
        </aside>
      </div>
    </article>
  );
}
