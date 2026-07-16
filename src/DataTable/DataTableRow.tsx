/**
 * One row of the DataTable, in either layout: its a11y contract, its optional select
 * checkbox, its optional roving-tabindex wiring, its cells, and — when expanded — the
 * full-width detail panel that follows it.
 *
 * A module-level component ON PURPOSE. Defining it inside `DataTable`'s render body would
 * give it a fresh identity on every render and remount the whole row subtree on each hover
 * or selection change; that is why the previous inline `rowContainer` was a plain function
 * returning elements rather than a component. Lifted here, it gets a stable identity AND
 * `DataTable` gets to be an orchestrator instead of a pile of closures.
 *
 * The detail panel is returned as a SIBLING (via a Fragment, which adds no DOM node), so an
 * expanded row and its panel stay adjacent children of the table frame — i.e. the panel
 * still spans every column.
 */
import React from 'react';
import { View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TABLE_I18N, rowDetailTestID, rowSelectTestID, rowTestID } from './constants';
import { HeaderCheckboxState } from './headerCheckboxState';
import { RowCells } from './RowCells';
import { SelectionCheckbox } from './SelectionCheckbox';
import { tableStyles as s } from './styles';
import { TableRow, type RowA11y } from './TableRow';
import type { RovingFocus } from './useRovingFocus';
import type { TableSelection } from './useTableSelection';
import type { DataTableColumn, DataTableStyleOverrides } from './types';

export interface DataTableRowProps<T> {
  row: T;
  rowKey: string;
  /** The row frame's style, already composed by `DataTable` (zebra / tint / hover). */
  style: React.ComponentProps<typeof TableRow>['style'];
  columns: ReadonlyArray<DataTableColumn<T>>;
  /** Card-stack rather than the desktop grid. */
  stacked: boolean;
  /** The TABLE's test id; the row's and the checkbox's are derived from it. */
  tableTestID: string;
  selection: TableSelection;
  keyboardNavigation: boolean;
  roving: RovingFocus;
  onRowPress?: (row: T) => void;
  getRowAccessibilityLabel?: (row: T) => string;
  renderRowDetail?: (row: T) => React.ReactNode;
  /** This row is currently expanded (computed by the parent from `expandedRowKeys`). */
  expanded: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  styleOverrides?: DataTableStyleOverrides;
}

export function DataTableRow<T>({
  row,
  rowKey,
  style,
  columns,
  stacked,
  tableTestID,
  selection,
  keyboardNavigation,
  roving,
  onRowPress,
  getRowAccessibilityLabel,
  renderRowDetail,
  expanded,
  onHoverIn,
  onHoverOut,
  styleOverrides: o,
}: DataTableRowProps<T>): React.ReactElement {
  const { theme, t } = useUi();
  const { colors } = theme;
  const rowID = rowTestID(tableTestID, rowKey);
  const isExpandable = renderRowDetail !== undefined;
  const { selectable } = selection;
  const isSelected = selectable && selection.isSelected(rowKey);

  /**
   * Each block is additive and gated on the feature that earns it, so a table that opted
   * into nothing carries exactly the props it did before any of this existed. Both states
   * are emitted in BOTH spellings: `accessibilityState` (RN native) and the `aria-*` prop
   * (react-native-web ≥ 0.19 dropped the legacy mapping).
   */
  const a11y: RowA11y = {
    accessibilityLabel: getRowAccessibilityLabel?.(row) ?? t(TABLE_I18N.rowLabel),
    accessibilityHint: t(TABLE_I18N.rowHint),
    accessibilityRole: onRowPress ? 'button' : 'text',
    ...(isExpandable || selectable
      ? { accessibilityState: { ...(isExpandable ? { expanded } : null), ...(selectable ? { selected: isSelected } : null) } }
      : null),
    ...(isExpandable ? { 'aria-expanded': expanded } : null),
    ...(selectable ? { 'aria-selected': isSelected } : null),
    // A navigable table is a real grid, so its rows are grid rows — selectable or not.
    // `role` wins over `accessibilityRole` on RNW.
    ...(keyboardNavigation ? { role: 'row' as const } : null),
  };

  const rowNode = (
    <TableRow
      a11y={a11y}
      keyboard={
        keyboardNavigation
          ? {
              tabIndex: roving.tabIndexFor(rowKey),
              onKeyDown: roving.keyDownFor(rowKey),
              onFocus: () => roving.onRowFocus(rowKey),
              registerNode: (node: unknown) => roving.registerRow(rowKey, node),
            }
          : undefined
      }
      selectionSlot={
        selectable ? (
          <SelectionCheckbox
            borderColor={colors.border}
            brandColor={theme.palette.primary['500']}
            hint={t(TABLE_I18N.selectRowHint)}
            // Labelled with the ROW's name, so it announces "Instruction ABC, checkbox"
            // rather than an anonymous "checkbox" repeated down the page.
            label={getRowAccessibilityLabel?.(row) ?? t(TABLE_I18N.selectRow)}
            state={isSelected ? HeaderCheckboxState.All : HeaderCheckboxState.None}
            surfaceColor={colors.surface}
            testID={rowSelectTestID(tableTestID, rowKey)}
            onToggle={() => selection.toggleRow(rowKey)}
          />
        ) : undefined
      }
      stacked={stacked}
      style={style}
      testID={rowID}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPress={onRowPress === undefined ? undefined : () => onRowPress(row)}
    >
      <RowCells
        columns={columns}
        inGrid={keyboardNavigation}
        labelColor={colors.textSecondary}
        row={row}
        rowTestID={rowID}
        stacked={stacked}
        styleOverrides={o}
        textColor={colors.text}
      />
    </TableRow>
  );

  // Omitting `renderRowDetail` is a no-op on the output: no wrapper, no extra node.
  if (!isExpandable || !expanded) return rowNode;
  return (
    <>
      {rowNode}
      <View
        accessibilityLabel={t(TABLE_I18N.rowDetail)}
        accessibilityRole="summary"
        style={[s.rowDetail, { borderTopColor: colors.border, backgroundColor: colors.background }, o?.rowDetail]}
        testID={rowDetailTestID(tableTestID, rowKey)}
      >
        {renderRowDetail(row)}
      </View>
    </>
  );
}
