import type { ReactNode } from "react";

/**
 * Shared typographic primitives. Content pages compose these instead of
 * re-declaring sizes, so a scale change lands in one place.
 */

export function Section({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`flex flex-col gap-4 ${className}`}>
      {children}
    </section>
  );
}

export function H2({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <h2 id={id} className="text-h2 font-semibold text-ink">
      {children}
    </h2>
  );
}

/** Body copy. 14px, capped at 68ch, secondary ink. */
export function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`measure flex flex-col gap-3 text-body-sm text-ink-2 ${className}`}
    >
      {children}
    </div>
  );
}

/** The one larger paragraph that opens a page or a section. */
export function Lede({ children }: { children: ReactNode }) {
  return <p className="measure text-body text-ink-2">{children}</p>;
}

/** Small uppercase label above a heading. */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-label font-medium tracking-wide text-ink-3 uppercase">
      {children}
    </p>
  );
}

/** The shared opening block for every self-built page. The h1 text is passed
 * in verbatim so no page title is retyped here. */
export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-8">
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <h1 className="text-h1 font-semibold text-ink md:text-display">{title}</h1>
      {children ? (
        <div className="measure flex flex-col gap-3 text-body text-ink-2">
          {children}
        </div>
      ) : null}
    </header>
  );
}

/**
 * A table that scrolls inside its own box on a narrow screen instead of
 * pushing the page sideways.
 */
export function DataTable({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[560px] border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-line bg-surface text-left">
            {head.map((label) => (
              <th
                key={label}
                scope="col"
                className="px-4 py-2.5 text-label font-semibold tracking-wide text-ink-3 uppercase"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
