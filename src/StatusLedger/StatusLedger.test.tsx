import { fireEvent, render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { rowDetailTestID, rowTestID } from '../DataTable/constants';
import { RelativeTime } from './components/RelativeTime';
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
  seenAt: number;
}

const labels: StatusLedgerLabels = {
  status: 'Status', group: 'Group', search: 'Search', sortBy: 'Sort by', all: 'All',
  sortAscending: 'Asc', sortDescending: 'Desc', sortDirectionHint: 'Toggle', clear: 'Clear', clearHint: 'Clear filters',
  results: 'Results', needsLook: 'Needs a look', everythingElse: 'Everything else', allClear: 'All clear', empty: 'Nothing', actions: 'Actions',
};
const NOW = 1_700_000_000_000;
const timeStrings = { justNow: 'now', never: 'never', minutes: '{{n}}m', hours: '{{n}}h', days: '{{n}}d' };
const seenTestID = (r: Job): string => `seen-${r.id}`;
const columns: ReadonlyArray<StatusLedgerColumn<Job>> = [
  { key: 'id', header: 'Id', render: (r) => r.id },
  { key: 'note', header: 'Note', render: (r) => `note:${r.id}` },
  { key: 'seen', header: 'Seen', render: (r) => <RelativeTime hint="Toggle time" nowMs={NOW} strings={timeStrings} testID={seenTestID(r)} value={r.seenAt} /> },
];
const rows: Job[] = [{ id: 'bad-job', status: 'failed', seenAt: NOW }, { id: 'ok-job', status: 'ok', seenAt: NOW }];
const NARROW_BREAKPOINT = 100000;
const LEDGER = 'ledger';

const WIDE_BREAKPOINT = 0;
const rowLabel = (r: Job): string => `Job ${r.id}`;

function renderLedger(breakpoint: number, onRowPress: (row: Job) => void, expandedRowKey?: string | null): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <StatusLedger
        breakpoint={breakpoint}
        columns={columns}
        expandedRowKey={expandedRowKey}
        getRowAccessibilityLabel={rowLabel}
        getStatus={(r) => r.status}
        keyExtractor={(r) => r.id}
        labels={labels}
        onRowPress={onRowPress}
        renderRowDetail={(r) => <span>{`detail:${r.id}`}</span>}
        rows={rows}
        statusLabel={(s) => s}
        statusTone={(s) => (s === 'failed' ? StatusTone.Bad : StatusTone.Good)}
        testID={LEDGER}
      />
    </UiProvider>,
  );
}

const renderNarrowLedger = (onRowPress: (row: Job) => void, expandedRowKey?: string | null): void => renderLedger(NARROW_BREAKPOINT, onRowPress, expandedRowKey);
const tableDetailTestID = (key: string): string => rowDetailTestID(`${LEDGER}-table`, key);

const sectionTable = (section: string): string => `${ledgerSectionTestID(LEDGER, section)}-table`;
const sectionRowTestID = (section: string, key: string): string => rowTestID(sectionTable(section), key);

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

  it('in the wide layout, pressing a plain text cell in the middle of a row fires onRowPress with that row', () => {
    const onRowPress = jest.fn();
    renderLedger(WIDE_BREAKPOINT, onRowPress);

    fireEvent.click(screen.getByText('note:ok-job'));

    expect(onRowPress).toHaveBeenCalledWith(rows[1]);
  });

  it('in the wide layout, pressing a time cell inside a row fires onRowPress with that row', () => {
    const onRowPress = jest.fn();
    renderLedger(WIDE_BREAKPOINT, onRowPress);

    fireEvent.click(screen.getByTestId(seenTestID(rows[1] as Job)));

    expect(onRowPress).toHaveBeenCalledWith(rows[1]);
  });

  it('in the wide layout, pressing a time cell inside a row still swaps it to the absolute time', () => {
    renderLedger(WIDE_BREAKPOINT, jest.fn());
    const cell = screen.getByTestId(seenTestID(rows[1] as Job));

    fireEvent.click(cell);

    expect(cell.textContent).toBe(new Date(NOW).toLocaleString());
  });

  it('in the wide layout, with an expanded row key, renders the detail directly under that row', () => {
    renderLedger(WIDE_BREAKPOINT, jest.fn(), 'ok-job');

    const row = screen.getByTestId(rowTestID(`${LEDGER}-table`, 'ok-job'));

    expect(row.nextElementSibling).toBe(screen.getByTestId(tableDetailTestID('ok-job')));
    expect(screen.getByText('detail:ok-job')).toBeTruthy();
  });

  it('in the wide layout, marks only the expanded row aria-expanded', () => {
    renderLedger(WIDE_BREAKPOINT, jest.fn(), 'ok-job');

    const states = ['ok-job', 'bad-job'].map((key) => screen.getByTestId(rowTestID(`${LEDGER}-table`, key)).getAttribute('aria-expanded'));

    expect(states).toEqual(['true', 'false']);
  });

  it('labels the detail region with its row accessibility label', () => {
    renderLedger(WIDE_BREAKPOINT, jest.fn(), 'ok-job');

    const label = screen.getByTestId(tableDetailTestID('ok-job')).getAttribute('aria-label');

    expect(label).toBe('Job ok-job');
  });

  it('with no expanded row key, renders no detail region', () => {
    renderLedger(WIDE_BREAKPOINT, jest.fn(), null);

    const detail = screen.queryByText(/^detail:/);

    expect(detail).toBeNull();
  });

  it('in the narrow layout, renders the detail directly under the expanded card', () => {
    renderNarrowLedger(jest.fn(), 'bad-job');

    const card = screen.getByTestId(sectionRowTestID('attention', 'bad-job'));

    expect(card.nextElementSibling).toBe(screen.getByTestId(rowDetailTestID(sectionTable('attention'), 'bad-job')));
  });
});
