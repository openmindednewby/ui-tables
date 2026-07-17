/**
 * suggestOptions — the ranked substring matcher behind the `typeahead` field, generalized
 * from aml-v2's `suggestCountries`. Ranks: value exact (0) > value prefix (1) > label prefix
 * (2) > label contains (3); ties broken by `label.localeCompare`. Empty/short queries return
 * `[]` (nothing surfaces until `minChars` is typed, mirroring a native `<datalist>`).
 */
import type { FilterOption } from '../types';

const RANK_VALUE_EXACT = 0;
const RANK_VALUE_PREFIX = 1;
const RANK_LABEL_PREFIX = 2;
const RANK_LABEL_CONTAINS = 3;
const NO_MATCH = -1;

function rankOf(option: FilterOption, needle: string): number {
  const value = option.value.toLowerCase();
  const label = option.label.toLowerCase();
  if (value === needle) return RANK_VALUE_EXACT;
  if (value.startsWith(needle)) return RANK_VALUE_PREFIX;
  if (label.startsWith(needle)) return RANK_LABEL_PREFIX;
  if (label.includes(needle)) return RANK_LABEL_CONTAINS;
  return NO_MATCH;
}

/**
 * Rank + cap the options matching `query`. Returns `[]` until `query` (trimmed) is at least
 * `minChars` long, then the best `limit` matches, ranked as documented above.
 */
export function suggestOptions(
  options: readonly FilterOption[],
  query: string,
  minChars: number,
  limit: number,
): readonly FilterOption[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < minChars) return [];

  const scored: Array<{ option: FilterOption; rank: number }> = [];
  for (const option of options) {
    const rank = rankOf(option, needle);
    if (rank !== NO_MATCH) scored.push({ option, rank });
  }
  scored.sort((a, b) => (a.rank !== b.rank ? a.rank - b.rank : a.option.label.localeCompare(b.option.label)));
  return scored.slice(0, limit).map((entry) => entry.option);
}

/** True when `text` is non-empty yet matches no option's value or label exactly (case-insensitive). */
export function isUnmatched(options: readonly FilterOption[], text: string): boolean {
  const needle = text.trim().toLowerCase();
  if (needle === '') return false;
  return !options.some((o) => o.value.toLowerCase() === needle || o.label.toLowerCase() === needle);
}
