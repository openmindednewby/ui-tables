import { ALL_VALUE, TONE_RANK } from '../constants';
import { SortDirection } from '../SortDirection';
import { StatusTone } from '../StatusTone';
import type { LedgerAccessors, LedgerFilter, SortValue } from '../types';

const BEFORE = -1;
const AFTER = 1;
const SAME = 0;

const isMissing = (value: SortValue): value is null | undefined | '' =>
  value === null || value === undefined || value === '';

const compareValues = (a: string | number, b: string | number): number => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

/** Keeps rows matching the status, group and free-text filter; an empty value matches all. */
export function filterLedgerRows<T>(rows: readonly T[], filter: LedgerFilter, accessors: LedgerAccessors<T>): T[] {
  const needle = filter.text.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    const statusOk = filter.status === ALL_VALUE || accessors.getStatus(row) === filter.status;
    const groupOk = filter.group === ALL_VALUE || accessors.getGroup?.(row) === filter.group;
    const haystack = accessors.getSearchText?.(row) ?? '';
    const textOk = needle === '' || haystack.toLocaleLowerCase().includes(needle);
    return statusOk && groupOk && textOk;
  });
}

/** Stable sort by `sortValue`; missing values always sort last, whatever the direction. */
export function sortLedgerRows<T>(rows: readonly T[], sortValue: (row: T) => SortValue, direction: SortDirection): T[] {
  const sign = direction === SortDirection.Asc ? AFTER : BEFORE;
  return [...rows].sort((left, right) => {
    const a = sortValue(left);
    const b = sortValue(right);
    if (isMissing(a) && isMissing(b)) return SAME;
    if (isMissing(a)) return AFTER;
    if (isMissing(b)) return BEFORE;
    return sign * compareValues(a, b);
  });
}

export const toneRank = (tone: StatusTone): number => TONE_RANK[tone];

export const isAttentionTone = (tone: StatusTone): boolean => tone === StatusTone.Bad || tone === StatusTone.Warn;

/** Splits rows into "needs a look" (worst tone first, input order kept within a tone) and the rest. */
export function splitNeedsLook<T>(
  rows: readonly T[],
  needsLook: (row: T) => boolean,
  toneOf: (row: T) => StatusTone,
): { attention: T[]; rest: T[] } {
  const attention = rows.filter(needsLook);
  const rest = rows.filter((row) => !needsLook(row));
  return { attention: sortLedgerRows(attention, (row) => toneRank(toneOf(row)), SortDirection.Asc), rest };
}

/** Distinct non-empty values in first-seen order. */
export function distinctValues<T>(rows: readonly T[], pick: (row: T) => string | undefined): string[] {
  const seen = new Set<string>();
  rows.forEach((row) => {
    const value = pick(row);
    if (value !== undefined && value !== '') seen.add(value);
  });
  return [...seen];
}
