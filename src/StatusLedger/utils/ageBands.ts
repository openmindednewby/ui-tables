import { SortDirection } from '../SortDirection';
import type { StatusTone } from '../StatusTone';
import { sortLedgerRows } from './ledgerLogic';

/** An age range starting at `minAgeMs`; it runs up to the next band's floor. */
export interface AgeBand {
  key: string;
  label: string;
  minAgeMs: number;
  tone: StatusTone;
}

export interface AgeBandGroup<T> {
  band: AgeBand;
  rows: T[];
}

const oldestFloorFirst = (bands: readonly AgeBand[]): AgeBand[] => [...bands].sort((a, b) => b.minAgeMs - a.minAgeMs);

/** The band an age falls in (highest floor at or below it); a missing age goes to the youngest band. */
export function assignAgeBand(ageMs: number | null, bands: readonly AgeBand[]): AgeBand | undefined {
  const ordered = oldestFloorFirst(bands);
  const youngest = ordered[ordered.length - 1];
  if (ageMs === null) return youngest;
  return ordered.find((band) => ageMs >= band.minAgeMs) ?? youngest;
}

/** Rows grouped by age band, oldest band first, empty bands dropped, row order kept inside a band. */
export function groupByAgeBand<T>(rows: readonly T[], ageOf: (row: T) => number | null, bands: readonly AgeBand[]): Array<AgeBandGroup<T>> {
  return oldestFloorFirst(bands)
    .map((band) => ({ band, rows: rows.filter((row) => assignAgeBand(ageOf(row), bands)?.key === band.key) }))
    .filter((group) => group.rows.length > 0);
}

/** Oldest first; rows with no age go last. */
export function sortOldestFirst<T>(rows: readonly T[], ageOf: (row: T) => number | null): T[] {
  return sortLedgerRows(rows, ageOf, SortDirection.Desc);
}
