import { fetchAllPages, type FetchedPage } from './fetchAllPages';

function source(totalPages: number, calls: number[] = []): (page: number) => Promise<FetchedPage<string>> {
  return (page) => {
    calls.push(page);
    return Promise.resolve({ items: [`row-${page}`], totalPages });
  };
}

function tracked(totalPages: number, peak: { value: number }): (page: number) => Promise<FetchedPage<number>> {
  let inFlight = 0;
  return async (page) => {
    inFlight += 1;
    peak.value = Math.max(peak.value, inFlight);
    await Promise.resolve();
    inFlight -= 1;
    return { items: [page], totalPages };
  };
}

describe('fetchAllPages', () => {
  it('with three pages under the cap, returns every row in page order and not truncated', async () => {
    const fetchPage = source(3);

    const result = await fetchAllPages(fetchPage, { pageSize: 100, maxPages: 50 });

    expect(result).toEqual({ rows: ['row-1', 'row-2', 'row-3'], truncated: false });
  });

  it('with more pages than maxPages, stops at maxPages and reports truncated', async () => {
    const calls: number[] = [];
    const fetchPage = source(10, calls);

    const result = await fetchAllPages(fetchPage, { pageSize: 100, maxPages: 4 });

    expect(result.truncated).toBe(true);
    expect(calls).toEqual([1, 2, 3, 4]);
  });

  it('with exactly maxPages pages, is not truncated', async () => {
    const fetchPage = source(4);

    const result = await fetchAllPages(fetchPage, { pageSize: 100, maxPages: 4 });

    expect(result.truncated).toBe(false);
  });

  it('with zero total pages, returns the first page rows only', async () => {
    const calls: number[] = [];
    const fetchPage = source(0, calls);

    const result = await fetchAllPages(fetchPage, { pageSize: 25, maxPages: 5 });

    expect(calls).toEqual([1]);
    expect(result).toEqual({ rows: ['row-1'], truncated: false });
  });

  it('with concurrency 2, never has more than two requests in flight and keeps page order', async () => {
    const peak = { value: 0 };
    const fetchPage = tracked(7, peak);

    const result = await fetchAllPages(fetchPage, { pageSize: 10, maxPages: 7, concurrency: 2 });

    expect(peak.value).toBe(2);
    expect(result.rows).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('with concurrency 1, reads pages in sequence', async () => {
    const peak = { value: 0 };
    const fetchPage = tracked(3, peak);

    await fetchAllPages(fetchPage, { pageSize: 10, maxPages: 3, concurrency: 1 });

    expect(peak.value).toBe(1);
  });

  it('with a page size, passes it to every request', async () => {
    const sizes: number[] = [];
    const fetchPage = (page: number, pageSize: number): Promise<FetchedPage<number>> => {
      sizes.push(pageSize);
      return Promise.resolve({ items: [page], totalPages: 2 });
    };

    await fetchAllPages(fetchPage, { pageSize: 100, maxPages: 2 });

    expect(sizes).toEqual([100, 100]);
  });
});
