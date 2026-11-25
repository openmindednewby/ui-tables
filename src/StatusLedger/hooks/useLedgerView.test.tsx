import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { LedgerFilterKey } from '../LedgerFilterKey';
import { StatusTone } from '../StatusTone';
import type { StatusLedgerLabels, StatusLedgerProps } from '../types';
import { useLedgerView } from './useLedgerView';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const labels: StatusLedgerLabels = {
  status: 'Status', group: 'Group', search: 'Search', sortBy: 'Sort by', all: 'All',
  sortAscending: 'Asc', sortDescending: 'Desc', sortDirectionHint: 'Toggle', clear: 'Clear', clearHint: 'Clear filters',
  results: 'Results', needsLook: 'Needs a look', everythingElse: 'Everything else', allClear: 'All clear', empty: 'Nothing', actions: 'Actions',
  filtersTitle: 'Filters',
};
interface Row { id: string }

function wrapper({ children }: { children: ReactNode }): React.JSX.Element {
  return <UiProvider theme={theme} t={(key) => key}>{children}</UiProvider>;
}

function ledgerProps(searchSpan?: number): StatusLedgerProps<Row> {
  return {
    rows: [{ id: 'job-1' }],
    columns: [{ key: 'id', header: 'Id', render: (r: Row) => r.id }],
    keyExtractor: (r) => r.id,
    getStatus: () => 'ok',
    statusLabel: (s) => s,
    statusTone: () => StatusTone.Good,
    labels,
    rowAction: { none: 'hook test: rows open nothing' },
    searchSpan,
  };
}

describe('useLedgerView', () => {
  it('with a search span of 3, gives the search field a three-column span', () => {
    const props = ledgerProps(3);

    const { result } = renderHook(() => useLedgerView(props), { wrapper });

    const search = result.current.fields.find((f) => f.key === LedgerFilterKey.Search);
    expect(search?.gridSpan).toBe(3);
  });

  it('without a search span, leaves the search span unset so the grid default of 2 applies', () => {
    const props = ledgerProps();

    const { result } = renderHook(() => useLedgerView(props), { wrapper });

    const search = result.current.fields.find((f) => f.key === LedgerFilterKey.Search);
    expect(search?.gridSpan).toBeUndefined();
    expect(search?.grow).toBe(true);
  });
});
