import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { rowTestID } from './constants';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

interface Item { id: string }
const FLOOR = 140;
const TABLE = 'floor-table';
const NO_STACK = 0;
const columns: ReadonlyArray<DataTableColumn<Item>> = [
  { key: 'name', header: 'Name', render: (r) => r.id },
  { key: 'act', header: 'Act', minWidth: FLOOR, render: (r) => `act:${r.id}` },
];

function renderTable(): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <DataTable columns={columns} keyExtractor={(r) => r.id} rows={[{ id: 'a' }]} stackBreakpoint={NO_STACK} testID={TABLE} />
    </UiProvider>,
  );
}

describe('DataTable column minWidth', () => {
  it('with a minWidth, floors the desktop cell at that width', () => {
    renderTable();

    const cell = screen.getByTestId(`${rowTestID(TABLE, 'a')}-act`);

    expect(cell.style.minWidth).toBe(`${FLOOR}px`);
  });

  it('with a minWidth, floors the header cell at the same width so header and body stay aligned', () => {
    renderTable();

    const header = screen.getByText('Act');

    expect(header.style.minWidth).toBe(`${FLOOR}px`);
  });

  it('without a minWidth, leaves the cell free to shrink', () => {
    renderTable();

    const cell = screen.getByTestId(`${rowTestID(TABLE, 'a')}-name`);

    expect(cell.style.minWidth).toBe('');
  });
});
