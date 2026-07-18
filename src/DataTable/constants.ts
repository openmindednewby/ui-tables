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
  /** Infix of a row's select checkbox: `${tableTestID}-select-${key}`. */
  rowSelectInfix: 'select',
  /** Suffix of the header (select-all-on-page) checkbox: `${tableTestID}-select-all`. */
  selectAllSuffix: 'select-all',
  /** Suffix of the select-all-matching banner: `${tableTestID}-select-banner`. */
  selectBannerSuffix: 'select-banner',
  /** Suffix of the banner's action: `${tableTestID}-select-banner-action`. */
  selectBannerActionSuffix: 'select-banner-action',
  filterBar: 'ui-filters',
  results: 'ui-results',
  pager: 'ui-pager',
  pagerInfo: 'ui-pager-info',
  pagerFirst: 'ui-pager-first',
  pagerPrev: 'ui-pager-prev',
  pagerNext: 'ui-pager-next',
  pagerLast: 'ui-pager-last',
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
 * The test id of a row's select checkbox: `${tableTestID}-select-${key}` (key from
 * `keyExtractor`). Exported so consumers and e2e specs target a row's checkbox without
 * re-deriving the shape.
 */
export const rowSelectTestID = (tableTestID: string, key: string): string =>
  `${tableTestID}-${TABLE_TEST_IDS.rowSelectInfix}-${key}`;

/** The test id of the header (select-all-on-page) checkbox: `${tableTestID}-select-all`. */
export const selectAllTestID = (tableTestID: string): string =>
  `${tableTestID}-${TABLE_TEST_IDS.selectAllSuffix}`;

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
  /** Accessible name of a row's select checkbox. */
  selectRow: 'uiTables.select.row',
  selectRowHint: 'uiTables.select.rowHint',
  /** Accessible name of the header (select-all-on-page) checkbox. */
  selectAll: 'uiTables.select.all',
  selectAllHint: 'uiTables.select.allHint',
  /** Banner, offer state: "All {{p1}} rows on this page are selected." */
  selectPageSelected: 'uiTables.select.pageSelected',
  /** Banner, offer action: "Select all {{p1}} matching this filter". */
  selectAllMatching: 'uiTables.select.allMatching',
  selectAllMatchingHint: 'uiTables.select.allMatchingHint',
  /** Banner, active state: "All {{p1}} rows matching this filter are selected." */
  selectMatchingSelected: 'uiTables.select.matchingSelected',
  /** Banner, active action: "Clear selection". */
  selectClear: 'uiTables.select.clear',
  selectClearHint: 'uiTables.select.clearHint',
  results: 'uiTables.results',
  pagerInfo: 'uiTables.pager.info',
  pagerFirst: 'uiTables.pager.first',
  pagerPrev: 'uiTables.pager.prev',
  pagerNext: 'uiTables.pager.next',
  pagerLast: 'uiTables.pager.last',
  pagerFirstHint: 'uiTables.pager.firstHint',
  pagerPrevHint: 'uiTables.pager.prevHint',
  pagerNextHint: 'uiTables.pager.nextHint',
  pagerLastHint: 'uiTables.pager.lastHint',
  pagerRows: 'uiTables.pager.rows',
  pagerRowsOptionHint: 'uiTables.pager.rowsOptionHint',
  /** Accessible hint for the dropdown-variant rows-per-page trigger button. */
  pagerRowsTriggerHint: 'uiTables.pager.rowsTriggerHint',
  /**
   * Accessible NAME of the rows-per-page control, e.g. "Rows per page, currently {{p1}}".
   * Without it the control is announced as the bare number ("50"), which says nothing about
   * what it does. Untranslated it degrades to that bare number — never to the raw key.
   */
  pagerRowsTriggerLabel: 'uiTables.pager.rowsTriggerLabel',
  /**
   * Accessible NAME of ONE rows-per-page choice, e.g. "Show {{p1}} rows per page". Used by
   * BOTH the `dropdown` options and the default `pills`. Untranslated it degrades to the
   * bare number — never to the raw key.
   */
  pagerRowsOptionLabel: 'uiTables.pager.rowsOptionLabel',
  /**
   * StatCard's accessible name, e.g. "{{p1}}: {{p2}}". Note the `analytics.` prefix: these
   * two keys predate this map and were only ever inlined in StatCard.tsx, so apps deriving
   * their required-key list from TABLE_I18N could not see them. Registered here UNCHANGED
   * (renaming them would break every app that already defines them).
   */
  statCardLabel: 'analytics.statCardLabel',
  statHint: 'analytics.statHint',
} as const;
