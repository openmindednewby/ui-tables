const BAR_WIDTHS = ['72%', '56%', '84%', '64%', '48%'] as const;
const NUMERIC_BAR_WIDTH = '40%';
const MIN_ROWS = 0;

/** The placeholder bar width of one cell: varied per row and column so the rows read as text, not as a grid of equal blocks. */
export function skeletonBarWidth(rowIndex: number, columnIndex: number, numeric = false): string {
  if (numeric) return NUMERIC_BAR_WIDTH;
  return BAR_WIDTHS[(rowIndex + columnIndex * 2) % BAR_WIDTHS.length] ?? BAR_WIDTHS[0];
}

/** The row indexes to draw; a negative or fractional count is clamped to whole rows. */
export function skeletonRowIndexes(count: number): number[] {
  return Array.from({ length: Math.max(MIN_ROWS, Math.floor(count)) }, (_, i) => i);
}

export const SKELETON_TEST_ID = 'ui-table-skeleton';
export const skeletonRowTestID = (tableTestID: string, index: number): string => `${tableTestID}-row-${index}`;
