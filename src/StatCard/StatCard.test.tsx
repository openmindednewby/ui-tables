import { render, screen } from '@testing-library/react';

import { StatCard } from './StatCard';

// Reads theme + translate from @dloizides/ui-feedback's context; the neutral default
// (no provider) lets it render standalone in tests. Default translate returns the key.

describe('StatCard', () => {
  it('renders the label and locale-formatted value at the given testID', () => {
    render(<StatCard label="Responses" value={1234} testID="stat-responses" />);
    expect(screen.getByTestId('stat-responses')).toBeTruthy();
    expect(screen.getByText('Responses')).toBeTruthy();
    expect(screen.getByText('1,234')).toBeTruthy();
  });

  it('formats zero', () => {
    render(<StatCard label="Empty" value={0} testID="stat-empty" />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('with a preformatted string value, shows the string unchanged', () => {
    const value = 'EUR 1234.50';

    render(<StatCard label="Unpaid" value={value} testID="stat-unpaid" />);

    expect(screen.getByText('EUR 1234.50')).toBeTruthy();
  });
});
