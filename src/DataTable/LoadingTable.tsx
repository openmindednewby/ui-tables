import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { densitySlotStyles, rowPaddingToCells } from './density';
import { tableStyles as s } from './styles';
import { TableDensity } from './TableDensity';
import { TableHeader } from './TableHeader';
import { TableSkeletonRows } from './TableSkeletonRows';
import type { DataTableColumn, DataTableStyleOverrides } from './types';

export interface LoadingTableProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: number;
  stacked: boolean;
  label: string;
  frameStyle: StyleProp<ViewStyle>;
  density?: TableDensity;
  stickyHeader?: boolean;
  styleOverrides?: DataTableStyleOverrides;
  testID: string;
}

/** A DataTable's first load: the real header over placeholder rows at the real row height, so nothing moves when the rows arrive. */
export function LoadingTable<T>({ columns, rows, stacked, label, frameStyle, density = TableDensity.Comfortable, stickyHeader, styleOverrides: o, testID }: LoadingTableProps<T>): React.ReactElement {
  const { colors } = useUi().theme;
  const dense = densitySlotStyles(density);
  const border = { borderTopColor: colors.border };
  const rowStyle = stacked ? [s.card, border, o?.card] : [s.row, dense?.row, rowPaddingToCells(dense), border, o?.row];
  return (
    <View aria-busy style={frameStyle} testID={testID}>
      {stacked ? null : <TableHeader columns={columns} density={density} inGrid={false} stickyHeader={stickyHeader} styleOverrides={o} />}
      <TableSkeletonRows columns={columns} loadingLabel={label} rows={rows} rowStyle={rowStyle} stacked={stacked} testID={`${testID}-skeleton`} />
    </View>
  );
}
