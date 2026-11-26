import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cellContent } from './cells';
import type { DataTableColumn, DataTableStyleOverrides } from './types';

const TITLE_FONT = 15;
const SUMMARY_FONT = 13;
const LINE_GAP = 2;
const SEPARATOR = ' · ';
const LABEL_SEPARATOR = ': ';
const FIRST_COLUMN = 0;

const styles = StyleSheet.create({
  wrap: { gap: LINE_GAP },
  title: { fontSize: TITLE_FONT, fontWeight: '700' },
  summary: { fontSize: SUMMARY_FONT },
});

interface CompactCardLinesProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  row: T;
  rowTestID: string;
  textColor: string;
  labelColor: string;
  styleOverrides?: DataTableStyleOverrides;
}

function CompactTitle<T>({ column, row, rowTestID, textColor, styleOverrides: o }: { column: DataTableColumn<T>; row: T; rowTestID: string; textColor: string; styleOverrides?: DataTableStyleOverrides }): React.ReactElement {
  const testID = `${rowTestID}-${column.key}`;
  if (column.summaryText === undefined) {
    return <View testID={testID}>{cellContent(column, row, textColor, o)}</View>;
  }
  return <Text style={[styles.title, { color: textColor }]} testID={testID}>{column.summaryText(row)}</Text>;
}

/** The `CardLineLayout.Compact` card: the first column as a bold title, then every column with `summaryText` on one `Label: value · Label: value` line. */
export function CompactCardLines<T>({ columns, row, rowTestID, textColor, labelColor, styleOverrides: o }: CompactCardLinesProps<T>): React.ReactElement | null {
  const title = columns[FIRST_COLUMN];
  if (title === undefined) return null;
  const parts = columns.slice(FIRST_COLUMN + 1).flatMap((col) => (col.summaryText === undefined ? [] : [{ col, value: col.summaryText(row) }]));
  return (
    <View style={[styles.wrap, o?.cardLine]}>
      <CompactTitle column={title} row={row} rowTestID={rowTestID} styleOverrides={o} textColor={textColor} />
      {parts.length === 0 ? null : (
        <Text style={[styles.summary, { color: labelColor }]} testID={`${rowTestID}-summary`}>
          {parts.map(({ col, value }, i) => (
            <Text key={col.key} testID={`${rowTestID}-${col.key}`}>
              {i === FIRST_COLUMN ? '' : SEPARATOR}
              {`${col.header}${LABEL_SEPARATOR}`}
              <Text style={{ color: textColor }}>{value}</Text>
            </Text>
          ))}
        </Text>
      )}
    </View>
  );
}
