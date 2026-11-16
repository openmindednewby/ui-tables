import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { CARD_STACK_BREAKPOINT } from '../../DataTable/constants';
import { DataTable } from '../../DataTable/DataTable';
import { pickRowAction } from '../../DataTable/rowAction';
import type { DataTableColumn } from '../../DataTable/types';
import type { StatusLedgerProps } from '../types';

const GAP = 12;
const HEADING_FONT = 15;
const HEADING_WEIGHT = '700' as const;

const styles = StyleSheet.create({
  root: { gap: GAP },
  heading: { fontSize: HEADING_FONT, fontWeight: HEADING_WEIGHT },
  note: { paddingVertical: GAP },
});

export const expandedKeys = (key: string | null | undefined): readonly string[] | undefined => (key === null || key === undefined ? undefined : [key]);

export interface LedgerSectionProps<T> {
  title: string;
  rows: readonly T[];
  columns: ReadonlyArray<DataTableColumn<T>>;
  emptyLabel: string;
  testID: string;
  ledger: StatusLedgerProps<T>;
  heading?: React.ReactNode;
}

/** One titled group of ledger rows; `heading` replaces the default "title · count" header. */
export function LedgerSection<T>({ title, rows, columns, emptyLabel, testID, ledger, heading }: LedgerSectionProps<T>): React.ReactElement {
  const { theme } = useUi();
  return (
    <View style={styles.root} testID={testID}>
      {heading ?? <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>{`${title} · ${rows.length}`}</Text>}
      {rows.length === 0 ? (
        <Text style={[styles.note, { color: theme.colors.textSecondary }]}>{emptyLabel}</Text>
      ) : (
        <DataTable
          columns={columns}
          expandedRowKeys={expandedKeys(ledger.expandedRowKey)}
          getRowAccessibilityLabel={ledger.getRowAccessibilityLabel}
          getRowDetailAccessibilityLabel={ledger.getRowAccessibilityLabel}
          keyExtractor={ledger.keyExtractor}
          {...pickRowAction(ledger)}
          renderRowDetail={ledger.renderRowDetail}
          rows={rows}
          stackBreakpoint={ledger.breakpoint ?? CARD_STACK_BREAKPOINT}
          testID={`${testID}-table`}
        />
      )}
    </View>
  );
}
