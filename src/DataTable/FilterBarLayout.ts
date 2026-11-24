/** How the filter bar arranges its parts: `Flow` wraps fields, count and actions on one row; `Rows` puts the fields on one line and the actions (left) with the count (right) on the line below. */
export const enum FilterBarLayout {
  Flow = 'flow',
  Rows = 'rows',
}
