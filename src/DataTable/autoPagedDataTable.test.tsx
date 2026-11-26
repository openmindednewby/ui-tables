import { fireEvent, render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { AutoPagedDataTable } from './AutoPagedDataTable';
import { TABLE_I18N } from './constants';
import { TableDefaultsProvider } from './TableDefaults';
import { TableDensity } from './TableDensity';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0e5a7e' } },
  semantic: { error: { '500': '#b3261e' } },
};
const t: UiValue['t'] = (key) => key;
const NO_STACK = 0;
const PAGE_SIZE = 10;
const ROW_COUNT = 12;

interface Row { id: string }
const ROWS: readonly Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: `row-${i + 1}` }));
const COLUMNS: ReadonlyArray<DataTableColumn<Row>> = [{ key: 'id', header: 'Id', render: (r) => r.id }];

function renderTable(autoPage: boolean | undefined, autoPageSize: number | undefined): void {
  render(
    <UiProvider theme={theme} t={t}>
      <TableDefaultsProvider autoPageSize={autoPageSize} density={TableDensity.Compact}>
        <AutoPagedDataTable autoPage={autoPage} columns={COLUMNS} keyExtractor={(r) => r.id} rowAction={{ none: 'static' }} rows={ROWS} stackBreakpoint={NO_STACK} testID="t" />
      </TableDefaultsProvider>
    </UiProvider>,
  );
}

describe('AutoPagedDataTable', () => {
  it('with more rows than the default page size, shows the first page and a pager', () => {
    renderTable(undefined, PAGE_SIZE);

    const shown = [screen.queryByText('row-10'), screen.queryByText('row-11'), screen.queryByTestId('t-ui-pager')];

    expect(shown.map((node) => node !== null)).toEqual([true, false, true]);
  });

  it('after Next, shows the rest of the rows', () => {
    renderTable(undefined, PAGE_SIZE);

    fireEvent.click(screen.getByLabelText(TABLE_I18N.pagerNext));

    expect([screen.queryByText('row-1'), screen.queryByText('row-12')].map((node) => node !== null)).toEqual([false, true]);
  });

  it('with autoPage off, shows every row and no pager', () => {
    renderTable(false, PAGE_SIZE);

    const shown = [screen.queryByText('row-12'), screen.queryByTestId('t-ui-pager')];

    expect(shown.map((node) => node !== null)).toEqual([true, false]);
  });

  it('without a default page size, shows every row and no pager', () => {
    renderTable(undefined, undefined);

    const shown = [screen.queryByText('row-12'), screen.queryByTestId('t-ui-pager')];

    expect(shown.map((node) => node !== null)).toEqual([true, false]);
  });
});
