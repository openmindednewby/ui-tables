import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import { TABLE_I18N, TABLE_TEST_IDS } from './constants';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};

// A translate that returns readable English for the kit keys — mirrors what an app
// wires into its UiProvider. Proves the component routes chrome text through `t`.
const T_MAP: Record<string, string> = {
  [TABLE_I18N.loading]: 'Loading',
  [TABLE_I18N.empty]: 'No rows',
  [TABLE_I18N.rowLabel]: 'Row',
  [TABLE_I18N.rowHint]: 'Row hint',
};
const t: UiValue['t'] = (key) => T_MAP[key] ?? key;

interface Person {
  id: string;
  name: string;
  score: number;
}
const columns: ReadonlyArray<DataTableColumn<Person>> = [
  { key: 'name', header: 'Name', weight: 2, render: (r) => r.name },
  { key: 'score', header: 'Score', numeric: true, render: (r) => String(r.score) },
];
const rows: Person[] = [
  { id: 'a', name: 'Ada', score: 10 },
  { id: 'b', name: 'Bo', score: 20 },
];

function renderTable(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('DataTable', () => {
  it('renders headers and one row per datum with a stable per-row testID', () => {
    // stackBreakpoint=0 forces the desktop path (width is always >= 0), so the
    // header appears once rather than once-per-card (jsdom reports a narrow width).
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={0} testID="grid" />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByTestId('grid-row-a')).toBeTruthy();
    expect(screen.getByTestId('grid-row-b')).toBeTruthy();
    expect(screen.getByText('Ada')).toBeTruthy();
  });

  it('calls each column render EXACTLY once per row (no POC double-render)', () => {
    const renderName = jest.fn((r: Person) => r.name);
    const spyColumns: ReadonlyArray<DataTableColumn<Person>> = [{ key: 'name', header: 'Name', render: renderName }];
    renderTable(<DataTable columns={spyColumns} rows={rows} keyExtractor={(r) => r.id} testID="grid" />);
    expect(renderName).toHaveBeenCalledTimes(rows.length);
  });

  it('shows the translated loading state via `t`', () => {
    renderTable(<DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} loading testID="grid" />);
    expect(screen.getByText('Loading')).toBeTruthy();
  });

  it('shows the translated empty state via `t` when there are no rows', () => {
    renderTable(<DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} testID="grid" />);
    expect(screen.getByText('No rows')).toBeTruthy();
  });

  it('prefers a caller-supplied (already-translated) empty label over the key', () => {
    renderTable(<DataTable columns={columns} rows={[]} keyExtractor={(r) => r.id} emptyLabel="Nothing here" testID="grid" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('fires onRowPress with the pressed row', () => {
    const onRowPress = jest.fn();
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} onRowPress={onRowPress} testID="grid" />);
    fireEvent.click(screen.getByTestId('grid-row-b'));
    expect(onRowPress).toHaveBeenCalledWith(rows[1]);
  });

  it('collapses to the label:value card-stack below the breakpoint', () => {
    // jsdom width is 1024; a huge breakpoint forces the stacked branch.
    const HUGE = 5000;
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stackBreakpoint={HUGE} testID="grid" />);
    // header row (desktop-only) is absent; the row cards + labels render.
    expect(screen.queryByTestId(TABLE_TEST_IDS.head)).toBeNull();
    expect(screen.getAllByText('Name').length).toBe(rows.length); // one label per card
  });

  it('renders the desktop sticky header region when stickyHeader is set', () => {
    renderTable(<DataTable columns={columns} rows={rows} keyExtractor={(r) => r.id} stickyHeader stackBreakpoint={0} testID="grid" />);
    expect(screen.getByTestId(TABLE_TEST_IDS.head)).toBeTruthy();
  });
});
