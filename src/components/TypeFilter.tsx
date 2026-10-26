"use client";

import type { TypeChip } from "@/lib/detect-types";

type Props = {
  chips: TypeChip[];
  enabled: readonly string[];
  onToggle: (type: string) => void;
};

/**
 * One toggle per auto-detected type, with the number of boxes it controls.
 *
 * `aria-pressed` (rather than a checkbox) keeps the announcement short — screen
 * readers say "Email, 2, toggle button, pressed" instead of reading a separate
 * label plus a checked state.
 */
export default function TypeFilter({
  chips,
  enabled,
  onToggle,
}: Props) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <p id="type-filter-label" className="text-label font-semibold text-ink-2">
        Auto-detected types
      </p>
      <div
        role="group"
        aria-labelledby="type-filter-label"
        className="flex flex-wrap gap-1.5"
      >
        {chips.map((chip) => {
          const pressed = enabled.includes(chip.type);
          return (
            <button
              key={chip.type}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggle(chip.type)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-body-sm font-medium transition-hover ${
                pressed
                  ? "border-ink bg-ink text-paper hover:bg-redact"
                  : "border-line-strong bg-paper text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {chip.label}
              <span
                className={`font-mono text-label tabular-nums ${
                  pressed ? "text-paper/70" : "text-ink-3"
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
