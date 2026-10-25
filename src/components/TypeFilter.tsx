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
      <p id="type-filter-label" className="text-sm font-medium text-neutral-900">
        Auto-detected types
      </p>
      <div
        role="group"
        aria-labelledby="type-filter-label"
        className="flex flex-wrap gap-2"
      >
        {chips.map((chip) => {
          const pressed = enabled.includes(chip.type);
          return (
            <button
              key={chip.type}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggle(chip.type)}
              className={`min-h-11 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${
                pressed
                  ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
                  : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {chip.label}
              <span
                className={`ml-2 tabular-nums ${
                  pressed ? "text-neutral-300" : "text-neutral-500"
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
