import { StatusTone } from '../StatusTone';
import { assignAgeBand, groupByAgeBand, sortOldestFirst, type AgeBand } from './ageBands';

const HOUR = 3_600_000;
const FRESH: AgeBand = { key: 'fresh', label: 'Under 24 h', minAgeMs: 0, tone: StatusTone.Neutral };
const AGING: AgeBand = { key: 'aging', label: '24 to 48 h', minAgeMs: 24 * HOUR, tone: StatusTone.Warn };
const OLD: AgeBand = { key: 'old', label: 'Over 48 h', minAgeMs: 48 * HOUR, tone: StatusTone.Bad };
const BANDS = [FRESH, OLD, AGING];

interface Item { id: string; age: number | null }
const ageOf = (item: Item): number | null => item.age;

describe('assignAgeBand', () => {
  it('with an age exactly on a band floor, returns that band', () => {
    const age = 24 * HOUR;

    const result = assignAgeBand(age, BANDS);

    expect(result?.key).toBe('aging');
  });

  it('with an age past the oldest floor, returns the oldest band', () => {
    const age = 90 * HOUR;

    const result = assignAgeBand(age, BANDS);

    expect(result?.key).toBe('old');
  });

  it('with a null age, returns the youngest band', () => {
    const age = null;

    const result = assignAgeBand(age, BANDS);

    expect(result?.key).toBe('fresh');
  });

  it('with no bands, returns undefined', () => {
    const age = HOUR;

    const result = assignAgeBand(age, []);

    expect(result).toBeUndefined();
  });
});

describe('groupByAgeBand', () => {
  it('with rows in two bands, returns the oldest band first and drops the empty band', () => {
    const rows: Item[] = [{ id: 'a', age: HOUR }, { id: 'b', age: 50 * HOUR }, { id: 'c', age: 2 * HOUR }];

    const result = groupByAgeBand(rows, ageOf, BANDS);

    expect(result.map((g) => [g.band.key, g.rows.map((r) => r.id)])).toEqual([['old', ['b']], ['fresh', ['a', 'c']]]);
  });
});

describe('sortOldestFirst', () => {
  it('with mixed ages and a missing one, returns oldest first and the missing age last', () => {
    const rows: Item[] = [{ id: 'young', age: HOUR }, { id: 'none', age: null }, { id: 'old', age: 9 * HOUR }];

    const result = sortOldestFirst(rows, ageOf);

    expect(result.map((r) => r.id)).toEqual(['old', 'young', 'none']);
  });
});
