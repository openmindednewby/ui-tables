import React from 'react';

import { ActionButton } from '../../Filters/components/ActionButton';
import { Filters } from '../../Filters/Filters';
import { ledgerSortDirectionTestID } from '../constants';
import type { useLedgerView } from '../hooks/useLedgerView';
import { SortDirection } from '../SortDirection';
import type { StatusLedgerLabels } from '../types';

type LedgerFilterView = Pick<ReturnType<typeof useLedgerView>, 'values' | 'setValues' | 'clear' | 'fields' | 'direction' | 'toggleDirection'>;

export interface LedgerFilterBarProps {
  view: LedgerFilterView;
  labels: StatusLedgerLabels;
  resultsCount: number;
  testID: string;
}

/** The ledger's search, status, group and sort filters plus the sort-direction toggle. */
export function LedgerFilterBar({ view, labels, resultsCount, testID }: LedgerFilterBarProps): React.ReactElement {
  const ascending = view.direction === SortDirection.Asc;
  return (
    <Filters
      actions={
        <ActionButton
          hint={labels.sortDirectionHint}
          label={ascending ? labels.sortAscending : labels.sortDescending}
          onPress={view.toggleDirection}
          testID={ledgerSortDirectionTestID(testID)}
          tone="ghost"
        />
      }
      clearHint={labels.clearHint}
      clearLabel={labels.clear}
      fields={view.fields}
      onChange={view.setValues}
      onClear={view.clear}
      resultsCount={resultsCount}
      resultsLabel={labels.results}
      testID={`${testID}-filters`}
      values={view.values}
    />
  );
}
