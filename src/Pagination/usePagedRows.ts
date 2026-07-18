/**
 * `usePagedRows` — client-side pagination state for an already-materialised array.
 *
 * WHY A HOOK AND NOT A COMPONENT: this logic was promoted from the byte-identical
 * `PaginatedList` twins in erevna-web and katalogos-web. That component hard-bound
 * three things a shared package must not own — a `FlatList`, an app-specific
 * `EmptyListState`, and an app-specific `LoadingFallback`. Only the *paging maths*
 * is genuinely shared, so only the paging maths moved. Callers keep their own list
 * renderer, empty state, and loading state.
 *
 * For server-side paging use `DataTable`'s pager instead — this hook assumes every
 * row is already in memory.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

/** Rows to show per page when the caller does not specify. */
export const DEFAULT_PAGE_SIZE = 10;

export interface UsePagedRowsOptions {
  /** Rows per page. Values < 1 are treated as 1 — a 0 page size would divide by zero. */
  pageSize?: number;
}

export interface PagedRows<T> {
  /** The slice of `rows` belonging to the current page. */
  pageRows: T[];
  /** Zero-based index of the current page. */
  currentPage: number;
  /** Total number of pages; 0 when there are no rows. */
  totalPages: number;
  /** Jump to a page. Out-of-range values are clamped into `[0, totalPages - 1]`. */
  setPage: (page: number) => void;
  /** Whether a pager is worth rendering at all (more than one page exists). */
  hasPages: boolean;
  /** Effective page size after the `< 1` guard. */
  pageSize: number;
}

/**
 * Slice `rows` into pages and track the current one.
 *
 * The current page is kept valid as `rows` changes: if rows are removed while the
 * user is on the last page, the page index clamps down rather than leaving the
 * caller rendering an empty slice of a non-empty list.
 */
export function usePagedRows<T>(rows: readonly T[], options: UsePagedRowsOptions = {}): PagedRows<T> {
  const pageSize = Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(rows.length / pageSize);

  /**
   * Keep `currentPage` in range when `rows` shrinks.
   *
   * The app-side original only clamped when `totalPages > 0`, so emptying the list
   * entirely left a stale non-zero page index behind; the next non-empty render
   * then started on the wrong page. Clamping to 0 in that case fixes it.
   */
  useEffect(() => {
    const lastValidPage = totalPages > 0 ? totalPages - 1 : 0;
    if (currentPage > lastValidPage) setCurrentPage(lastValidPage);
  }, [currentPage, totalPages]);

  const pageRows = useMemo(() => {
    const start = currentPage * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  const setPage = useCallback(
    (page: number) => {
      const lastValidPage = totalPages > 0 ? totalPages - 1 : 0;
      const clamped = Math.min(Math.max(0, page), lastValidPage);
      setCurrentPage(clamped);
    },
    [totalPages],
  );

  return {
    pageRows: pageRows as T[],
    currentPage,
    totalPages,
    setPage,
    hasPages: totalPages > 1,
    pageSize,
  };
}
