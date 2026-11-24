import { render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { CardLineLayout } from './CardLineLayout';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#1f6feb' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => key;
const ALWAYS_STACKED = 100000;

interface User {
  id: string;
  email: string;
}

const COLUMNS: ReadonlyArray<DataTableColumn<User>> = [{ key: 'email', header: 'Email', render: (u) => u.email }];
const ROWS: readonly User[] = [{ id: 'u1', email: 'a@example.test' }];

function renderTable(cardLineLayout?: CardLineLayout): HTMLElement {
  render(
    <UiProvider t={t} theme={theme}>
      <DataTable
        rowAction={{ none: 'test table' }}
        cardLineLayout={cardLineLayout}
        columns={COLUMNS}
        keyExtractor={(u) => u.id}
        rows={ROWS}
        stackBreakpoint={ALWAYS_STACKED}
        testID="users"
      />
    </UiProvider>,
  );
  return screen.getByText('Email').parentElement as HTMLElement;
}

function layoutOf(line: HTMLElement): string[] {
  const label = getComputedStyle(line.children[0] as HTMLElement);
  return [getComputedStyle(line).flexDirection, getComputedStyle(line).justifyContent, label.textTransform];
}

describe('DataTable cardLineLayout', () => {
  it('with no cardLineLayout, stacks the uppercase label above the value', () => {
    const line = renderTable();

    expect(layoutOf(line)).toEqual(['column', '', 'uppercase']);
  });

  it('with CardLineLayout.Inline, puts the label left and the value right on one line', () => {
    const line = renderTable(CardLineLayout.Inline);

    expect(layoutOf(line)).toEqual(['row', 'space-between', 'none']);
  });
});
