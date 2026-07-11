/**
 * Shared constants for the DataTable family (DataTable / FilterBar / Pager).
 * Keeps every literal (test ids, i18n keys, layout numbers) in one place so the
 * components hold no magic numbers and no ad-hoc strings.
 */

/** Default breakpoint (px): below this a row collapses to a label:value card. */
export const CARD_STACK_BREAKPOINT = 640;

/** Default rows-per-page choices, matching the vanilla console's GRID.md pager. */
export const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [25, 50, 100, 200];

/** Stable test ids so consumers/e2e can target the shared chrome. */
export const TABLE_TEST_IDS = {
  root: 'ui-data-table',
  head: 'ui-data-table-head',
  /** Infix of a row's test id: `${tableTestID}-row-${key}`. */
  rowInfix: 'row',
  /** Infix of an expanded row's detail panel: `${tableTestID}-row-detail-${key}`. */
  rowDetailInfix: 'row-detail',
  filterBar: 'ui-filters',
  results: 'ui-results',
  pager: 'ui-pager',
  pagerInfo: 'ui-pager-info',
  pagerPrev: 'ui-pager-prev',
  pagerNext: 'ui-pager-next',
} as const;

/** The test id of a row: `${tableTestID}-row-${key}` (key from `keyExtractor`). */
export const rowTestID = (tableTestID: string, key: string): string =>
  `${tableTestID}-${TABLE_TEST_IDS.rowInfix}-${key}`;

/**
 * The test id of an expanded row's full-width detail panel:
 * `${tableTestID}-row-detail-${key}` (key from `keyExtractor`). Exported so
 * consumers and e2e specs target the panel without re-deriving the shape.
 */
export const rowDetailTestID = (tableTestID: string, key: string): string =>
  `${tableTestID}-${TABLE_TEST_IDS.rowDetailInfix}-${key}`;

/**
 * Translation keys for every component-authored, user-facing string. Apps map
 * these in their UiProvider `t` (FM); the neutral default `t` returns the key, so
 * a host that forgets a key degrades to the key rather than a hardcoded literal.
 */
export const TABLE_I18N = {
  loading: 'uiTables.loading',
  empty: 'uiTables.empty',
  rowLabel: 'uiTables.rowLabel',
  rowHint: 'uiTables.rowHint',
  /** Accessible name of the full-width detail panel under an expanded row. */
  rowDetail: 'uiTables.rowDetail',
  results: 'uiTables.results',
  pagerInfo: 'uiTables.pager.info',
  pagerPrev: 'uiTables.pager.prev',
  pagerNext: 'uiTables.pager.next',
  pagerPrevHint: 'uiTables.pager.prevHint',
  pagerNextHint: 'uiTables.pager.nextHint',
  pagerRows: 'uiTables.pager.rows',
  pagerRowsOptionHint: 'uiTables.pager.rowsOptionHint',
  /** Accessible hint for the dropdown-variant rows-per-page trigger button. */
  pagerRowsTriggerHint: 'uiTables.pager.rowsTriggerHint',
} as const;
