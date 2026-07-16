/**
 * The DataTable's desktop header row: the optional select-all checkbox gutter, then one
 * cell per column.
 *
 * The gutter reads the SAME `selectCell` style every row uses — that shared width is the
 * only thing keeping the header aligned with the body once a checkbox column exists, so it
 * must never be duplicated with a local copy.
 */
import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { HeaderCheckboxState } from './headerCheckboxState';
import { SelectionCheckbox } from './SelectionCheckbox';
import { STICKY_HEADER_STYLE, selectionStyles as sel, tableStyles as s } from './styles';
import type { DataTableColumn, DataTableStyleOverrides } from './types';

/** The select-all wiring. Absent ⇒ the table is not selectable: no gutter, no node. */
export interface HeaderSelection {
  state: HeaderCheckboxState;
  onToggleAll: () => void;
  /** The checkbox's test id (derived from the table's, by `selectAllTestID`). */
  testID: string;
}

interface TableHeaderProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  stickyHeader?: boolean;
  selection?: HeaderSelection;
  /** The table opted into keyboard navigation ⇒ it is a real ARIA grid. */
  inGrid: boolean;
  styleOverrides?: DataTableStyleOverrides;
}

export function TableHeader<T>({ columns, stickyHeader, selection, inGrid, styleOverrides: o }: TableHeaderProps<T>): React.ReactElement {
  const { theme, t } = useUi();
  const { colors } = theme;

  return (
    <View
      style={[s.headRow, { backgroundColor: colors.background }, stickyHeader ? STICKY_HEADER_STYLE : null, o?.headRow]}
      testID={TABLE_TEST_IDS.head}
      {...(inGrid ? { role: 'row' as const } : null)}
    >
      {selection === undefined ? null : (
        <View style={[sel.selectCell, o?.selectCell]}>
          <SelectionCheckbox
            borderColor={colors.border}
            brandColor={theme.palette.primary['500']}
            hint={t(TABLE_I18N.selectAllHint)}
            label={t(TABLE_I18N.selectAll)}
            state={selection.state}
            surfaceColor={colors.surface}
            testID={selection.testID}
            onToggle={selection.onToggleAll}
          />
        </View>
      )}
      {columns.map((col) => (
        <Text
          key={col.key}
          style={[s.headCell, { color: colors.textSecondary, flex: col.weight ?? 1, textAlign: col.numeric ? 'right' : 'left' }, o?.headCell]}
          {...(inGrid ? { role: 'columnheader' as const } : null)}
        >
          {col.header}
        </Text>
      ))}
    </View>
  );
}
