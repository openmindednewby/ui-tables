import { render, screen } from '@testing-library/react';
import { View } from 'react-native';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { CellText } from './CellText';
import { DataTable } from './DataTable';
import type { DataTableColumn } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#0e5a7e' } },
  semantic: { error: { '500': '#b3261e' } },
};
const t: UiValue['t'] = (key) => key;
const NO_STACK = 0;
const ALWAYS_STACK = 100000;
const TWO_LINES = 2;
const FLOOR_PX = 180;
const EMAIL = 'e2e-admin@proovid-demo.local';

interface Row { id: string; email: string }
const ROWS: readonly Row[] = [{ id: 'r1', email: EMAIL }];

function renderTable(column: Partial<DataTableColumn<Row>>, stackBreakpoint = NO_STACK): void {
  const columns: ReadonlyArray<DataTableColumn<Row>> = [{ key: 'email', header: 'Email', render: (r) => <View><CellText>{r.email}</CellText></View>, ...column }];
  render(
    <UiProvider theme={theme} t={t}>
      <DataTable columns={columns} keyExtractor={(r) => r.id} rowAction={{ none: 'static' }} rows={ROWS} stackBreakpoint={stackBreakpoint} testID="t" />
    </UiProvider>,
  );
}

describe('CellText', () => {
  it('in a noWrap column with a custom cell, keeps the text to one line', () => {
    renderTable({ noWrap: true });

    expect(getComputedStyle(screen.getByText(EMAIL)).whiteSpace).toBe('nowrap');
  });

  it('in a column without noWrap, lets the text wrap', () => {
    renderTable({});

    expect(getComputedStyle(screen.getByText(EMAIL)).whiteSpace).not.toBe('nowrap');
  });

  it('in a maxLines column, puts the full text in the web title', () => {
    renderTable({ maxLines: TWO_LINES });

    expect(screen.getByText(EMAIL).getAttribute('title')).toBe(EMAIL);
  });

  it('outside a clamped column, sets no title', () => {
    renderTable({});

    expect(screen.getByText(EMAIL).getAttribute('title')).toBeNull();
  });
});

describe('DataTable column maxLines', () => {
  it('with a string cell, puts the full text in the web title', () => {
    renderTable({ maxLines: TWO_LINES, render: (r) => r.email });

    expect(screen.getByText(EMAIL).getAttribute('title')).toBe(EMAIL);
  });
});

describe('DataTable column noWrap with minWidth', () => {
  it('on a desktop cell, keeps the floor on the content box', () => {
    renderTable({ noWrap: true, minWidth: FLOOR_PX });

    expect(getComputedStyle(screen.getByTestId('t-row-r1-email').firstElementChild as HTMLElement).minWidth).toBe(`${FLOOR_PX}px`);
  });
});

describe('DataTable column noWrap in the card stack', () => {
  it('keeps the value box from shrinking, so a chip never breaks mid-word', () => {
    renderTable({ noWrap: true }, ALWAYS_STACK);

    const line = screen.getByTestId('t-row-r1-email');

    expect(getComputedStyle(line.lastElementChild as HTMLElement).flexShrink).toBe('0');
  });
});
