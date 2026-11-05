import React, { useMemo, useState } from 'react';

import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { MIN_TARGET_PX } from '../minTarget';
import { MonthGridColumns } from './MonthGridColumns';
import { chunkIntoRows, fitMonthGridColumns } from './monthGridLayout';

export const MONTH_STATUS_GRID_TEST_ID = 'month-status-grid';

/** The testID of one cell. */
export function monthCellTestID(gridTestID: string, cellId: string): string {
  return `${gridTestID}-cell-${cellId}`;
}

const GRID_GAP = 6;
const CELL_MIN_HEIGHT = 56;
const CELL_RADIUS = 8;
const CELL_PADDING_V = 6;
const CELL_INNER_GAP = 4;
const LABEL_SIZE = 14;
const SELECTED_BORDER = 2;
const COLOR_STEP = '500';

const styles = StyleSheet.create({
  grid: { gap: GRID_GAP },
  row: { flexDirection: 'row', gap: GRID_GAP },
  filler: { flex: 1 },
  cell: {
    flex: 1,
    minWidth: MIN_TARGET_PX,
    minHeight: CELL_MIN_HEIGHT,
    borderRadius: CELL_RADIUS,
    borderWidth: 1,
    paddingVertical: CELL_PADDING_V,
    alignItems: 'center',
    justifyContent: 'center',
    gap: CELL_INNER_GAP,
  },
  dashed: { borderStyle: 'dashed' },
  selected: { borderWidth: SELECTED_BORDER },
  label: { fontSize: LABEL_SIZE, fontWeight: '600', textAlign: 'center' },
});

export interface MonthStatusCell {
  id: string;
  label: string;
  icon?: React.ReactNode;
  statusLabel?: string;
  dashed?: boolean;
}

export interface MonthStatusGridProps {
  cells: readonly MonthStatusCell[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
  columns?: MonthGridColumns;
  accessibilityLabel: string;
  accessibilityHint?: string;
  cellHint: string;
  testID?: string;
}

interface CellProps {
  cell: MonthStatusCell;
  isSelected: boolean;
  onSelect: (id: string) => void;
  hint: string;
  testID: string;
}

const GridCell = ({ cell, isSelected, onSelect, hint, testID }: CellProps): React.ReactElement => {
  const { theme } = useUi();
  const { colors } = theme;
  const hasStatus = cell.statusLabel !== undefined && cell.statusLabel !== '';

  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={hasStatus ? `${cell.label}, ${String(cell.statusLabel)}` : cell.label}
      accessibilityRole="button"
      aria-pressed={isSelected}
      onPress={() => onSelect(cell.id)}
      style={[
        styles.cell,
        { backgroundColor: isSelected ? colors.background : colors.surface, borderColor: colors.border },
        cell.dashed === true && styles.dashed,
        isSelected && styles.selected,
        isSelected && { borderColor: theme.palette.primary[COLOR_STEP] },
      ]}
      testID={testID}
    >
      {cell.icon !== undefined && cell.icon !== null ? <View aria-hidden>{cell.icon}</View> : null}
      <Text style={[styles.label, { color: colors.text }]}>{cell.label}</Text>
    </Pressable>
  );
};

/** One selectable status cell per period, in 12, 6 or 4 columns, narrowing when a cell would drop below 44 px. */
export const MonthStatusGrid = ({
  cells,
  onSelect,
  selectedId = null,
  columns = MonthGridColumns.Twelve,
  accessibilityLabel,
  accessibilityHint,
  cellHint,
  testID = MONTH_STATUS_GRID_TEST_ID,
}: MonthStatusGridProps): React.ReactElement => {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const fitted = fitMonthGridColumns(columns, measuredWidth ?? windowWidth, GRID_GAP);
  const rows = useMemo(() => chunkIntoRows(cells, fitted), [cells, fitted]);
  const onLayout = (event: LayoutChangeEvent): void => setMeasuredWidth(event.nativeEvent.layout.width);

  return (
    <View accessibilityHint={accessibilityHint} accessibilityLabel={accessibilityLabel} onLayout={onLayout} role="group" style={styles.grid} testID={testID}>
      {rows.map((row) => (
        <View key={row[0]?.id} style={styles.row} testID={`${testID}-row`}>
          {row.map((cell) => (
            <GridCell
              cell={cell}
              hint={cellHint}
              isSelected={cell.id === selectedId}
              key={cell.id}
              onSelect={onSelect}
              testID={monthCellTestID(testID, cell.id)}
            />
          ))}
          {Array.from({ length: fitted - row.length }, (_, index) => (
            <View key={index} style={styles.filler} />
          ))}
        </View>
      ))}
    </View>
  );
};

export default MonthStatusGrid;
