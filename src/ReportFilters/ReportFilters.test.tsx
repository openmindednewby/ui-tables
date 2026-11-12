import { act, fireEvent, render, screen } from '@testing-library/react';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { ReportFilters } from './ReportFilters';
import { EMPTY_REPORT_FILTERS, REPORT_FILTERS_TEST_ID, openPanelTestID, panelTestID } from './constants';
import type { ReportFilterLabels, ReportFilterOptions } from './types';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#14325a' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => key;
const OPTIONS: ReportFilterOptions = { scopes: [], statuses: [], currencies: [] };
const LABELS: ReportFilterLabels = {
  scope: 'Scope',
  range: 'Value date',
  from: 'From',
  to: 'To',
  statuses: 'Status',
  currency: 'Currency',
  invalidRange: 'From is after To',
  openPanel: 'Filters',
  openPanelHint: 'Opens the filters panel',
  panelTitle: 'Filter the report',
  closePanel: 'Done',
  closePanelHint: 'Closes the filters panel',
};
const PANEL_ID = panelTestID(REPORT_FILTERS_TEST_ID);

function renderCompact(): void {
  render(
    <UiProvider theme={theme} t={t}>
      <ReportFilters compact value={EMPTY_REPORT_FILTERS} onChange={() => undefined} options={OPTIONS} labels={LABELS} />
    </UiProvider>,
  );
}

function openPanel(): void {
  act(() => {
    fireEvent.click(screen.getByTestId(openPanelTestID(REPORT_FILTERS_TEST_ID)));
  });
}

describe('ReportFilters compact', () => {
  it('before the Filters button is pressed, keeps the side panel closed', () => {
    renderCompact();

    const panel = screen.queryByTestId(PANEL_ID);

    expect(panel).toBeNull();
  });

  it('with the Filters button pressed, opens the side panel', () => {
    renderCompact();

    openPanel();

    expect(screen.getByTestId(PANEL_ID)).toBeTruthy();
  });

  it('with the side panel opened, focuses the panel title', () => {
    renderCompact();

    openPanel();

    expect(document.activeElement).toBe(screen.getByTestId(`${PANEL_ID}-title`));
  });
});
