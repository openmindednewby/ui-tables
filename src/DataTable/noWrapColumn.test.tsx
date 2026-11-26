import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { DataTable } from './DataTable';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0e5a7e' } },
  semantic: { error: { '500': '#b3261e' } },
};
const t: UiValue['t'] = (key) => key;
const NO_STACK = 0;

interface Row { id: string; email: string }
const ROWS: readonly Row[] = [{ id: 'r1', email: 'auditor@example.test' }];

function renderColumn(noWrap: boolean | undefined): HTMLElement {
  const columns: ReadonlyArray<DataTableColumn<Row>> = [{ key: 'email', header: 'Email', noWrap, render: (r) => r.email }];
  render(
    <UiProvider theme={theme} t={t}>
      <DataTable columns={columns} keyExtractor={(r) => r.id} rowAction={{ none: 'static' }} rows={ROWS} stackBreakpoint={NO_STACK} testID="t" />
    </UiProvider>,
  );
  return screen.getByText('auditor@example.test');
}

describe('DataTable column noWrap', () => {
  it('with noWrap, the cell text keeps to one line', () => {
    const text = renderColumn(true);

    expect(getComputedStyle(text).whiteSpace).toBe('nowrap');
  });

  it('without noWrap, the cell text may wrap', () => {
    const text = renderColumn(undefined);

    expect(getComputedStyle(text).whiteSpace).not.toBe('nowrap');
  });
});
