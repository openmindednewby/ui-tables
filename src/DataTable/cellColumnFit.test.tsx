import { render, screen } from '@testing-library/react';
import { Text, View } from 'react-native';

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
const TABLE = 'fit-table';
const NEVER_STACK = 0;
const ALWAYS_STACK = 100000;
const LONG_EMAIL = 'accounts@harbourfreight-international-logistics.example';
const columns: ReadonlyArray<DataTableColumn<Item>> = [
  { key: 'email', header: 'Email', render: () => LONG_EMAIL },
  { key: 'name', header: 'Name', render: (r) => <View testID="custom-node"><Text>{r.id}</Text></View> },
  { key: 'total', header: 'Total', numeric: true, render: () => 1234 },
];

function renderTable(stackBreakpoint: number): void {
  render(
    <UiProvider theme={theme} t={(key) => key}>
      <DataTable columns={columns} keyExtractor={(r) => r.id} rows={[{ id: 'a' }]} stackBreakpoint={stackBreakpoint} testID={TABLE} />
    </UiProvider>,
  );
}

function contentMaxWidth(columnKey: string): string {
  const cell = screen.getByTestId(`${rowTestID(TABLE, 'a')}-${columnKey}`);
  return window.getComputedStyle(cell.firstElementChild as Element).maxWidth;
}

describe('DesktopCell', () => {
  it.each(['email', 'name', 'total'])('with %s content in the desktop grid, bounds the content to its column', (columnKey) => {
    renderTable(NEVER_STACK);

    const maxWidth = contentMaxWidth(columnKey);

    expect(maxWidth).toBe('100%');
  });
});

describe('RowCells', () => {
  it('in the card-stack, renders the value without the desktop column bound', () => {
    renderTable(ALWAYS_STACK);

    const value = screen.getByText(LONG_EMAIL);

    expect(window.getComputedStyle(value.parentElement as Element).maxWidth).not.toBe('100%');
  });
});
