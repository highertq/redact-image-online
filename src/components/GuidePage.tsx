import Link from "next/link";

import { guideHref, relatedGuides } from "@/lib/content/guides-index";
import { scenarioBySlug, scenarioHref } from "@/lib/content/scenarios";
import type { Guide } from "@/lib/content/types";

/** Renderer shared by every /guides/* page. All copy comes from the record. */
export default function GuidePage({ guide }: { guide: Guide }) {
  const related = relatedGuides(guide.slug);
  const scenarios = guide.relatedScenarios.map((slug) => scenarioBySlug(slug));

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
          Guide
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {guide.h1}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-600">
          {guide.lede}
        </p>
      </header>

      {guide.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {section.heading}
          </h2>
          <div className="flex max-w-2xl flex-col gap-3 text-sm leading-relaxed text-neutral-600">
            {section.body.map((text) => (
              <p key={text.slice(0, 48)}>{text}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <dl className="flex max-w-2xl flex-col divide-y divide-neutral-200">
          {guide.faq.map((item) => (
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
      </section>

      <nav
        aria-label="Related reading"
        className="flex flex-col gap-6 border-t border-neutral-200 pt-8"
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-neutral-900">
            Put this into practice
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {scenarios.map((item) => (
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
                Open the redaction tool
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-neutral-900">
            Related reading
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={guideHref(item.slug)}
                  className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                >
                  {item.h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </article>
  );
}
