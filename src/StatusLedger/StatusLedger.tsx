import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { CARD_STACK_BREAKPOINT } from '../DataTable/constants';
import { DataTable } from '../DataTable/DataTable';
import type { DataTableColumn } from '../DataTable/types';
import { ActionButton } from '../Filters/components/ActionButton';
import { Filters } from '../Filters/Filters';
import { ledgerSectionTestID, ledgerSortDirectionTestID, STATUS_LEDGER_TEST_ID } from './constants';
import { useLedgerView } from './hooks/useLedgerView';
import { LedgerLayout } from './LedgerLayout';
import { SortDirection } from './SortDirection';
import type { StatusLedgerProps } from './types';

const GAP = 12;
const HEADING_FONT = 15;
const HEADING_WEIGHT = '700' as const;

const styles = StyleSheet.create({
  root: { gap: GAP },
  heading: { fontSize: HEADING_FONT, fontWeight: HEADING_WEIGHT },
  note: { paddingVertical: GAP },
});

interface SectionProps<T> {
  title: string;
  rows: readonly T[];
  columns: ReadonlyArray<DataTableColumn<T>>;
  emptyLabel: string;
  testID: string;
  ledger: StatusLedgerProps<T>;
}

function LedgerSection<T>({ title, rows, columns, emptyLabel, testID, ledger }: SectionProps<T>): React.ReactElement {
  const { theme } = useUi();
  return (
    <View style={styles.root} testID={testID}>
      <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>{`${title} · ${rows.length}`}</Text>
      {rows.length === 0 ? (
        <Text style={[styles.note, { color: theme.colors.textSecondary }]}>{emptyLabel}</Text>
      ) : (
        <DataTable
          columns={columns}
          getRowAccessibilityLabel={ledger.getRowAccessibilityLabel}
          keyExtractor={ledger.keyExtractor}
          onRowPress={ledger.onRowPress}
          rows={rows}
          stackBreakpoint={ledger.breakpoint ?? CARD_STACK_BREAKPOINT}
          testID={`${testID}-table`}
        />
      )}
    </View>
  );
}

/** Status-first ledger: one sortable, filterable table on wide screens, "needs a look first" on narrow ones. */
export function StatusLedger<T>(props: StatusLedgerProps<T>): React.ReactElement {
  const { labels, layout = LedgerLayout.Auto, breakpoint = CARD_STACK_BREAKPOINT, loading, testID = STATUS_LEDGER_TEST_ID } = props;
  const { width } = useWindowDimensions();
  const view = useLedgerView(props);
  const feed = layout === LedgerLayout.Feed || (layout === LedgerLayout.Auto && width < breakpoint);
  const ascending = view.direction === SortDirection.Asc;

  const directionButton = (
    <ActionButton
      hint={labels.sortDirectionHint}
      label={ascending ? labels.sortAscending : labels.sortDescending}
      onPress={view.toggleDirection}
      testID={ledgerSortDirectionTestID(testID)}
      tone="ghost"
    />
  );

  return (
    <View style={styles.root} testID={testID}>
      <Filters
        actions={directionButton}
        clearHint={labels.clearHint}
        clearLabel={labels.clear}
        fields={view.fields}
        onChange={view.setValues}
        onClear={view.clear}
        resultsCount={view.visible.length}
        resultsLabel={labels.results}
        testID={`${testID}-filters`}
        values={view.values}
      />
      {feed && !loading ? (
        <>
          <LedgerSection columns={view.tableColumns} emptyLabel={labels.allClear} ledger={props} rows={view.split.attention} testID={ledgerSectionTestID(testID, 'attention')} title={labels.needsLook} />
          <LedgerSection columns={view.tableColumns} emptyLabel={labels.empty} ledger={props} rows={view.split.rest} testID={ledgerSectionTestID(testID, 'rest')} title={labels.everythingElse} />
        </>
      ) : (
        <DataTable
          columns={view.tableColumns}
          emptyLabel={labels.empty}
          getRowAccessibilityLabel={props.getRowAccessibilityLabel}
          keyExtractor={props.keyExtractor}
          loading={loading}
          onRowPress={props.onRowPress}
          rows={view.visible}
          stackBreakpoint={feed ? breakpoint : 0}
          testID={`${testID}-table`}
        />
      )}
    </View>
  );
}
