import { parseListQuery, serializeListQuery } from './urlState';

const DEFAULTS = { facetKeys: ['vs', 'risk'], size: 50, allowedSizes: [25, 50, 100] };

describe('parseListQuery', () => {
  it('with facets, date, page, size and columns, reads them all', () => {
    const search = '?vs=review,correction&risk=high&date=updated:7d&page=3&size=100&cols=name,status';

    const result = parseListQuery(search, DEFAULTS);

    expect(result).toEqual({
      facets: { vs: ['review', 'correction'], risk: ['high'] },
      date: { field: 'updated', range: '7d' },
      page: 3,
      size: 100,
      columns: ['name', 'status'],
    });
  });

  it('with an unknown key, a bad page and an unlisted size, falls back to defaults', () => {
    const search = '?other=x&page=-2&size=7&date=updated';

    const result = parseListQuery(search, DEFAULTS);

    expect(result).toEqual({ facets: {}, date: null, page: 1, size: 50, columns: null });
  });
});

describe('serializeListQuery', () => {
  it('with default page and size, leaves them out', () => {
    const state = { facets: { vs: ['review'] }, date: null, page: 1, size: 50, columns: null };

    const result = serializeListQuery(state, 50);

    expect(result).toBe('vs=review');
  });

  it('with a full state, round-trips through parseListQuery', () => {
    const state = { facets: { vs: ['review', 'correction'] }, date: { field: 'created', range: '30d' }, page: 2, size: 25, columns: ['name'] };

    const result = parseListQuery(serializeListQuery(state, 50), DEFAULTS);

    expect(result).toEqual(state);
  });
});
