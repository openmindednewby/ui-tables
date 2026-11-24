/**
 * Filters chrome: `Boxed` draws the bar's own bordered box; `Bare` drops it for a host card and stacks full width on phones;
 * `Grid` is `Bare` with the fields in one even row of up to four columns, then 36 px actions (left) and the count (right) on the line below.
 */
export const enum FiltersVariant {
  Boxed = 'boxed',
  Bare = 'bare',
  Grid = 'grid',
}
