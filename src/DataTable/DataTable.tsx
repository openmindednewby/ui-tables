/**
 * DataTable — the shared, tokenized RN-web grid for every dloizides.com surface
 * (and the future AML v2 portal). Promoted from the POC draft; completes the
 * `wwwroot/shared/GRID.md` behavioural contract in the RN idiom:
 *
 * - columns + rows API (unchanged from the POC — it is the right shape).
 * - sticky header (`stickyHeader`), zebra striping (`zebra`), per-row tint.
 * - a responsive label:value **card-stack** below `stackBreakpoint` via
 *   `useWindowDimensions` (the CSS `data-label` card-stack does not port).
 *   Pass `stackBreakpoint={0}` to keep the desktop grid at every width.
 * - per-row `testID` + `accessibilityLabel`/`accessibilityHint` (kit standard).
 * - optional CONTROLLED expandable rows: `renderRowDetail` + `expandedRowKeys`.
 * - optional CONTROLLED **bulk-select**: `selectedRowKeys` + `onSelectionChange` add a
 *   checkbox gutter; `matchingCount` + `onSelectAllMatchingChange` add the "select all N
 *   matching this filter" banner, which emits a **FLAG, never an id list**.
 * - optional **keyboard navigation** (`keyboardNavigation`): the ARIA grid roving-tabindex
 *   pattern — one tab stop for the whole grid, arrows to move, Space to select, Enter to
 *   activate. Off by default: giving rows a `tabIndex` changes a page's tab order.
 * - optional per-slot `styleOverrides`, merged LAST so a consumer that needs to be
 *   pixel-perfect beats both the base StyleSheet and the inline theme colour.
 * - every colour from `useUi().theme`; every component-authored string via `t`.
 *
 * **Omit the optional props and the table renders exactly as it always has** — that is the
 * contract every feature here is built to, and what keeps this a MINOR bump.
 *
 * **No virtualization, deliberately** (`zygos/docs/03-zy02-grid-spike.md`): this is a
 * server-paged table — that is what `Pager` and `FilterBar` are for — and paging already
 * buys everything virtualization would, without the surface area.
 *
 * This component is the ORCHESTRATOR: the frame, the state views, the header and the two
 * layout branches. A row's own behaviour lives in `DataTableRow`.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { CARD_STACK_BREAKPOINT, TABLE_I18N, TABLE_TEST_IDS, selectAllTestID } from './constants';
import { DataTableRow } from './DataTableRow';
import { SelectAllBanner } from './SelectAllBanner';
import { selectionStyles as sel, softBrandTint, tableStyles as s } from './styles';
import { TableHeader } from './TableHeader';
import { useRovingFocus } from './useRovingFocus';
import { useTableSelection } from './useTableSelection';
import type { DataTableProps } from './types';

const FIRST_ROW_INDEX = 0;
const EVEN = 0;
const ZEBRA_MODULUS = 2;

export function DataTable<T>(props: DataTableProps<T>): React.ReactElement {
  const {
    columns, rows, keyExtractor, rowTint, zebra, stickyHeader, onRowPress,
    getRowAccessibilityLabel, loading, loadingLabel, emptyLabel,
    renderRowDetail, expandedRowKeys, styleOverrides: o,
    selectedRowKeys, onSelectionChange, matchingCount, allMatchingSelected, onSelectAllMatchingChange,
    keyboardNavigation = false,
    stackBreakpoint = CARD_STACK_BREAKPOINT, testID = TABLE_TEST_IDS.root,
  } = props;

  const { theme, t } = useUi();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const stacked = width < stackBreakpoint;
  const frame = { backgroundColor: colors.surface, borderColor: colors.border };

  // Web row-hover highlight (v1 `.ui-table tr.clickable:hover`): only interactive rows
  // (those with `onRowPress`) tint on hover, so static rows never light up. The tint is
  // the theme's soft brand fill (re-themes per tenant), falling back to a subtle surface
  // tint. `onHoverIn`/`onHoverOut` are no-ops on native, so this is native-safe.
  const interactive = onRowPress !== undefined;
  const [hoveredKey, setHoveredKey] = useState<string | undefined>(undefined);
  const hoverTint = softBrandTint(theme.palette.primary['500']) ?? colors.background;

  // Computed ONCE per render and indexed into by both branches: `keyExtractor` is the
  // caller's function, and calling it twice per row (once for the key, once for selection
  // or focus) would double a cost the spike measured as linear in the row count.
  const rowKeys = useMemo(() => rows.map(keyExtractor), [rows, keyExtractor]);

  const selection = useTableSelection({
    pageKeys: rowKeys,
    selectedRowKeys,
    onSelectionChange,
    matchingCount,
    allMatchingSelected,
    onSelectAllMatchingChange,
  });

  const activateKey = useCallback(
    (key: string): void => {
      const row = rows[rowKeys.indexOf(key)];
      if (row !== undefined) onRowPress?.(row);
    },
    [rowKeys, rows, onRowPress],
  );

  const roving = useRovingFocus({
    rowKeys,
    enabled: keyboardNavigation,
    onToggleKey: selection.selectable ? selection.toggleRow : undefined,
    onActivateKey: interactive ? activateKey : undefined,
  });

  const rowBackground = useCallback(
    (row: T, index: number): string | undefined => {
      const tint = rowTint?.(row);
      if (tint) return tint;
      return zebra && index % ZEBRA_MODULUS !== EVEN ? colors.background : undefined;
    },
    [rowTint, zebra, colors.background],
  );

  /**
   * A row's background: the hover tint when this interactive row is hovered (wins over
   * zebra/rowTint, matching v1's `:hover td { background }`), otherwise the base tint.
   */
  const rowBg = (row: T, index: number, key: string): string | undefined =>
    interactive && hoveredKey === key ? hoverTint : rowBackground(row, index);

  /** Loading / empty share the frame + centred state block. */
  const stateView = (label: string): React.ReactElement => (
    <View style={[s.wrap, frame, o?.wrap]} testID={testID}>
      <View style={[s.state, o?.state]}>
        <Text style={[s.stateText, { color: colors.textSecondary }, o?.stateText]}>{label}</Text>
      </View>
    </View>
  );

  if (loading) return stateView(loadingLabel ?? t(TABLE_I18N.loading));
  if (rows.length === 0) return stateView(emptyLabel ?? t(TABLE_I18N.empty));

  /** One row, in whichever layout — `DataTableRow` owns everything below the frame style. */
  const renderRow = (row: T, key: string, style: React.ComponentProps<typeof DataTableRow>['style']): React.ReactElement => (
    <DataTableRow
      key={key}
      columns={columns}
      expanded={expandedRowKeys?.includes(key) ?? false}
      getRowAccessibilityLabel={getRowAccessibilityLabel}
      keyboardNavigation={keyboardNavigation}
      renderRowDetail={renderRowDetail}
      roving={roving}
      row={row}
      rowKey={key}
      selection={selection}
      stacked={stacked}
      style={style}
      styleOverrides={o}
      tableTestID={testID}
      onHoverIn={() => setHoveredKey(key)}
      onHoverOut={() => setHoveredKey((current) => (current === key ? undefined : current))}
      onRowPress={onRowPress}
    />
  );

  /** The select-all-matching banner. Renders nothing unless the consumer opted in. */
  const banner = (
    <SelectAllBanner
      actionTestID={`${testID}-${TABLE_TEST_IDS.selectBannerActionSuffix}`}
      matchingCount={selection.matchingCount}
      mode={selection.bannerMode}
      pageCount={rows.length}
      styleOverride={o?.selectBanner}
      testID={`${testID}-${TABLE_TEST_IDS.selectBannerSuffix}`}
      onAction={selection.toggleAllMatching}
    />
  );

  // --- mobile: label:value card-stack (GRID.md). Disabled by `stackBreakpoint={0}`. ---
  if (stacked) {
    return (
      <View style={[s.wrap, frame, o?.wrap]} testID={testID}>
        {banner}
        {rows.map((row, i) => {
          const key = rowKeys[i] ?? keyExtractor(row);
          const bg = rowBg(row, i, key);
          return renderRow(row, key, [
            s.card,
            { borderTopColor: colors.border },
            i === FIRST_ROW_INDEX ? { borderTopWidth: 0 } : null,
            // A selectable card puts the checkbox beside its lines, so the card becomes a row.
            selection.selectable ? sel.rowContent : null,
            bg ? { backgroundColor: bg } : null,
            o?.card,
          ]);
        })}
      </View>
    );
  }

  // --- desktop: header + rows ---
  return (
    <View
      style={[s.wrap, frame, o?.wrap]}
      testID={testID}
      // A navigable table is a real ARIA grid; a plain one keeps the roles it always had.
      {...(keyboardNavigation ? { role: 'grid' as const } : null)}
    >
      {banner}
      <TableHeader
        columns={columns}
        inGrid={keyboardNavigation}
        selection={
          selection.selectable
            ? { state: selection.headerState, onToggleAll: selection.toggleAll, testID: selectAllTestID(testID) }
            : undefined
        }
        stickyHeader={stickyHeader}
        styleOverrides={o}
      />
      {rows.map((row, i) => {
        const key = rowKeys[i] ?? keyExtractor(row);
        const bg = rowBg(row, i, key);
        return renderRow(row, key, [s.row, { borderTopColor: colors.border }, bg ? { backgroundColor: bg } : null, o?.row]);
      })}
    </View>
  );
}

export default DataTable;
