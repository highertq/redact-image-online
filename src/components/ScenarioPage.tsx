import Link from "next/link";

import { scenarioHref, relatedScenarios } from "@/lib/content/scenarios";
import type { Scenario } from "@/lib/content/types";

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      {children}
    </section>
  );
}

function Paragraphs({ body }: { body: string[] }) {
  return (
    <div className="flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-neutral-600">
      {body.map((text) => (
        <p key={text.slice(0, 48)}>{text}</p>
      ))}
    </div>
  );
}

/** Renderer shared by every scenario page. All copy comes from the record. */
export default function ScenarioPage({ scenario }: { scenario: Scenario }) {
  const related = relatedScenarios(scenario.slug);

  return (
    <article className="flex flex-col gap-14">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {scenario.h1}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
          {scenario.lede}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            Open the redaction tool
          </Link>
          <p className="text-sm text-neutral-500">
            Free, no account, and the image never leaves your browser.
          </p>
        </div>
      </header>

      <Section heading={scenario.risk.heading}>
        <Paragraphs body={scenario.risk.body} />
      </Section>

      <Section heading={scenario.fields.heading}>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          {scenario.fields.intro}
        </p>
        <dl className="flex max-w-2xl flex-col divide-y divide-neutral-200 border-y border-neutral-200">
          {scenario.fields.rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1 py-3">
              <dt className="text-sm font-semibold text-neutral-900">
                {row.label}
              </dt>
              <dd className="text-sm leading-relaxed text-neutral-600">
                {row.detail}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section heading={scenario.auto.heading}>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          {scenario.auto.intro}
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-base font-semibold text-neutral-900">
              Found automatically
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-neutral-700">
              {scenario.auto.detects.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="shrink-0">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <h3 className="text-base font-semibold text-neutral-900">
              Needs a box by hand
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-neutral-700">
              {scenario.auto.misses.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="shrink-0">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section heading={scenario.steps.heading}>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          {scenario.steps.intro}
        </p>
        <ol className="flex max-w-2xl flex-col gap-4">
          {scenario.steps.items.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white"
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section heading={scenario.detail.heading}>
        <Paragraphs body={scenario.detail.body} />
      </Section>

      {/*
        Contextual link to the homepage. It sits in the body flow rather than in
        the footer so it reads as a real recommendation, and it passes consistent
        keyword-bearing anchor text back to the pillar page.
      */}
      <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
        {scenario.pillarLink.before}{" "}
        <Link
          href="/"
          className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
        >
          {scenario.pillarLink.anchor}
        </Link>{" "}
        {scenario.pillarLink.after}
      </p>

      <Section heading="Frequently asked questions">
        <dl className="flex max-w-2xl flex-col divide-y divide-neutral-200">
          {scenario.faq.map((item) => (
            <div key={item.question} className="flex flex-col gap-2 py-4">
              <dt className="text-base font-semibold text-neutral-900">
                {item.question}
              </dt>
              <dd className="text-sm leading-relaxed text-neutral-600">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <nav
        aria-label="Related redaction guides"
        className="flex flex-col gap-3 border-t border-neutral-200 pt-8"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          Other things to hide
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          {related.map((item) => (
            <li key={item.slug}>
              <Link
                href={scenarioHref(item.slug)}
                className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
              >
                {item.h1}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
            >
              Redact an image in your browser
            </Link>
          </li>
        </ul>
      </nav>
    </article>
  );
}
