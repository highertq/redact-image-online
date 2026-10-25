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
