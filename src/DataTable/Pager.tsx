/**
 * Pager — the shared pagination control from GRID.md (`.ui-pager`): page-info on
 * the left (`from–to of N`), nav on the right (rows-per-page + Prev/Next). Sits ON
 * TOP of the grid (in the section header row), so every paged grid looks the same.
 * RN idiom: rows-per-page is a row of pressable pills (RN has no native `<select>`);
 * everything is themed from `useUi().theme` and labelled via the UiProvider `t`.
 */
import React from 'react';
import { Text, View, useWindowDimensions, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { CARD_STACK_BREAKPOINT, DEFAULT_PAGE_SIZE_OPTIONS, TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { PagerNav } from './PagerNav';
import { chromeStyles as c } from './styles';

const FIRST_PAGE = 1;
const EN_DASH = '–';
const BOLD = '700' as const;

/**
 * Per-slot style overrides for the Pager, merged **LAST** into each slot's style array
 * so the consumer always wins — over the base StyleSheet AND over the inline colours
 * taken from `useUi().theme`. Omit for the shared defaults (nothing changes).
 */
export interface PagerStyleOverrides {
  /** The outer pager row. */
  pager?: StyleProp<ViewStyle>;
  /** The `from–to of N` count line. */
  pagerInfo?: StyleProp<TextStyle>;
  /** The right-hand nav cluster (rows-per-page + Prev/Next). */
  pagerNav?: StyleProp<ViewStyle>;
  /** The "Rows" caption before the size pills. */
  pagerRowsLabel?: StyleProp<TextStyle>;
  /** The rows-per-page pill group. */
  sizeGroup?: StyleProp<ViewStyle>;
  /** A Prev/Next button. */
  control?: StyleProp<ViewStyle>;
  /** A Prev/Next button's label. */
  controlText?: StyleProp<TextStyle>;
  /** A rows-per-page pill. */
  sizePill?: StyleProp<ViewStyle>;
  /** A rows-per-page pill's label. */
  sizePillText?: StyleProp<TextStyle>;
}

export interface PagerProps {
  /** 1-based current page. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Total row count across all pages. */
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Rows-per-page choices. Default 25 / 50 / 100 / 200. */
  pageSizeOptions?: readonly number[];
  /**
   * How the rows-per-page control renders. `'pills'` (default) keeps the RN-idiom row of
   * pressable size pills — byte-identical for every existing consumer. `'dropdown'` swaps in
   * a compact `<select>`-like anchored dropdown matching the v1 console's "Rows" select
   * (compact trigger + chevron, popover of options, close on outside-click / Escape) and a
   * mixed-case "Rows" caption.
   */
  rowsVariant?: 'pills' | 'dropdown';
  /**
   * Optional, already-translated unit noun appended to the count line, e.g.
   * `"leadership terms"` renders `1–50 of 3,023 leadership terms`. When omitted the
   * count line stays the generic `from–to of N` (byte-identical to prior behaviour).
   */
  unitLabel?: string;
  /**
   * Optional, already-translated SINGULAR unit noun, used in place of `unitLabel` when
   * `total === 1` (e.g. `unitLabel="results"` + `unitLabelSingular="result"` → `1–1 of 1 result`).
   * Ignored unless `unitLabel` is also set; when omitted, `unitLabel` is used at every count.
   */
  unitLabelSingular?: string;
  /**
   * Render First / Last jump buttons flanking Prev / Next (reconciling erevna's
   * `PaginationControls`). Off by default (byte-identical to prior behaviour) — the two
   * buttons only appear when explicitly enabled.
   */
  showFirstLast?: boolean;
  /**
   * Collapse to a compact, mobile-friendly nav below `stackBreakpoint`: the rows-per-page
   * control and the First/Last jumps are hidden, leaving Prev / Next + the count line. Off by
   * default (byte-identical). Auto-driven by the window width, mirroring the DataTable card-stack.
   */
  responsive?: boolean;
  /** Width (px) below which `responsive` collapses to the compact nav. Default 640 (shared with DataTable). */
  stackBreakpoint?: number;
  /**
   * Optional, already-translated word prefixed to the count line, e.g. `"Showing"` renders
   * `Showing 1–50 of 3,023 leadership terms`. Omit for the bare `from–to of N` line
   * (byte-identical to prior behaviour).
   */
  infoPrefix?: string;
  /**
   * Render the three counts (from / to / total) in bold `colors.text` — matching the v1
   * console's `.ui-pager__info b`. Off by default (the whole line stays `textSecondary`,
   * byte-identical to prior behaviour); the concatenated text is unchanged either way.
   */
  boldNumbers?: boolean;
  /**
   * Per-slot style overrides, merged LAST so the consumer always wins — including over
   * the inline theme colours. Omit for the shared defaults.
   */
  styleOverrides?: PagerStyleOverrides;
  testID?: string;
}

export function Pager({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  rowsVariant = 'pills',
  unitLabel,
  unitLabelSingular,
  showFirstLast = false,
  responsive = false,
  stackBreakpoint = CARD_STACK_BREAKPOINT,
  infoPrefix,
  boldNumbers = false,
  styleOverrides: o,
  testID = TABLE_TEST_IDS.pager,
}: PagerProps): React.ReactElement {
  const { theme, t } = useUi();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const isDropdown = rowsVariant === 'dropdown';
  // Below the breakpoint (opt-in) collapse to Prev/Next + count only — drop the rows-per-page
  // control and the First/Last jumps, mirroring the DataTable's card-stack behaviour.
  const isCompact = responsive && width < stackBreakpoint;

  const lastPage = Math.max(FIRST_PAGE, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, FIRST_PAGE), lastPage);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);
  const hasUnit = unitLabel !== undefined && unitLabel !== '';
  // Singularise the unit noun when exactly one row matches (needs both a base unit AND a singular).
  const resolvedUnit = total === 1 && unitLabelSingular !== undefined && unitLabelSingular !== '' ? unitLabelSingular : unitLabel;
  const hasPrefix = infoPrefix !== undefined && infoPrefix !== '';
  const prefix = hasPrefix ? `${infoPrefix} ` : '';
  const ofWord = t(TABLE_I18N.pagerInfo);
  const unitSuffix = hasUnit ? ` ${resolvedUnit}` : '';
  const count = `${from.toLocaleString()}${EN_DASH}${to.toLocaleString()} ${ofWord} ${total.toLocaleString()}`;
  const info = `${prefix}${count}${unitSuffix}`;
  const boldStyle = { color: colors.text, fontWeight: BOLD };

  return (
    <View style={[c.pager, o?.pager]} testID={testID}>
      <Text style={[c.pagerInfo, { color: colors.textSecondary }, o?.pagerInfo]} testID={TABLE_TEST_IDS.pagerInfo}>
        {boldNumbers ? (
          <>
            {prefix}
            <Text style={boldStyle}>{from.toLocaleString()}</Text>
            {EN_DASH}
            <Text style={boldStyle}>{to.toLocaleString()}</Text>
            {` ${ofWord} `}
            <Text style={boldStyle}>{total.toLocaleString()}</Text>
            {unitSuffix}
          </>
        ) : (
          info
        )}
      </Text>
      <PagerNav
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        onPageChange={onPageChange}
        safePage={safePage}
        lastPage={lastPage}
        isCompact={isCompact}
        isDropdown={isDropdown}
        showFirstLast={showFirstLast}
        testID={testID}
        styleOverrides={o}
      />
    </View>
  );
}

export default Pager;
