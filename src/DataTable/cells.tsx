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
export type CellStyleOverrides = Pick<DataTableStyleOverrides, 'cell' | 'numCell' | 'cellWrap'>;

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
  /**
   * Give the cell its ARIA `cell` role. Set only when the table opted into keyboard
   * navigation, where it really is a grid: a `role="row"` with structureless children is a
   * broken grid, and promising a structure you do not deliver is worse for a screen-reader
   * user than claiming none. A plain table keeps the roles it has always had.
   *
   * `cell` rather than `gridcell` on purpose. `gridcell` advertises a cell that
   * participates in grid navigation, and these do not: focus roves at the ROW level (see
   * `useRovingFocus`), so a gridcell would promise a tab stop that does not exist. ARIA 1.2
   * lists `cell` among `row`'s required owned elements, so this is a valid grid — and it is
   * also the only one of the two that React Native types (`Role` has `cell`, not
   * `gridcell`), which keeps this off the web-only escape hatch entirely.
   */
  inGrid?: boolean;
}

/**
 * A single desktop cell — renders `col.render(row)` exactly ONCE (POC bug fix).
 *
 * The cell's wrapping `View` is overridable via the `cellWrap` slot. That matters:
 * `cell` is a TextStyle and so only reaches cells whose `render` returns a string —
 * `cellWrap` reaches EVERY cell, including ones rendering a custom node (a badge, a
 * link, an action menu), which is what a consumer needs for true pixel-parity.
 */
export function DesktopCell<T>({ column, row, textColor, testID, styleOverrides, inGrid }: DesktopCellProps<T>): React.ReactElement {
  return (
    <View
      style={[
        { flex: column.weight ?? 1, alignItems: column.numeric ? 'flex-end' : 'flex-start' },
        styleOverrides?.cellWrap,
      ]}
      testID={testID}
      {...(inGrid === true ? { role: 'cell' as const } : null)}
    >
      {cellContent(column, row, textColor, styleOverrides)}
    </View>
  );
}
