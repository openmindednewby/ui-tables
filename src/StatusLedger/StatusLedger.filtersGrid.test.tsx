import { render, screen } from '@testing-library/react';

let mockWidth = 1280;
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native-web');
  return {
    ...actual,
    useWindowDimensions: (): { width: number; height: number; scale: number; fontScale: number } => ({ width: mockWidth, height: 800, scale: 1, fontScale: 1 }),
  };
});
const DESKTOP_WIDTH = 1280;
const PHONE_WIDTH = 360;

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

describe('StatusLedger filtersPlacement CardGrid', () => {
  beforeEach(() => {
    mockWidth = DESKTOP_WIDTH;
  });

  it('with the card-grid placement, lines the four filters up in one row with the actions and count on the line below', () => {
    renderLedger(LedgerFiltersPlacement.CardGrid);

    const card = screen.getByTestId(ledgerFiltersCardTestID(LEDGER));
    const bar = screen.getByTestId(`${LEDGER}-filters`);
    const [fieldsLine, footLine] = Array.from(bar.children) as HTMLElement[];
    process.stdout.write(`
`);

    expect(card).toContainElement(bar);
    expect(bar).toHaveStyle({ flexDirection: 'column' });
    expect(fieldsLine).toHaveStyle({ flexDirection: 'row' });
    expect(footLine).toHaveTextContent('Clear');
    expect(footLine).toHaveTextContent('1 Results');
    expect(fieldsLine).not.toHaveTextContent('Clear');
  });

  it('with the card-grid placement on desktop, draws the clear action 36 px tall', () => {
    renderLedger(LedgerFiltersPlacement.CardGrid);

    const clear = screen.getByTestId(`${LEDGER}-filters-clear`);

    expect(clear).toHaveStyle({ height: '36px' });
  });

  it('with the card-grid placement on a phone, stacks the filters and keeps the 44 px clear action', () => {
    mockWidth = PHONE_WIDTH;
    renderLedger(LedgerFiltersPlacement.CardGrid);

    const clear = screen.getByTestId(`${LEDGER}-filters-clear`);

    expect(clear).not.toHaveStyle({ height: '36px' });
    expect(screen.getByTestId(`${LEDGER}-filters`)).toHaveStyle({ flexDirection: 'row' });
  });
});
