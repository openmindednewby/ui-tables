/**
 * DataTable — the shared, tokenized RN-web grid for every dloizides.com surface
 * (and the future AML v2 portal). Promoted from the POC draft; completes the
 * `wwwroot/shared/GRID.md` behavioural contract in the RN idiom:
 *
 * - columns + rows API (unchanged from the POC — it is the right shape).
 * - sticky header (`stickyHeader`), zebra striping (`zebra`), per-row tint.
 * - a responsive label:value **card-stack** below `stackBreakpoint` via
 *   `useWindowDimensions` (the CSS `data-label` card-stack does not port).
 * - per-row `testID` + `accessibilityLabel`/`accessibilityHint` (kit standard).
 * - every colour from `useUi().theme`; every component-authored string via `t`.
 */
import React, { useCallback } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { CARD_STACK_BREAKPOINT, TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { STICKY_HEADER_STYLE, tableStyles as s } from './styles';
import type { DataTableColumn, DataTableProps } from './types';

const FIRST_ROW_INDEX = 0;

/** A single desktop cell — renders `col.render(row)` exactly ONCE (POC bug fix). */
function DesktopCell<T>({ column, row, textColor, testID }: { column: DataTableColumn<T>; row: T; textColor: string; testID: string }): React.ReactElement {
  const content = column.render(row);
  return (
    <View style={{ flex: column.weight ?? 1, alignItems: column.numeric ? 'flex-end' : 'flex-start' }} testID={testID}>
      {typeof content === 'string' ? (
        <Text style={[s.cell, column.numeric ? s.numCell : null, { color: textColor }]}>{content}</Text>
      ) : (
        content
      )}
    </View>
  );
}

export function DataTable<T>(props: DataTableProps<T>): React.ReactElement {
  const {
    columns, rows, keyExtractor, rowTint, zebra, stickyHeader, onRowPress,
    getRowAccessibilityLabel, loading, loadingLabel, emptyLabel,
    stackBreakpoint = CARD_STACK_BREAKPOINT, testID = TABLE_TEST_IDS.root,
  } = props;

  const { theme, t } = useUi();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const stacked = width < stackBreakpoint;
  const frame = { backgroundColor: colors.surface, borderColor: colors.border };

  const rowBackground = useCallback(
    (row: T, index: number): string | undefined => {
      const tint = rowTint?.(row);
      if (tint) return tint;
      return zebra && index % 2 === 1 ? colors.background : undefined;
    },
    [rowTint, zebra, colors.background],
  );

  if (loading) {
    return (
      <View style={[s.wrap, frame]} testID={testID}>
        <View style={s.state}>
          <Text style={[s.stateText, { color: colors.textSecondary }]}>{loadingLabel ?? t(TABLE_I18N.loading)}</Text>
        </View>
      </View>
    );
  }
  if (rows.length === 0) {
    return (
      <View style={[s.wrap, frame]} testID={testID}>
        <View style={s.state}>
          <Text style={[s.stateText, { color: colors.textSecondary }]}>{emptyLabel ?? t(TABLE_I18N.empty)}</Text>
        </View>
      </View>
    );
  }

  const rowTestID = (key: string): string => `${testID}-row-${key}`;
  const rowA11y = (row: T): { accessibilityLabel: string; accessibilityHint: string; accessibilityRole: 'button' | 'text' } => ({
    accessibilityLabel: getRowAccessibilityLabel?.(row) ?? t(TABLE_I18N.rowLabel),
    accessibilityHint: t(TABLE_I18N.rowHint),
    accessibilityRole: onRowPress ? 'button' : 'text',
  });

  // --- mobile: label:value card-stack (GRID.md) ---
  if (stacked) {
    return (
      <View style={[s.wrap, frame]} testID={testID}>
        {rows.map((row, i) => {
          const key = keyExtractor(row);
          const bg = rowBackground(row, i);
          return (
            <Pressable
              key={key}
              testID={rowTestID(key)}
              disabled={!onRowPress}
              onPress={onRowPress ? () => onRowPress(row) : undefined}
              {...rowA11y(row)}
              style={[s.card, { borderTopColor: colors.border }, i === FIRST_ROW_INDEX ? { borderTopWidth: 0 } : null, bg ? { backgroundColor: bg } : null]}
            >
              {columns.map((col) => (
                <View key={col.key} style={s.cardLine}>
                  <Text style={[s.cardLabel, { color: colors.textSecondary }]}>{col.header}</Text>
                  <View style={s.cardValue}>{col.render(row)}</View>
                </View>
              ))}
            </Pressable>
          );
        })}
      </View>
    );
  }

  // --- desktop: header + rows ---
  return (
    <View style={[s.wrap, frame]} testID={testID}>
      <View
        testID={TABLE_TEST_IDS.head}
        style={[s.headRow, { backgroundColor: colors.background }, stickyHeader ? STICKY_HEADER_STYLE : null]}
      >
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[s.headCell, { color: colors.textSecondary, flex: col.weight ?? 1, textAlign: col.numeric ? 'right' : 'left' }]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => {
        const key = keyExtractor(row);
        const bg = rowBackground(row, i);
        return (
          <Pressable
            key={key}
            testID={rowTestID(key)}
            disabled={!onRowPress}
            onPress={onRowPress ? () => onRowPress(row) : undefined}
            {...rowA11y(row)}
            style={[s.row, { borderTopColor: colors.border }, bg ? { backgroundColor: bg } : null]}
          >
            {columns.map((col) => (
              <DesktopCell key={col.key} column={col} row={row} textColor={colors.text} testID={`${rowTestID(key)}-${col.key}`} />
            ))}
          </Pressable>
        );
      })}
    </View>
  );
}

export default DataTable;
