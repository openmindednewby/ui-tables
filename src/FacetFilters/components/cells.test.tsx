import { render, screen } from '@testing-library/react';

import { FACET_TEST_IDS } from '../constants';
import { DateStampCell } from './DateStampCell';
import { joinIdentityParts } from './IdentityCell';

const STRINGS = { minutes: '{{n}} min ago', hours: '{{n}} h ago', days: '{{n}} d ago', justNow: 'just now', never: 'never' };
const NOW = Date.UTC(2026, 10, 20, 12, 0, 0);
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

describe('joinIdentityParts', () => {
  it('with an empty and a missing part, joins only the present parts', () => {
    const parts = ['APP-1', '', null, 'GR'];

    const result = joinIdentityParts(parts);

    expect(result).toBe('APP-1 · GR');
  });
});

describe('DateStampCell', () => {
  it('with a date two hours ago, shows the exact date then the relative time', () => {
    const value = NOW - TWO_HOURS_MS;

    render(<DateStampCell emptyLabel="No date" formatAbsolute={(ms) => new Date(ms).toISOString()} nowMs={NOW} strings={STRINGS} value={value} />);

    expect(screen.getByTestId(FACET_TEST_IDS.dateStampCell).textContent).toBe('2026-11-20T10:00:00.000Z2 h ago');
  });

  it('with no date, shows the empty label', () => {
    const value = null;

    render(<DateStampCell emptyLabel="No date" formatAbsolute={(ms) => String(ms)} nowMs={NOW} strings={STRINGS} value={value} />);

    expect(screen.getByTestId(FACET_TEST_IDS.dateStampCell).textContent).toBe('No date');
  });
});
