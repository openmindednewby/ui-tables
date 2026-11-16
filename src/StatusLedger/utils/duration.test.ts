import { DurationUnit } from '../DurationUnit';
import { ageFraction, elapsedMs, formatDuration } from './duration';

const NOW = Date.UTC(2026, 10, 16, 12, 0, 0);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const STRINGS = { unknown: '-', lessThanMinute: '< 1 min', minutes: '{{n}} min', hours: '{{n}} h', days: '{{n}} d' };

describe('elapsedMs', () => {
  it('with a start two hours ago, returns two hours', () => {
    const start = NOW - 2 * HOUR;

    const result = elapsedMs(start, NOW);

    expect(result).toBe(2 * HOUR);
  });

  it('with a missing start, returns null', () => {
    const start = undefined;

    const result = elapsedMs(start, NOW);

    expect(result).toBeNull();
  });

  it('with a start in the future, returns zero', () => {
    const start = NOW + HOUR;

    const result = elapsedMs(start, NOW);

    expect(result).toBe(0);
  });
});

describe('formatDuration', () => {
  it('with null, returns the unknown string', () => {
    const duration = null;

    const result = formatDuration(duration, STRINGS);

    expect(result).toBe('-');
  });

  it('with 30 seconds, returns the less-than-a-minute string', () => {
    const duration = 30_000;

    const result = formatDuration(duration, STRINGS);

    expect(result).toBe('< 1 min');
  });

  it('with 45 minutes, returns whole minutes', () => {
    const duration = 45 * MINUTE;

    const result = formatDuration(duration, STRINGS);

    expect(result).toBe('45 min');
  });

  it('with 5.5 hours, returns whole hours rounded down', () => {
    const duration = 5.5 * HOUR;

    const result = formatDuration(duration, STRINGS);

    expect(result).toBe('5 h');
  });

  it('with 3 days and the default largest unit, returns days', () => {
    const duration = 3 * DAY;

    const result = formatDuration(duration, STRINGS);

    expect(result).toBe('3 d');
  });

  it('with 50 hours and hours as the largest unit, returns hours', () => {
    const duration = 50 * HOUR;

    const result = formatDuration(duration, STRINGS, DurationUnit.Hour);

    expect(result).toBe('50 h');
  });

  it('with 2 hours and minutes as the largest unit, returns minutes', () => {
    const duration = 2 * HOUR;

    const result = formatDuration(duration, STRINGS, DurationUnit.Minute);

    expect(result).toBe('120 min');
  });
});

describe('ageFraction', () => {
  it('with half the limit used, returns 0.5', () => {
    const age = 36 * HOUR;

    const result = ageFraction(age, 72 * HOUR);

    expect(result).toBe(0.5);
  });

  it('with an age over the limit, returns 1', () => {
    const age = 100 * HOUR;

    const result = ageFraction(age, 72 * HOUR);

    expect(result).toBe(1);
  });

  it('with a null age, returns 0', () => {
    const age = null;

    const result = ageFraction(age, 72 * HOUR);

    expect(result).toBe(0);
  });

  it('with a zero limit, returns 1', () => {
    const age = HOUR;

    const result = ageFraction(age, 0);

    expect(result).toBe(1);
  });
});
