import { fireEvent, render, screen } from '@testing-library/react';

import { FilterBar } from '../DataTable/FilterBar';
import { TABLE_TEST_IDS } from '../DataTable/constants';
import { RefreshAction } from './RefreshAction';
import { ResultSummary } from './ResultSummary';

describe('ResultSummary', () => {
  it('with a count, renders the number bold and the label after it', () => {
    render(<ResultSummary count={1234} label="sessions" testID="sum" />);

    const count = screen.getByTestId('sum-count');

    expect(count.textContent).toBe('1,234');
    expect(getComputedStyle(count).fontWeight).toBe('700');
    expect(screen.getByTestId('sum').textContent).toBe('1,234 sessions');
  });

  it('with a count, announces changes politely', () => {
    render(<ResultSummary count={3} label="rows" testID="sum" />);

    const summary = screen.getByTestId('sum');

    expect(summary.getAttribute('aria-live')).toBe('polite');
  });
});

describe('FilterBar', () => {
  it('with resultsCount, shows the shared result summary', () => {
    render(<FilterBar resultsCount={42} resultsLabel="cases" />);

    const count = screen.getByTestId(`${TABLE_TEST_IDS.results}-count`);

    expect(count.textContent).toBe('42');
  });
});

describe('RefreshAction', () => {
  it('on press, calls onPress once', () => {
    const onPress = jest.fn();
    render(<RefreshAction hint="Reload the list" label="Refresh" testID="refresh" onPress={onPress} />);

    fireEvent.click(screen.getByTestId('refresh'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('with a label, uses the 15 px md label font and the label as its name', () => {
    render(<RefreshAction hint="Reload the list" label="Refresh" testID="refresh" onPress={jest.fn()} />);

    const label = screen.getByText('Refresh');

    expect(getComputedStyle(label).fontSize).toBe('15px');
    expect(screen.getByTestId('refresh').getAttribute('aria-label')).toBe('Refresh');
  });
});
