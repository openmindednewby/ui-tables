import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { rowTestID } from '../DataTable/constants';
import { StatusTone } from '../StatusLedger/StatusTone';
import type { StatusLedgerLabels, StatusLedgerProps } from '../StatusLedger/types';
import type { AgeBand } from '../StatusLedger/utils/ageBands';
import { AGE_COLUMN_KEY, workQueueBandTestID, workQueueLedgerTestID } from './constants';
import { WorkQueue } from './WorkQueue';
import { WorkQueueVariant } from './WorkQueueVariant';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0a66c2' } },
  semantic: { error: { '500': '#dc2626' } },
};
const labels: StatusLedgerLabels = {
  status: 'Status', group: 'Group', search: 'Search', sortBy: 'Sort by', all: 'All',
  sortAscending: 'Asc', sortDescending: 'Desc', sortDirectionHint: 'Toggle', clear: 'Clear', clearHint: 'Clear filters',
  results: 'Results', needsLook: 'Needs a look', everythingElse: 'Everything else', allClear: 'All clear', empty: 'Nothing', actions: 'Actions',
};
const HOUR = 3_600_000;
const NOW = 1_700_000_000_000;
const QUEUE = 'queue';
const WIDE = 0;
const LIMIT = 72 * HOUR;

interface Item { id: string; startedAt: number }
const rows: Item[] = [
  { id: 'young', startedAt: NOW - 2 * HOUR },
  { id: 'old', startedAt: NOW - 50 * HOUR },
  { id: 'mid', startedAt: NOW - 30 * HOUR },
];
const bands: AgeBand[] = [
  { key: 'fresh', label: 'Under 24 h', minAgeMs: 0, tone: StatusTone.Neutral },
  { key: 'aging', label: '24 to 48 h', minAgeMs: 24 * HOUR, tone: StatusTone.Warn },
  { key: 'old', label: 'Over 48 h', minAgeMs: 48 * HOUR, tone: StatusTone.Bad },
];
const ledger: StatusLedgerProps<Item> = {
  rows,
  columns: [{ key: 'id', header: 'Id', render: (r) => r.id }],
  keyExtractor: (r) => r.id,
  getStatus: () => 'open',
  statusLabel: (s) => s,
  statusTone: () => StatusTone.Active,
  labels,
  breakpoint: WIDE,
  rowAction: { none: 'test queue' },
};
const durationStrings = { unknown: '-', lessThanMinute: '< 1 min', minutes: '{{n}} min', hours: '{{n}} h', days: '{{n}} d' };
const queueLabels = { age: 'Waiting', ageOfLimit: '{{age}} of {{limit}}', bandCount: '{{n}} items' };
const ledgerTable = `${workQueueLedgerTestID(QUEUE)}-table`;

function renderQueue(variant?: WorkQueueVariant): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <WorkQueue bands={bands} durationStrings={durationStrings} getStartedAt={(r) => r.startedAt} labels={queueLabels} ledger={ledger} limitMs={LIMIT} nowMs={NOW} testID={QUEUE} variant={variant} />
    </UiProvider>,
  );
}

const presentRows = (tableTestID: string): string[] => rows.map((r) => r.id).filter((id) => screen.queryByTestId(rowTestID(tableTestID, id)) !== null);
const rowOrder = (tableTestID: string): string[] => {
  const prefix = rowTestID(tableTestID, '');
  return [...document.querySelectorAll('[data-testid]')]
    .map((el) => el.getAttribute('data-testid') ?? '')
    .filter((id) => id.startsWith(prefix) && rows.some((r) => id === `${prefix}${r.id}`))
    .map((id) => id.slice(prefix.length));
};
const ageCell = (key: string): HTMLElement => screen.getByTestId(`${rowTestID(ledgerTable, key)}-${AGE_COLUMN_KEY}`);

describe('WorkQueue', () => {
  it('with no variant, groups rows into age bands with the oldest band first', () => {
    renderQueue();

    const shown = [...bands].reverse().map((b) => workQueueBandTestID(QUEUE, b.key)).filter((id) => screen.queryByTestId(id) !== null);

    expect(shown).toEqual([workQueueBandTestID(QUEUE, 'old'), workQueueBandTestID(QUEUE, 'aging'), workQueueBandTestID(QUEUE, 'fresh')]);
  });

  it('with no variant, puts each row in the band its age falls in', () => {
    renderQueue();

    const oldBandRows = presentRows(`${workQueueBandTestID(QUEUE, 'old')}-table`);

    expect(oldBandRows).toEqual(['old']);
  });

  it('with the table variant, orders rows oldest first', () => {
    renderQueue(WorkQueueVariant.Table);

    const order = rowOrder(ledgerTable);

    expect(order).toEqual(['old', 'mid', 'young']);
  });

  it('with the table variant, shows the waiting time in the age column', () => {
    renderQueue(WorkQueueVariant.Table);

    const text = ageCell('old').textContent;

    expect(text).toContain('2 d');
  });

  it('with the bar variant, labels the age against the limit', () => {
    renderQueue(WorkQueueVariant.Bar);

    const text = ageCell('mid').textContent;

    expect(text).toContain('1 d of 3 d');
  });
});
