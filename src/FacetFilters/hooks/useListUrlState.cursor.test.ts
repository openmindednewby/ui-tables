import { act, renderHook } from '@testing-library/react';

import type { UrlAdapter } from './urlAdapter';
import { useListUrlState } from './useListUrlState';

const DEFAULTS = { facetKeys: ['vs'], extraKeys: ['q'], size: 50 };

function fakeAdapter(initial: string): UrlAdapter & { writes: string[] } {
  let query = initial;
  const writes: string[] = [];
  return {
    writes,
    read: () => query,
    write: (q) => {
      query = q;
      writes.push(q);
    },
    subscribe: () => () => undefined,
  };
}

describe('useListUrlState cursor and extras', () => {
  it('with setAfter, writes the cursor and keeps q and the facets', () => {
    const adapter = fakeAdapter('?vs=review&q=abc');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.setAfter('c42'));

    expect(adapter.writes).toEqual(['vs=review&q=abc&after=c42']);
  });

  it('with a facet change on a later cursor page, clears the cursor', () => {
    const adapter = fakeAdapter('?q=abc&after=c42');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.setFacets({ vs: ['review'] }));

    expect(adapter.writes).toEqual(['vs=review&q=abc']);
  });

  it('with setExtra for q, keeps the facets and clears the cursor', () => {
    const adapter = fakeAdapter('?vs=review&after=c42');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.setExtra('q', 'ab'));

    expect(adapter.writes).toEqual(['vs=review&q=ab']);
  });

  it('with a size change, clears the cursor', () => {
    const adapter = fakeAdapter('?after=c42');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.setSize(25));

    expect(adapter.writes).toEqual(['size=25']);
  });

  it('with reset, clears facets, q and the cursor and keeps the columns', () => {
    const adapter = fakeAdapter('?vs=review&q=abc&after=c42&cols=name');
    const { result } = renderHook(() => useListUrlState(DEFAULTS, adapter));

    act(() => result.current.reset());

    expect(adapter.writes).toEqual(['cols=name']);
  });
});
