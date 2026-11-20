import type { ColumnOption } from '../types';

/** Shows or hides a column; a locked column and the last visible column never hide. */
export function toggleColumn(columns: readonly ColumnOption[], visible: readonly string[], key: string): string[] {
  const column = columns.find((c) => c.key === key);
  if (column === undefined || column.locked === true) return [...visible];
  if (!visible.includes(key)) return columns.filter((c) => c.key === key || visible.includes(c.key)).map((c) => c.key);
  const next = visible.filter((k) => k !== key);
  return next.length === 0 ? [...visible] : next;
}

/** The keys to render: the saved choice plus every locked column, in column order; no choice shows all. */
export function resolveVisibleColumns(columns: readonly ColumnOption[], saved: readonly string[] | null): string[] {
  if (saved === null) return columns.map((c) => c.key);
  return columns.filter((c) => c.locked === true || saved.includes(c.key)).map((c) => c.key);
}
