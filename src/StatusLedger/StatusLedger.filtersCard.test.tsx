import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { ledgerFiltersCardTestID } from './constants';
import { LedgerFiltersPlacement } from './LedgerFiltersPlacement';
import { StatusLedger } from './StatusLedger';
import { StatusTone } from './StatusTone';
import type { StatusLedgerLabels } from './types';

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
const LEDGER = 'ledger';

function renderLedger(filtersPlacement?: LedgerFiltersPlacement): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <StatusLedger
        breakpoint={0}
        columns={[{ key: 'id', header: 'Id', render: (r: { id: string }) => r.id }]}
        filtersPlacement={filtersPlacement}
        getStatus={() => 'ok'}
        keyExtractor={(r) => r.id}
        labels={labels}
        rowAction={{ none: 'filters card test: rows open nothing' }}
        rows={[{ id: 'job-1' }]}
        statusLabel={(s) => s}
        statusTone={() => StatusTone.Good}
        testID={LEDGER}
      />
    </UiProvider>,
  );
}

describe('StatusLedger filtersPlacement', () => {
  it('with the card placement, puts the filter bar and its heading inside a separate card', () => {
    renderLedger(LedgerFiltersPlacement.Card);

    const card = screen.getByTestId(ledgerFiltersCardTestID(LEDGER));

    expect(card).toContainElement(screen.getByTestId(`${LEDGER}-filters`));
    expect(card).toHaveTextContent('Filters');
    expect(card).not.toContainElement(screen.getByTestId(`${LEDGER}-table`));
  });

  it('with the default placement, renders no filters card', () => {
    renderLedger();

    const card = screen.queryByTestId(ledgerFiltersCardTestID(LEDGER));

    expect(card).toBeNull();
  });
});
