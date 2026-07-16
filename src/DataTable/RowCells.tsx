/**
 * A row's contents, in whichever layout the table is in: the desktop cells, or the
 * label:value lines of the responsive card-stack.
 *
 * Split out of `DataTable` purely to keep that component within the size budget; the
 * markup and the style slots are unchanged from when both branches were inlined.
 */
import React from 'react';
import { Text, View } from 'react-native';

import { DesktopCell, cellContent } from './cells';
import { tableStyles as s } from './styles';
import type { DataTableColumn, DataTableStyleOverrides } from './types';

interface RowCellsProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  row: T;
  /** Card-stack (label:value lines) rather than the desktop grid. */
  stacked: boolean;
  /** The table opted into keyboard navigation ⇒ cells take their ARIA `cell` role. */
  inGrid: boolean;
  /** The row's test id — each cell derives `${rowTestID}-${column.key}` from it. */
  rowTestID: string;
  textColor: string;
  labelColor: string;
  styleOverrides?: DataTableStyleOverrides;
}

export function RowCells<T>({
  columns,
  row,
  stacked,
  inGrid,
  rowTestID,
  textColor,
  labelColor,
  styleOverrides: o,
}: RowCellsProps<T>): React.ReactElement {
  if (stacked) {
    return (
      <>
        {columns.map((col) => (
          <View key={col.key} style={[s.cardLine, o?.cardLine]}>
            <Text style={[s.cardLabel, { color: labelColor }, o?.cardLabel]}>{col.header}</Text>
            <View style={[s.cardValue, o?.cardValue]}>{cellContent(col, row, textColor, o)}</View>
          </View>
        ))}
      </>
    );
  }

  return (
    <>
      {columns.map((col) => (
        <DesktopCell
          key={col.key}
          column={col}
          inGrid={inGrid}
          row={row}
          styleOverrides={o}
          testID={`${rowTestID}-${col.key}`}
          textColor={textColor}
        />
      ))}
    </>
  );
}
