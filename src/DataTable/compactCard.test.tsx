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

interface Hit {
  id: string;
  name: string;
  decision: string;
  risk: number;
  note: string;
}

const COLUMNS: ReadonlyArray<DataTableColumn<Hit>> = [
  { key: 'name', header: 'Subject', render: (h) => h.name, summaryText: (h) => h.name },
  { key: 'decision', header: 'Decision', render: (h) => h.decision, summaryText: (h) => h.decision },
  { key: 'risk', header: 'Risk', render: (h) => String(h.risk), summaryText: (h) => String(h.risk) },
  { key: 'note', header: 'Note', render: (h) => h.note },
];
const ROWS: readonly Hit[] = [{ id: 'h1', name: 'Jane Roe', decision: 'Clear', risk: 12, note: 'internal' }];

function renderCompact(columns: ReadonlyArray<DataTableColumn<Hit>> = COLUMNS): void {
  render(
    <UiProvider t={t} theme={theme}>
      <DataTable cardLineLayout={CardLineLayout.Compact} columns={columns} keyExtractor={(h) => h.id} rowAction={{ none: 'test table' }} rows={ROWS} stackBreakpoint={ALWAYS_STACKED} testID="hits" />
    </UiProvider>,
  );
}

describe('DataTable compact card', () => {
  it('with summary columns, joins them as "Label: value" with a middle dot', () => {
    renderCompact();

    const summary = screen.getByTestId('hits-row-h1-summary').textContent;

    expect(summary).toBe('Decision: Clear · Risk: 12');
  });

  it('with a primary column that has summaryText, renders it as the bold title', () => {
    renderCompact();

    const title = screen.getByTestId('hits-row-h1-name');

    expect(title.textContent).toBe('Jane Roe');
    expect(getComputedStyle(title).fontWeight).toBe('700');
  });

  it('with a column that has no summaryText, leaves it out of the summary line', () => {
    renderCompact();

    const note = screen.queryByTestId('hits-row-h1-note');

    expect(note).toBeNull();
  });

  it('with no summary columns, renders no summary line', () => {
    renderCompact([COLUMNS[0] as DataTableColumn<Hit>]);

    const summary = screen.queryByTestId('hits-row-h1-summary');

    expect(summary).toBeNull();
  });
});
