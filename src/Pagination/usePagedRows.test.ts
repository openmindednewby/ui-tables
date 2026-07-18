import { act, renderHook } from '@testing-library/react';

import { usePagedRows, DEFAULT_PAGE_SIZE } from './usePagedRows';

const rows = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

describe('usePagedRows', () => {
  it('slices the first page and reports page count', () => {
    const { result } = renderHook(() => usePagedRows(rows(25), { pageSize: 10 }));

    expect(result.current.pageRows).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.current.currentPage).toBe(0);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.hasPages).toBe(true);
  });

  it('returns the trailing partial page', () => {
    const { result } = renderHook(() => usePagedRows(rows(25), { pageSize: 10 }));

    act(() => result.current.setPage(2));

    expect(result.current.pageRows).toEqual([20, 21, 22, 23, 24]);
  });

  it('defaults to DEFAULT_PAGE_SIZE', () => {
    const { result } = renderHook(() => usePagedRows(rows(30)));

    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.pageRows).toHaveLength(DEFAULT_PAGE_SIZE);
  });

  it('treats a page size below 1 as 1 rather than dividing by zero', () => {
    const { result } = renderHook(() => usePagedRows(rows(3), { pageSize: 0 }));

    expect(result.current.pageSize).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageRows).toEqual([0]);
  });

  describe('empty input', () => {
    it('reports zero pages and no pager', () => {
      const { result } = renderHook(() => usePagedRows([], { pageSize: 10 }));

      expect(result.current.pageRows).toEqual([]);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.hasPages).toBe(false);
      expect(result.current.currentPage).toBe(0);
    });
  });

  describe('hasPages', () => {
    it('is false when everything fits on one page', () => {
      const { result } = renderHook(() => usePagedRows(rows(5), { pageSize: 10 }));
      expect(result.current.hasPages).toBe(false);
    });
  });

  describe('setPage clamping', () => {
    it('clamps a page above the last page', () => {
      const { result } = renderHook(() => usePagedRows(rows(25), { pageSize: 10 }));

      act(() => result.current.setPage(99));

      expect(result.current.currentPage).toBe(2);
    });

    it('clamps a negative page to 0', () => {
      const { result } = renderHook(() => usePagedRows(rows(25), { pageSize: 10 }));

      act(() => result.current.setPage(-5));

      expect(result.current.currentPage).toBe(0);
    });
  });

  describe('reacting to row changes', () => {
    it('clamps down when rows shrink beneath the current page', () => {
      const { result, rerender } = renderHook(
        ({ data }: { data: number[] }) => usePagedRows(data, { pageSize: 10 }),
        { initialProps: { data: rows(25) } },
      );

      act(() => result.current.setPage(2));
      expect(result.current.currentPage).toBe(2);

      rerender({ data: rows(12) });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageRows).toEqual([10, 11]);
    });

    it('resets to page 0 when the list empties entirely', () => {
      const { result, rerender } = renderHook(
        ({ data }: { data: number[] }) => usePagedRows(data, { pageSize: 10 }),
        { initialProps: { data: rows(25) } },
      );

      act(() => result.current.setPage(2));
      rerender({ data: [] });

      // Regression guard: the app-side original only clamped when totalPages > 0,
      // so emptying the list stranded a stale page index.
      expect(result.current.currentPage).toBe(0);
      expect(result.current.pageRows).toEqual([]);
    });

    it('keeps the current page when rows grow', () => {
      const { result, rerender } = renderHook(
        ({ data }: { data: number[] }) => usePagedRows(data, { pageSize: 10 }),
        { initialProps: { data: rows(25) } },
      );

      act(() => result.current.setPage(1));
      rerender({ data: rows(40) });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(4);
      expect(result.current.pageRows).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    });
  });
});
