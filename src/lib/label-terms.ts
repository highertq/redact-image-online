/**
 * Field names that introduce something worth hiding, across every language the
 * editor can recognise.
 *
 * Why a vocabulary instead of formats: document numbers are country-specific and
 * endless, but the word printed in front of them is short, stable and
 * translatable. "Teléfono:", "電話番号", "Telefonnummer:", "رقم الجوال" all say
 * the same thing, and once the label is found the rule covers the value after it
 * whatever that value looks like. This is what makes detection work on a
 * document nobody wrote a number rule for — and unlike the recognition models,
 * a word list costs nothing to ship.
 *
 * The terms live in two data modules, split by script family:
 * `label-terms-western.ts` (Latin alphabet) and `label-terms-other.ts`
 * (Han, Kana, Hangul, Cyrillic, Arabic).
 *
 * Short, ambiguous words are deliberately left out. Turkish "ad" means both
 * "name" and "foot", and a two-letter Latin abbreviation would fire across half
 * a page — a mis-covered line costs the user a second of review, while an
 * over-narrow rule costs them a leak.
 */

import { OTHER_SCRIPT_TERMS } from "@/lib/label-terms-other";
import { WESTERN_TERMS } from "@/lib/label-terms-western";

/**
 * De-duplicated, longest first. The matcher builds one alternation and a regex
 * takes the first alternative that matches at a position, so メールアドレス has to
 * precede メール or every Japanese line would stop matching halfway through the
 * label.
 */
export const LABEL_TERMS: string[] = [
  ...new Set([...WESTERN_TERMS, ...OTHER_SCRIPT_TERMS]),
].sort((a, b) => b.length - a.length);
