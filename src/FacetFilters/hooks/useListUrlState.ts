import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LIST_PAGE_SIZE, FIRST_PAGE } from '../constants';
import type { DateFilterValue, FacetValues, ListFilterState } from '../types';
import { parseListQuery, serializeListQuery, type UrlStateDefaults } from '../utils/urlState';
import { createBrowserUrlAdapter, type UrlAdapter } from './urlAdapter';

export interface ListUrlState {
  state: ListFilterState;
  setFacets: (facets: FacetValues) => void;
  setDate: (date: DateFilterValue | null) => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setColumns: (columns: readonly string[] | null) => void;
  setAfter: (after: string | null) => void;
  setExtra: (key: string, value: string | null) => void;
  reset: () => void;
}

function restart(state: ListFilterState, patch: Partial<ListFilterState>): ListFilterState {
  const cursor = state.after === undefined ? {} : { after: null };
  return { ...state, ...patch, ...cursor, page: FIRST_PAGE };
}

function withExtra(state: ListFilterState, key: string, value: string | null): ListFilterState {
  const extras = { ...state.extras, [key]: value ?? undefined };
  return restart(state, { extras });
}

function resetState(state: ListFilterState, defaultSize: number): ListFilterState {
  const extras = state.extras === undefined ? {} : { extras: {} };
  return { facets: {}, date: null, page: FIRST_PAGE, size: defaultSize, columns: state.columns, ...extras };
}

/** List filter, date, page, size, column, cursor and extra state kept in the URL, so links reproduce the list. */
export function useListUrlState(defaults: UrlStateDefaults, adapter?: UrlAdapter): ListUrlState {
  const url = useMemo(() => adapter ?? createBrowserUrlAdapter(), [adapter]);
  const defaultSize = defaults.size ?? DEFAULT_LIST_PAGE_SIZE;
  const [state, setState] = useState(() => parseListQuery(url.read(), defaults));

  useEffect(() => url.subscribe(() => setState(parseListQuery(url.read(), defaults))), [url, defaults]);

  const commit = useCallback(
    (next: ListFilterState) => {
      setState(next);
      url.write(serializeListQuery(next, defaultSize));
    },
    [url, defaultSize],
  );

  return {
    state,
    setFacets: (facets) => commit(restart(state, { facets })),
    setDate: (date) => commit(restart(state, { date })),
    setPage: (page) => commit({ ...state, page }),
    setSize: (size) => commit(restart(state, { size })),
    setColumns: (columns) => commit({ ...state, columns }),
    setAfter: (after) => commit({ ...state, after }),
    setExtra: (key, value) => commit(withExtra(state, key, value)),
    reset: () => commit(resetState(state, defaultSize)),
  };
}
