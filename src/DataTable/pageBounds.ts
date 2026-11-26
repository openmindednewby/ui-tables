import type { PagerServerPage } from './Pager';

const FIRST_PAGE = 1;

/** The resolved page window of a Pager. */
export interface PageBounds {
  safePage: number;
  lastPage: number;
  from: number;
  to: number;
}

/** Clamps the page and computes the shown row range from a known total or, without one, from the server page. */
export function pageBounds({ page, pageSize, total, serverPage }: { page: number; pageSize: number; total?: number; serverPage?: PagerServerPage }): PageBounds {
  if (total === undefined) {
    const safePage = Math.max(page, FIRST_PAGE);
    const itemCount = serverPage?.itemCount ?? 0;
    const start = (safePage - 1) * pageSize;
    return { safePage, lastPage: serverPage?.hasNext === true ? safePage + 1 : safePage, from: itemCount === 0 ? 0 : start + 1, to: start + itemCount };
  }
  const lastPage = Math.max(FIRST_PAGE, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, FIRST_PAGE), lastPage);
  return { safePage, lastPage, from: total === 0 ? 0 : (safePage - 1) * pageSize + 1, to: Math.min(safePage * pageSize, total) };
}
