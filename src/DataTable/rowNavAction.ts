/**
 * A keyboard action on the row grid, decoded from a key press by `toRowNavAction`.
 *
 * INTERNAL — not re-exported from `src/index.ts` (see `headerCheckboxState.ts`).
 */
export const enum RowNavAction {
  /** ArrowDown — focus the next row (clamped at the last; never wraps). */
  Next = 'next',
  /** ArrowUp — focus the previous row (clamped at the first; never wraps). */
  Prev = 'prev',
  /** Home — focus the first row on the page. */
  First = 'first',
  /** End — focus the last row on the page. */
  Last = 'last',
  /** Space — toggle the focused row's selection. */
  Toggle = 'toggle',
  /** Enter — activate the focused row (the existing `onRowPress`). */
  Activate = 'activate',
}
