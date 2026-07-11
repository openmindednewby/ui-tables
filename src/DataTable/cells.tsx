/**
 * The DataTable's cell renderers, shared by BOTH branches (desktop grid + card-stack).
 *
 * Every style array here ends with the consumer's `styleOverrides` slot so an override
 * beats the base StyleSheet AND the inline theme colour (colours are never in the
 * StyleSheet in this kit — they are applied inline at render time).
 */
import React from 'react';
import { Text, View } from 'react-native';

import { tableStyles as s } from './styles';
import type { DataTableColumn, DataTableStyleOverrides } from './types';

/** The subset of the override slots a cell can consume. */
export type CellStyleOverrides = Pick<DataTableStyleOverrides, 'cell' | 'numCell'>;

/**
 * A column's rendered content, safe to place inside a `<View>`.
 *
 * A bare string/number child of a `<View>` warns on RN-web ("Unexpected text node")
 * and THROWS on real React Native — and these apps ship as native, so raw text must
 * always be wrapped in `<Text>`. Used by BOTH the desktop cell and the card-stack
 * value (the stacked branch previously rendered `col.render(row)` unwrapped).
 */
export function cellContent<T>(
  column: DataTableColumn<T>,
  row: T,
  textColor: string,
  overrides?: CellStyleOverrides,
): React.ReactNode {
  const content = column.render(row);
  if (typeof content === 'string' || typeof content === 'number') {
    return (
      <Text
        style={[
          s.cell,
          column.numeric ? s.numCell : null,
          { color: textColor },
          overrides?.cell,
          column.numeric ? overrides?.numCell : null,
        ]}
      >
        {content}
      </Text>
    );
  }
  return content;
}

interface DesktopCellProps<T> {
  column: DataTableColumn<T>;
  row: T;
  textColor: string;
  testID: string;
  styleOverrides?: CellStyleOverrides;
}

/** A single desktop cell — renders `col.render(row)` exactly ONCE (POC bug fix). */
export function DesktopCell<T>({ column, row, textColor, testID, styleOverrides }: DesktopCellProps<T>): React.ReactElement {
  return (
    <View style={{ flex: column.weight ?? 1, alignItems: column.numeric ? 'flex-end' : 'flex-start' }} testID={testID}>
      {cellContent(column, row, textColor, styleOverrides)}
    </View>
  );
}
