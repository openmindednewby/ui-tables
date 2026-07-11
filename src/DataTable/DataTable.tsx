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
 * - optional CONTROLLED expandable rows: `renderRowDetail` + `expandedRowKeys`
 *   render a full-width detail panel between an expanded row and the next
 *   (desktop and card-stack alike). Omit both and the table renders exactly as
 *   it did before the feature existed.
 * - optional per-slot `styleOverrides`, merged LAST so a consumer that needs to be
 *   pixel-perfect beats both the base StyleSheet and the inline theme colour. The
 *   shared defaults never change for anyone who does not opt in.
 * - every colour from `useUi().theme`; every component-authored string via `t`.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { DesktopCell, cellContent } from './cells';
import { CARD_STACK_BREAKPOINT, TABLE_I18N, TABLE_TEST_IDS, rowDetailTestID, rowTestID } from './constants';
import { STICKY_HEADER_STYLE, softBrandTint, tableStyles as s } from './styles';
import type { DataTableProps } from './types';

const FIRST_ROW_INDEX = 0;

/**
 * The a11y props spread onto a row. The expanded state is emitted only when the
 * table is expandable, and via BOTH spellings: `accessibilityState` (RN native)
 * and `aria-expanded` (react-native-web ≥ 0.19 no longer maps the legacy prop).
 */
interface RowA11y {
  accessibilityLabel: string;
  accessibilityHint: string;
  accessibilityRole: 'button' | 'text';
  accessibilityState?: { expanded: boolean };
  'aria-expanded'?: boolean;
}

export function DataTable<T>(props: DataTableProps<T>): React.ReactElement {
  const {
    columns, rows, keyExtractor, rowTint, zebra, stickyHeader, onRowPress,
    getRowAccessibilityLabel, loading, loadingLabel, emptyLabel,
    renderRowDetail, expandedRowKeys, styleOverrides: o,
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

  const rowBackground = useCallback(
    (row: T, index: number): string | undefined => {
      const tint = rowTint?.(row);
      if (tint) return tint;
      return zebra && index % 2 === 1 ? colors.background : undefined;
    },
    [rowTint, zebra, colors.background],
  );

  /**
   * A row's background: the hover tint when this interactive row is hovered (wins over
   * zebra/rowTint, matching v1's `:hover td { background }`), otherwise the base tint.
   */
  const rowBg = (row: T, index: number, key: string): string | undefined =>
    interactive && hoveredKey === key ? hoverTint : rowBackground(row, index);

  /** Hover handlers for a row — wired only for interactive tables (no-op on native). */
  const hoverHandlers = (key: string): { onHoverIn: () => void; onHoverOut: () => void } | undefined =>
    interactive
      ? {
          onHoverIn: () => setHoveredKey(key),
          onHoverOut: () => setHoveredKey((current) => (current === key ? undefined : current)),
        }
      : undefined;

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

  const rowID = (key: string): string => rowTestID(testID, key);
  const isExpandable = renderRowDetail !== undefined;
  const isExpanded = (key: string): boolean => isExpandable && (expandedRowKeys?.includes(key) ?? false);

  const rowA11y = (row: T, key: string): RowA11y => ({
    accessibilityLabel: getRowAccessibilityLabel?.(row) ?? t(TABLE_I18N.rowLabel),
    accessibilityHint: t(TABLE_I18N.rowHint),
    accessibilityRole: onRowPress ? 'button' : 'text',
    // Only an expandable table announces expanded/collapsed — a plain table's rows
    // keep exactly the props they had before this feature existed.
    ...(isExpandable ? { accessibilityState: { expanded: isExpanded(key) }, 'aria-expanded': isExpanded(key) } : null),
  });

  /**
   * Pairs a rendered row with its detail panel when that row is expanded. When
   * `renderRowDetail` is omitted the row element is returned untouched (no extra
   * wrapper, no extra node) — omitting the props is a no-op on the output.
   */
  const withRowDetail = (rowNode: React.ReactElement, row: T, key: string): React.ReactElement => {
    if (!isExpandable || !isExpanded(key)) return rowNode;
    return (
      <React.Fragment key={key}>
        {rowNode}
        <View
          accessibilityLabel={t(TABLE_I18N.rowDetail)}
          accessibilityRole="summary"
          style={[s.rowDetail, { borderTopColor: colors.border, backgroundColor: colors.background }, o?.rowDetail]}
          testID={rowDetailTestID(testID, key)}
        >
          {renderRowDetail(row)}
        </View>
      </React.Fragment>
    );
  };

  // --- mobile: label:value card-stack (GRID.md). Disabled by `stackBreakpoint={0}`. ---
  if (stacked) {
    return (
      <View style={[s.wrap, frame, o?.wrap]} testID={testID}>
        {rows.map((row, i) => {
          const key = keyExtractor(row);
          const bg = rowBg(row, i, key);
          return withRowDetail(
            <Pressable
              key={key}
              testID={rowID(key)}
              disabled={!onRowPress}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
              {...hoverHandlers(key)}
              {...rowA11y(row, key)}
              style={[s.card, { borderTopColor: colors.border }, i === FIRST_ROW_INDEX ? { borderTopWidth: 0 } : null, bg ? { backgroundColor: bg } : null, o?.card]}
            >
              {columns.map((col) => (
                <View key={col.key} style={[s.cardLine, o?.cardLine]}>
                  <Text style={[s.cardLabel, { color: colors.textSecondary }, o?.cardLabel]}>{col.header}</Text>
                  <View style={[s.cardValue, o?.cardValue]}>{cellContent(col, row, colors.text, o)}</View>
                </View>
              ))}
            </Pressable>,
            row,
            key,
          );
        })}
      </View>
    );
  }

  // --- desktop: header + rows ---
  return (
    <View style={[s.wrap, frame, o?.wrap]} testID={testID}>
      <View
        testID={TABLE_TEST_IDS.head}
        style={[s.headRow, { backgroundColor: colors.background }, stickyHeader ? STICKY_HEADER_STYLE : null, o?.headRow]}
      >
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[s.headCell, { color: colors.textSecondary, flex: col.weight ?? 1, textAlign: col.numeric ? 'right' : 'left' }, o?.headCell]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => {
        const key = keyExtractor(row);
        const bg = rowBg(row, i, key);
        return withRowDetail(
          <Pressable
            key={key}
            testID={rowID(key)}
            disabled={!onRowPress}
            onPress={onRowPress ? () => onRowPress(row) : undefined}
            {...hoverHandlers(key)}
            {...rowA11y(row, key)}
            style={[s.row, { borderTopColor: colors.border }, bg ? { backgroundColor: bg } : null, o?.row]}
          >
            {columns.map((col) => (
              <DesktopCell key={col.key} column={col} row={row} textColor={colors.text} testID={`${rowID(key)}-${col.key}`} styleOverrides={o} />
            ))}
          </Pressable>,
          row,
          key,
        );
      })}
    </View>
  );
}

export default DataTable;
