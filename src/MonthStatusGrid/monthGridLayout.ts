import { MIN_TARGET_PX } from '../minTarget';
import { MonthGridColumns } from './MonthGridColumns';

const COLUMN_OPTIONS = [MonthGridColumns.Twelve, MonthGridColumns.Six, MonthGridColumns.Four];

/** The widest allowed column count, up to `requested`, whose cells stay at least 44 px wide. */
export function fitMonthGridColumns(requested: MonthGridColumns, width: number, gap: number): MonthGridColumns {
  const fits = (columns: MonthGridColumns): boolean => (width - gap * (columns - 1)) / columns >= MIN_TARGET_PX;
  return COLUMN_OPTIONS.find((columns) => columns <= requested && fits(columns)) ?? MonthGridColumns.Four;
}

/** Splits cells into rows of `columns`. */
export function chunkIntoRows<T>(cells: readonly T[], columns: number): T[][] {
  const rows: T[][] = [];
  for (let start = 0; start < cells.length; start += columns) rows.push(cells.slice(start, start + columns));
  return rows;
}
