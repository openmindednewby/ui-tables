export const FIRST_PAGE = 1;
export const DEFAULT_FETCH_CONCURRENCY = 2;

export interface FetchedPage<T> {
  items: readonly T[];
  totalPages: number;
}

export interface FetchedRows<T> {
  rows: T[];
  truncated: boolean;
}

export type PageFetcher<T> = (page: number, pageSize: number) => Promise<FetchedPage<T>>;

export interface FetchAllPagesOptions {
  pageSize: number;
  maxPages: number;
  concurrency?: number;
}

function pageNumbers(from: number, to: number): number[] {
  return Array.from({ length: Math.max(to - from + 1, 0) }, (_unused, index) => from + index);
}

function chunk(pages: readonly number[], size: number): number[][] {
  const step = Math.max(Math.floor(size), 1);
  const count = Math.ceil(pages.length / step);
  return Array.from({ length: count }, (_unused, index) => pages.slice(index * step, index * step + step));
}

/** Reads pages from 1 up to `maxPages`, `concurrency` at a time; `truncated` when the source has more. */
export async function fetchAllPages<T>(
  fetchPage: PageFetcher<T>,
  { pageSize, maxPages, concurrency = DEFAULT_FETCH_CONCURRENCY }: FetchAllPagesOptions,
): Promise<FetchedRows<T>> {
  const first = await fetchPage(FIRST_PAGE, pageSize);
  const lastPage = Math.min(first.totalPages, maxPages);
  const pages: Array<FetchedPage<T>> = [first];
  for (const batch of chunk(pageNumbers(FIRST_PAGE + 1, lastPage), concurrency)) {
    pages.push(...(await Promise.all(batch.map((page) => fetchPage(page, pageSize)))));
  }
  return { rows: pages.flatMap((page) => [...page.items]), truncated: first.totalPages > maxPages };
}
