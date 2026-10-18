import { SortDirection } from '../SortDirection';
import { StatusTone } from '../StatusTone';
import { distinctValues, filterLedgerRows, sortLedgerRows, splitNeedsLook } from './ledgerLogic';

interface Row {
  id: string;
  status: string;
  group: string;
  name: string;
  at: number | null;
}

const ROWS: Row[] = [
  { id: 'a', status: 'ok', group: 'g1', name: 'Alpha list', at: 30 },
  { id: 'b', status: 'failed', group: 'g2', name: 'Beta feed', at: null },
  { id: 'c', status: 'partial', group: 'g1', name: 'Gamma list', at: 10 },
  { id: 'd', status: 'failed', group: 'g1', name: 'Delta', at: 20 },
];

const TONES: Record<string, StatusTone> = { ok: StatusTone.Good, failed: StatusTone.Bad, partial: StatusTone.Warn };
const accessors = { getStatus: (r: Row) => r.status, getGroup: (r: Row) => r.group, getSearchText: (r: Row) => r.name };
const ids = (rows: Row[]): string[] => rows.map((r) => r.id);

describe('filterLedgerRows', () => {
  it('with empty filter values, keeps every row', () => {
    const filter = { status: '', group: '', text: '' };

    const result = filterLedgerRows(ROWS, filter, accessors);

    expect(ids(result)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('with status, group and text set, keeps only rows matching all three', () => {
    const filter = { status: 'failed', group: 'g1', text: 'del' };

    const result = filterLedgerRows(ROWS, filter, accessors);

    expect(ids(result)).toEqual(['d']);
  });

  it('with mixed-case text padded by spaces, matches case-insensitively', () => {
    const filter = { status: '', group: '', text: '  LIST ' };

    const result = filterLedgerRows(ROWS, filter, accessors);

    expect(ids(result)).toEqual(['a', 'c']);
  });
});

describe('sortLedgerRows', () => {
  it('ascending by number, puts missing values last', () => {
    const sortValue = (r: Row) => r.at;

    const result = sortLedgerRows(ROWS, sortValue, SortDirection.Asc);

    expect(ids(result)).toEqual(['c', 'd', 'a', 'b']);
  });

  it('descending by number, still puts missing values last', () => {
    const sortValue = (r: Row) => r.at;

    const result = sortLedgerRows(ROWS, sortValue, SortDirection.Desc);

    expect(ids(result)).toEqual(['a', 'd', 'c', 'b']);
  });

  it('by text, orders case-insensitively without mutating the input', () => {
    const input = [...ROWS];

    const result = sortLedgerRows(input, (r) => r.name.toLowerCase(), SortDirection.Asc);

    expect([ids(result), ids(input)]).toEqual([['a', 'b', 'd', 'c'], ['a', 'b', 'c', 'd']]);
  });
});

describe('splitNeedsLook', () => {
  it('with bad and warn rows, lists bad first then warn, keeping input order within a tone', () => {
    const toneOf = (r: Row) => TONES[r.status] ?? StatusTone.Neutral;

    const result = splitNeedsLook(ROWS, (r) => toneOf(r) !== StatusTone.Good, toneOf);

    expect([ids(result.attention), ids(result.rest)]).toEqual([['b', 'd', 'c'], ['a']]);
  });

  it('with no row needing a look, returns every row in rest', () => {
    const toneOf = () => StatusTone.Good;

    const result = splitNeedsLook(ROWS, () => false, toneOf);

    expect([result.attention.length, result.rest.length]).toEqual([0, ROWS.length]);
  });
});

describe('distinctValues', () => {
  it('with repeated and empty values, returns unique non-empty values in first-seen order', () => {
    const rows = [{ v: 'x' }, { v: '' }, { v: 'y' }, { v: 'x' }];

    const result = distinctValues(rows, (r) => r.v);

    expect(result).toEqual(['x', 'y']);
  });
});
