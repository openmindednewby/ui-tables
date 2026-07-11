import { render, screen } from '@testing-library/react';
import React from 'react';
import { Text } from 'react-native';

import { UiProvider, type UiTheme, type UiValue } from '@dloizides/ui-feedback';

import { FilterBar } from './FilterBar';
import { TABLE_I18N, TABLE_TEST_IDS } from './constants';

const theme: UiTheme = {
  colors: { background: '#f4f6fb', surface: '#ffffff', surfaceElevated: '#ffffff', text: '#111', textSecondary: '#666', border: '#ddd' },
  palette: { primary: { '500': '#4f46e5' } },
  semantic: { error: { '500': '#dc2626' } },
};
const t: UiValue['t'] = (key) => (key === TABLE_I18N.results ? 'results' : key);

function renderBar(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UiProvider theme={theme} t={t}>{ui}</UiProvider>);
}

describe('FilterBar', () => {
  it('renders its field children and an actions slot', () => {
    renderBar(
      <FilterBar actions={<Text>Apply</Text>} testID="bar">
        <Text>Country</Text>
      </FilterBar>,
    );
    expect(screen.getByTestId('bar')).toBeTruthy();
    expect(screen.getByText('Country')).toBeTruthy();
    expect(screen.getByText('Apply')).toBeTruthy();
  });

  it('shows the live results count with the translated word', () => {
    renderBar(<FilterBar resultsCount={128} />);
    const results = screen.getByTestId(TABLE_TEST_IDS.results);
    expect(results.textContent).toContain('128');
    expect(results.textContent).toContain('results');
  });

  it('exposes the results count as a polite status live region', () => {
    renderBar(<FilterBar resultsCount={5} />);
    const results = screen.getByTestId(TABLE_TEST_IDS.results);
    expect(results.getAttribute('role')).toBe('status');
    expect(results.getAttribute('aria-live')).toBe('polite');
  });

  it('hides the results count when none is given', () => {
    renderBar(<FilterBar />);
    expect(screen.queryByTestId(TABLE_TEST_IDS.results)).toBeNull();
  });
});
