import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { DataTable } from '../../DataTable/DataTable';
import { LedgerFilterBar } from '../../StatusLedger/components/LedgerFilterBar';
import { LedgerSection } from '../../StatusLedger/components/LedgerSection';
import { StatusPill } from '../../StatusLedger/components/StatusPill';
import { useLedgerView, useToneColor } from '../../StatusLedger/hooks/useLedgerView';
import type { StatusLedgerProps } from '../../StatusLedger/types';
import { groupByAgeBand, type AgeBand } from '../../StatusLedger/utils/ageBands';
import { fillTemplate } from '../../StatusLedger/utils/duration';
import { EMPTY_QUEUE_NO_ROW_ACTION, workQueueBandTestID } from '../constants';

const GAP = 12;
const COUNT_FONT = 13;

const styles = StyleSheet.create({
  root: { gap: GAP },
  heading: { flexDirection: 'row', alignItems: 'center', gap: GAP },
  count: { fontSize: COUNT_FONT },
});

export interface AgeBandQueueProps<T> {
  ledger: StatusLedgerProps<T> & { testID: string };
  ageOf: (row: T) => number | null;
  bands: readonly AgeBand[];
  bandCountLabel: string;
  testID: string;
}

/** Ledger rows grouped under age-band headings, oldest band first, with the ledger's filters on top. */
export function AgeBandQueue<T>({ ledger, ageOf, bands, bandCountLabel, testID }: AgeBandQueueProps<T>): React.ReactElement {
  const { theme } = useUi();
  const view = useLedgerView(ledger);
  const toneColor = useToneColor(ledger.toneColors);
  const groups = useMemo(() => groupByAgeBand(view.visible, ageOf, bands), [view.visible, ageOf, bands]);
  const { labels } = ledger;
  const nothingToGroup = ledger.loading === true || groups.length === 0;

  return (
    <View style={styles.root} testID={testID}>
      <LedgerFilterBar labels={labels} resultsCount={view.visible.length} testID={ledger.testID} view={view} />
      {nothingToGroup ? (
        <DataTable columns={view.tableColumns} emptyLabel={labels.empty} keyExtractor={ledger.keyExtractor} loading={ledger.loading} rowAction={{ none: EMPTY_QUEUE_NO_ROW_ACTION }} rows={[]} testID={`${ledger.testID}-table`} />
      ) : (
        groups.map(({ band, rows }) => (
          <LedgerSection
            columns={view.tableColumns}
            emptyLabel={labels.empty}
            heading={
              <View accessibilityRole="header" style={styles.heading}>
                <StatusPill color={toneColor(band.tone)} label={band.label} tone={band.tone} />
                <Text style={[styles.count, { color: theme.colors.textSecondary }]}>{fillTemplate(bandCountLabel, { n: String(rows.length) })}</Text>
              </View>
            }
            key={band.key}
            ledger={ledger}
            rows={rows}
            testID={workQueueBandTestID(testID, band.key)}
            title={band.label}
          />
        ))
      )}
    </View>
  );
}
