/**
 * Shared constants for the DataTable family (DataTable / FilterBar / Pager).
 * Keeps every literal (test ids, i18n keys, layout numbers) in one place so the
 * components hold no magic numbers and no ad-hoc strings.
 */

/**
 * Default breakpoint (px): below this a row collapses to a label:value card.
 *
 * Aligned with `@dloizides/ui-layout`'s `MENU_BREAKPOINT` (768) — the kit's single
 * "this is a phone / narrow tablet" threshold, already the collapse point for the nav
 * menu (`ModalDropdown`) and the tabs bar (`TABS_COLLAPSE_BREAKPOINT`). Kept as a plain
 * literal rather than an import so a table has no runtime dependency on the layout kit
 * for one number; the value is what is shared, and it is documented here as such. A table
 * that never wants the card-stack still opts out with `stackBreakpoint={0}`.
 */
export const CARD_STACK_BREAKPOINT = 768;

/** Default rows-per-page choices, matching the vanilla console's GRID.md pager. */
export const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [25, 50, 100, 200];

/**
 * Row-entrance stagger (the Ant-design-like list fade-in via `@dloizides/ui-motion`'s
 * `<FadeIn>`): only the first `ROW_ENTRANCE_STAGGER_CAP` rows fade in one-after-another,
 * each `ROW_ENTRANCE_STAGGER_STEP_MS` behind the last. Every row past the cap shares the
 * capped delay so the entrance settles in a fixed ~`cap * step` ms no matter the page size.
 *
 * The cap is the whole point: without it a 200-row page schedules 200 escalating delays
 * (and a 5,000-row list would take minutes to finish appearing while pinning the main
 * thread) — exactly the jank this animation is supposed to add polish over, not create.
 */
export const ROW_ENTRANCE_STAGGER_CAP = 10;
export const ROW_ENTRANCE_STAGGER_STEP_MS = 30;

/**
 * The entrance delay (ms) for the row at `index`, capped at `ROW_ENTRANCE_STAGGER_CAP`
 * rows: rows 0..cap stagger; every row beyond the cap gets the same (capped) delay, so a
 * long page never animates row-by-row. Pure + exported for direct unit testing.
 */
export const rowEntranceDelayMs = (index: number): number =>
  Math.min(index, ROW_ENTRANCE_STAGGER_CAP) * ROW_ENTRANCE_STAGGER_STEP_MS;

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
  /** Infix of a row's entrance-fade wrapper: `${tableTestID}-fade-${key}`. */
  rowFadeInfix: 'fade',
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
 * The test id of a row's entrance-fade wrapper: `${tableTestID}-fade-${key}` (key from
 * `keyExtractor`). Only present while `animateRows` is on and reduced-motion is off.
 * Exported so consumers/e2e can target (or assert the absence of) the animation wrapper.
 */
export const rowFadeTestID = (tableTestID: string, key: string): string =>
  `${tableTestID}-${TABLE_TEST_IDS.rowFadeInfix}-${key}`;

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
