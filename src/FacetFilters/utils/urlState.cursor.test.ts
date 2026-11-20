import { parseListQuery, serializeListQuery } from './urlState';

const DEFAULTS = { facetKeys: ['vs'], extraKeys: ['q'], size: 50 };

describe('parseListQuery with extra keys and a cursor', () => {
  it('with q and after in the URL, keeps both', () => {
    const search = '?vs=review&q=abc&after=c42&other=x';

    const state = parseListQuery(search, DEFAULTS);

    expect([state.extras, state.after]).toEqual([{ q: 'abc' }, 'c42']);
  });

  it('with no extra keys configured, leaves extras out', () => {
    const search = '?q=abc';

    const state = parseListQuery(search, { facetKeys: ['vs'] });

    expect(state.extras).toBeUndefined();
  });
});

describe('serializeListQuery with extras and a cursor', () => {
  it('with q and after, writes them after the filters', () => {
    const state = { facets: { vs: ['review'] }, date: null, page: 1, size: 50, columns: null, extras: { q: 'abc' }, after: 'c42' };

    const query = serializeListQuery(state, 50);

    expect(query).toBe('vs=review&q=abc&after=c42');
  });

  it('with an empty q and a null cursor, writes neither', () => {
    const state = { facets: {}, date: null, page: 1, size: 50, columns: null, extras: { q: '' }, after: null };

    const query = serializeListQuery(state, 50);

    expect(query).toBe('');
  });
});
