import { fireEvent, render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { rowTestID } from '../DataTable/constants';
import { ledgerSectionTestID } from './constants';
import { StatusLedger } from './StatusLedger';
import { StatusTone } from './StatusTone';
import type { StatusLedgerColumn, StatusLedgerLabels } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

interface Job {
  id: string;
  status: string;
}

const labels: StatusLedgerLabels = {
  status: 'Status', group: 'Group', search: 'Search', sortBy: 'Sort by', all: 'All',
  sortAscending: 'Asc', sortDescending: 'Desc', sortDirectionHint: 'Toggle', clear: 'Clear', clearHint: 'Clear filters',
  results: 'Results', needsLook: 'Needs a look', everythingElse: 'Everything else', allClear: 'All clear', empty: 'Nothing', actions: 'Actions',
};
const columns: ReadonlyArray<StatusLedgerColumn<Job>> = [{ key: 'id', header: 'Id', render: (r) => r.id }];
const rows: Job[] = [{ id: 'bad-job', status: 'failed' }, { id: 'ok-job', status: 'ok' }];
const NARROW_BREAKPOINT = 100000;
const LEDGER = 'ledger';

function renderNarrowLedger(onRowPress: (row: Job) => void): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <StatusLedger
        breakpoint={NARROW_BREAKPOINT}
        columns={columns}
        getStatus={(r) => r.status}
        keyExtractor={(r) => r.id}
        labels={labels}
        onRowPress={onRowPress}
        rows={rows}
        statusLabel={(s) => s}
        statusTone={(s) => (s === 'failed' ? StatusTone.Bad : StatusTone.Good)}
        testID={LEDGER}
      />
    </UiProvider>,
  );
}

const sectionRowTestID = (section: string, key: string): string => rowTestID(`${ledgerSectionTestID(LEDGER, section)}-table`, key);

describe('StatusLedger', () => {
  it('in the narrow layout, gives every card row a testID derived from its section', () => {
    renderNarrowLedger(jest.fn());

    const ids = [sectionRowTestID('attention', 'bad-job'), sectionRowTestID('rest', 'ok-job')];

    expect(ids.map((id) => screen.queryByTestId(id))).not.toContain(null);
  });

  it('in the narrow layout, pressing a card row fires onRowPress with that row', () => {
    const onRowPress = jest.fn();
    renderNarrowLedger(onRowPress);

    fireEvent.click(screen.getByTestId(sectionRowTestID('attention', 'bad-job')));

    expect(onRowPress).toHaveBeenCalledWith(rows[0]);
  });
});
