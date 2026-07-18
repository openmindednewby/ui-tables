// StatCard — the proven (erevna+katalogos) metric tile.
export { StatCard } from './StatCard/StatCard';
export type { StatCardProps } from './StatCard/StatCard';

// DataTable family — the shared, tokenized RN-web grid (GRID.md contract) promoted
// from the /coverage POC. Its 2nd consumer is the AML v2 parallel-run portal.
export { DataTable, FilterBar, Pager } from './DataTable';
export type { DataTableColumn, DataTableProps, FilterBarProps, PagerProps } from './DataTable';
// Per-slot style overrides — the defaults are opinionated but never mandatory: these
// merge LAST, so a consumer that must be pixel-perfect beats the theme colours too.
export type { DataTableStyleOverrides, FilterBarStyleOverrides, PagerStyleOverrides } from './DataTable';
export {
  TABLE_TEST_IDS,
  TABLE_I18N,
  CARD_STACK_BREAKPOINT,
  DEFAULT_PAGE_SIZE_OPTIONS,
  rowTestID,
  rowDetailTestID,
  rowSelectTestID,
  selectAllTestID,
} from './DataTable';

// Filters — the declarative, configurable filter bar built ON the FilterBar shell. A caller
// passes a `fields` schema (select / text / number / dateRange / typeahead / boolean), a value
// map, and a live-or-draft/apply value model (`useFilterDraft`). Superset of every portal's
// hand-rolled filters; only the theme changes per app.
export { Filters, useFilterDraft, suggestOptions, isUnmatched } from './Filters';
export type {
  FiltersProps,
  RenderSelectArgs,
  FieldStrings,
  UseFilterDraftOptions,
  FilterDraft,
  FilterField,
  FilterFieldKind,
  FilterOption,
  FilterValue,
  FilterValues,
  DateRangeValue,
  SelectFilterField,
  TextFilterField,
  NumberFilterField,
  DateRangeFilterField,
  TypeaheadFilterField,
  BooleanFilterField,
} from './Filters';
export {
  FILTERS_TEST_ID,
  FILTERS_I18N,
  FIELD_MIN_WIDTH,
  DEFAULT_TYPEAHEAD_MIN_CHARS,
  DEFAULT_TYPEAHEAD_MAX_SUGGESTIONS,
  fieldTestID,
  applyTestID,
  clearTestID,
} from './Filters';

// usePagedRows — client-side pagination state for an in-memory array. Promoted from the
// byte-identical PaginatedList twins (erevna-web / katalogos-web) as a HOOK, not a
// component: the original hard-bound FlatList + app-specific empty/loading states, which
// stay app-side. For server-side paging use DataTable's pager instead.
export { usePagedRows, DEFAULT_PAGE_SIZE } from './Pagination/usePagedRows';
export type { UsePagedRowsOptions, PagedRows } from './Pagination/usePagedRows';
