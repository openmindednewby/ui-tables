import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CARD_STACK_BREAKPOINT } from '../DataTable/constants';
import { DataTable } from '../DataTable/DataTable';
import { pickRowAction } from '../DataTable/rowAction';
import { LedgerFilterBar } from './components/LedgerFilterBar';
import { LedgerSection, expandedKeys } from './components/LedgerSection';
import { ledgerSectionTestID, STATUS_LEDGER_TEST_ID } from './constants';
import { useLedgerView } from './hooks/useLedgerView';
import { LedgerLayout } from './LedgerLayout';
import type { StatusLedgerProps } from './types';

const GAP = 12;

const styles = StyleSheet.create({
  root: { gap: GAP },
});

/** Status-first ledger: one sortable, filterable table on wide screens, "needs a look first" on narrow ones. */
export function StatusLedger<T>(props: StatusLedgerProps<T>): React.ReactElement {
  const { labels, layout = LedgerLayout.Auto, breakpoint = CARD_STACK_BREAKPOINT, loading, testID = STATUS_LEDGER_TEST_ID } = props;
  const { width } = useWindowDimensions();
  const view = useLedgerView(props);
  const feed = layout === LedgerLayout.Feed || (layout === LedgerLayout.Auto && width < breakpoint);

  return (
    <View style={styles.root} testID={testID}>
      <LedgerFilterBar labels={labels} resultsCount={view.visible.length} testID={testID} view={view} />
      {feed && !loading ? (
        <>
          <LedgerSection columns={view.tableColumns} emptyLabel={labels.allClear} ledger={props} rows={view.split.attention} testID={ledgerSectionTestID(testID, 'attention')} title={labels.needsLook} />
          <LedgerSection columns={view.tableColumns} emptyLabel={labels.empty} ledger={props} rows={view.split.rest} testID={ledgerSectionTestID(testID, 'rest')} title={labels.everythingElse} />
        </>
      ) : (
        <DataTable
          columns={view.tableColumns}
          emptyLabel={labels.empty}
          expandedRowKeys={expandedKeys(props.expandedRowKey)}
          getRowAccessibilityLabel={props.getRowAccessibilityLabel}
          getRowDetailAccessibilityLabel={props.getRowAccessibilityLabel}
          keyExtractor={props.keyExtractor}
          loading={loading}
          {...pickRowAction(props)}
          renderRowDetail={props.renderRowDetail}
          rows={view.visible}
          stackBreakpoint={feed ? breakpoint : 0}
          testID={`${testID}-table`}
        />
      )}
    </View>
  );
}
