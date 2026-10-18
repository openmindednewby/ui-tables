import { formatRelativeTime, toEpochMs } from './relativeTime';

const NOW = Date.UTC(2026, 9, 18, 12, 0, 0);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const STRINGS = {
  justNow: 'just now',
  never: 'never',
  minutes: '{{n}} min ago',
  hours: '{{n}} h ago',
  days: '{{n}} days ago',
  future: { minutes: 'in {{n}} min', hours: 'in {{n}} h', days: 'in {{n}} days' },
};

describe('formatRelativeTime', () => {
  it('with null, returns the never string', () => {
    const value = null;

    const result = formatRelativeTime(value, NOW, STRINGS);

    expect(result).toBe('never');
  });

  it('with an unparseable string, returns the never string', () => {
    const value = 'not a date';

    const result = formatRelativeTime(value, NOW, STRINGS);

    expect(result).toBe('never');
  });

  it('with 30 seconds ago, returns just now', () => {
    const value = NOW - 30_000;

    const result = formatRelativeTime(value, NOW, STRINGS);

    expect(result).toBe('just now');
  });

  it('with 5 minutes 59 seconds ago, floors to 5 min', () => {
    const value = new Date(NOW - 5 * MINUTE - 59_000);

    const result = formatRelativeTime(value, NOW, STRINGS);

    expect(result).toBe('5 min ago');
  });

  it('with 8 hours ago as an ISO string, returns 8 h ago', () => {
    const value = new Date(NOW - 8 * HOUR).toISOString();

    const result = formatRelativeTime(value, NOW, STRINGS);

    expect(result).toBe('8 h ago');
  });

  it('with 76 days ago, returns 76 days ago', () => {
    const value = NOW - 76 * DAY;

    const result = formatRelativeTime(value, NOW, STRINGS);

    expect(result).toBe('76 days ago');
  });

  it('with a future time and future strings, uses the future template', () => {
    const value = NOW + 2 * HOUR;

    const result = formatRelativeTime(value, NOW, STRINGS);

    expect(result).toBe('in 2 h');
  });

  it('with a future time and no future strings, falls back to the past template', () => {
    const { future: _future, ...pastOnly } = STRINGS;

    const result = formatRelativeTime(NOW + 3 * MINUTE, NOW, pastOnly);

    expect(result).toBe('3 min ago');
  });
});

describe('toEpochMs', () => {
  it('with an empty string, returns null', () => {
    const value = '';

    const result = toEpochMs(value);

    expect(result).toBeNull();
  });
});
