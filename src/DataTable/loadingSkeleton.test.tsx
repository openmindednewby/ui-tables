import { render, screen } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { TableDefaultsProvider } from './TableDefaults';
import { TableDensity } from './TableDensity';
import { TableSkeletonRows } from './TableSkeletonRows';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => (key === TABLE_I18N.loading ? 'Loading' : key);

interface Person { id: string; name: string }
const columns: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name },
  { key: 'id', header: 'Id', render: (r) => r.id, numeric: true },
];
const keyOf = (r: Person): string => r.id;

const renderInKit = (node: React.ReactElement): void => {
  render(<UiProvider t={t} theme={theme}>{node}</UiProvider>);
};

describe('DataTable loadingSkeletonRows', () => {
  it('with a first load and skeleton rows set, renders the real header over that many placeholder rows', () => {
    const table = <DataTable rowAction={{ none: 'test table' }} columns={columns} keyExtractor={keyOf} loading loadingSkeletonRows={3} rows={[]} stackBreakpoint={0} testID="grid" />;

    renderInKit(table);

    expect([screen.getAllByTestId(TABLE_TEST_IDS.head).length, screen.getAllByTestId(/^grid-skeleton-row-/).length, screen.queryByText('Loading')]).toEqual([1, 3, null]);
  });

  it('with skeleton rows from TableDefaults, uses them when the table sets none', () => {
    const table = (
      <TableDefaultsProvider density={TableDensity.Compact} loadingSkeletonRows={2}>
        <DataTable rowAction={{ none: 'test table' }} columns={columns} keyExtractor={keyOf} loading rows={[]} stackBreakpoint={0} testID="grid" />
      </TableDefaultsProvider>
    );

    renderInKit(table);

    expect(screen.getAllByTestId(/^grid-skeleton-row-/)).toHaveLength(2);
  });

  it('with no skeleton rows configured, keeps the loading text', () => {
    const table = <DataTable rowAction={{ none: 'test table' }} columns={columns} keyExtractor={keyOf} loading rows={[]} testID="grid" />;

    renderInKit(table);

    expect([screen.getByText('Loading') !== null, screen.queryAllByTestId(/^grid-skeleton-row-/).length]).toEqual([true, 0]);
  });

  it('with skeleton rows set but loading finished, shows the empty state instead', () => {
    const table = <DataTable rowAction={{ none: 'test table' }} columns={columns} keyExtractor={keyOf} loading={false} loadingSkeletonRows={3} rows={[]} testID="grid" />;

    renderInKit(table);

    expect(screen.queryAllByTestId(/^grid-skeleton-row-/)).toHaveLength(0);
  });
});

describe('TableSkeletonRows', () => {
  it('with a loading label, names the busy region for assistive tech', () => {
    const rows = <TableSkeletonRows accessibilityLabel="Loading people" columns={columns} rows={1} testID="sk" />;

    renderInKit(rows);

    expect(screen.getByTestId('sk').getAttribute('aria-label')).toBe('Loading people');
  });
});
