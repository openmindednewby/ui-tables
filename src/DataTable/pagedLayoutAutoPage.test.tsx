import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { AutoPagedDataTable } from './AutoPagedDataTable';
import { PagedTableLayout } from './PagedTableLayout';
import { PagedTableLayoutKind } from './PagedTableLayoutKind';
import { Pager } from './Pager';
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
const noop = (): void => undefined;

interface Row { id: string }
const ROWS: readonly Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: `row-${i + 1}` }));
const COLUMNS: ReadonlyArray<DataTableColumn<Row>> = [{ key: 'id', header: 'Id', render: (r) => r.id }];

function renderInLayout(layout: PagedTableLayoutKind): void {
  render(
    <UiProvider theme={theme} t={t}>
      <TableDefaultsProvider autoPageSize={PAGE_SIZE} density={TableDensity.Compact}>
        <PagedTableLayout
          layout={layout}
          pager={<Pager page={1} pageSize={ROW_COUNT} total={ROW_COUNT} onPageChange={noop} testID="caller-pager" />}
          table={<AutoPagedDataTable columns={COLUMNS} keyExtractor={(r) => r.id} rowAction={{ none: 'static' }} rows={ROWS} stackBreakpoint={NO_STACK} testID="t" />}
        />
      </TableDefaultsProvider>
    </UiProvider>,
  );
}

describe('AutoPagedDataTable inside a PagedTableLayout', () => {
  it.each([PagedTableLayoutKind.Toolbar, PagedTableLayoutKind.Spaced, PagedTableLayoutKind.Footer, PagedTableLayoutKind.Panel])(
    'in the %s layout, adds no second pager and shows every row',
    (layout) => {
      renderInLayout(layout);

      const seen = [screen.queryByTestId('t-ui-pager'), screen.queryByText('row-12')];

      expect(seen.map((node) => node !== null)).toEqual([false, true]);
    },
  );
});
