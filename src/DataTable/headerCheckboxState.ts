/**
 * The tri-state of the DataTable's header (select-all) checkbox.
 *
 * INTERNAL to the package — deliberately NOT re-exported from `src/index.ts`. A `const
 * enum` in a published `.d.ts` is an ambient const enum, which every consumer compiled
 * with `isolatedModules` (all of them — they extend `expo/tsconfig.base`) would reject.
 * The public API exchanges plain `string[]`/`boolean`, so this never needs to cross the
 * package boundary.
 */
export const enum HeaderCheckboxState {
  /** No row on the current page is selected. */
  None = 'none',
  /** Some, but not all, of the current page's rows are selected → indeterminate. */
  Some = 'some',
  /** Every row on the current page is selected. */
  All = 'all',
}
