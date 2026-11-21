import { act, renderHook } from '@testing-library/react';

import type { UrlAdapter } from './urlAdapter';
import { useListUrlState } from './useListUrlState';

const DEFAULTS = { facetKeys: ['vs'], size: 50 };

function fakeAdapter(initial: string): UrlAdapter & { writes: string[]; fire: (query: string) => void } {
  let query = initial;
  let listener: () => void = () => undefined;
  const writes: string[] = [];
  return {
    writes,
    read: () => query,
    write: (q) => {
      query = q;
      writes.push(q);
    },
    subscribe: (onChange) => {
      listener = onChange;
      return () => undefined;
    },
    fire: (q) => {
      query = q;
      listener();
    },
  };
}

describe('useListUrlState', () => {
  it('with a facet change on page 3, writes the facet and returns to page 1', () => {
    const adapter = fakeAdapter('?page=3');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.setFacets({ vs: ['review'] }));

    expect(adapter.writes).toEqual(['vs=review']);
  });

  it('with a page change, keeps the facets', () => {
    const adapter = fakeAdapter('?vs=review');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.setPage(2));

    expect(adapter.writes).toEqual(['vs=review&page=2']);
  });

  it('with a back navigation, reads the new URL', () => {
    const adapter = fakeAdapter('?vs=review');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => adapter.fire('?vs=correction&page=4'));

    expect(result.current.state.facets).toEqual({ vs: ['correction'] });
  });

  it('with reset, clears filters and keeps the chosen columns', () => {
    const adapter = fakeAdapter('?vs=review&size=100&cols=name');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.reset());

    expect(adapter.writes).toEqual(['cols=name']);
  });

  it('with two setters in one handler, the second keeps the first change', () => {
    const adapter = fakeAdapter('');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => {
      result.current.setFacets({ vs: ['review'] });
      result.current.setPage(2);
    });

    expect(adapter.writes.at(-1)).toBe('vs=review&page=2');
  });

  it('with a rerender and no change, keeps the same setters', () => {
    const adapter = fakeAdapter('');
    const { result, rerender } = renderHook(() => useListUrlState(DEFAULTS, adapter));
    const before = result.current.setFacets;

    rerender();

    expect(result.current.setFacets).toBe(before);
  });
});
