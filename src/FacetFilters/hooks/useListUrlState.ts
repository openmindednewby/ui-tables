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
  reset: () => void;
}

/** List filter, date, page, size and column state kept in the URL, so back, forward and shared links reproduce the list. */
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
    setFacets: (facets) => commit({ ...state, facets, page: FIRST_PAGE }),
    setDate: (date) => commit({ ...state, date, page: FIRST_PAGE }),
    setPage: (page) => commit({ ...state, page }),
    setSize: (size) => commit({ ...state, size, page: FIRST_PAGE }),
    setColumns: (columns) => commit({ ...state, columns }),
    reset: () => commit({ facets: {}, date: null, page: FIRST_PAGE, size: defaultSize, columns: state.columns }),
  };
}
