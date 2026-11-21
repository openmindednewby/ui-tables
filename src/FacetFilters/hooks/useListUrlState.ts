import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

type ListUrlActions = Omit<ListUrlState, 'state'>;
type StateChange = (state: ListFilterState) => ListFilterState;

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

function listActions(commit: (change: StateChange) => void, defaultSize: number): ListUrlActions {
  return {
    setFacets: (facets) => commit((s) => restart(s, { facets })),
    setDate: (date) => commit((s) => restart(s, { date })),
    setPage: (page) => commit((s) => ({ ...s, page })),
    setSize: (size) => commit((s) => restart(s, { size })),
    setColumns: (columns) => commit((s) => ({ ...s, columns })),
    setAfter: (after) => commit((s) => ({ ...s, after })),
    setExtra: (key, value) => commit((s) => withExtra(s, key, value)),
    reset: () => commit((s) => resetState(s, defaultSize)),
  };
}

/** List filter, date, page, size, column, cursor and extra state kept in the URL, so links reproduce the list. */
export function useListUrlState(defaults: UrlStateDefaults, adapter?: UrlAdapter): ListUrlState {
  const url = useMemo(() => adapter ?? createBrowserUrlAdapter(), [adapter]);
  const defaultSize = defaults.size ?? DEFAULT_LIST_PAGE_SIZE;
  const defaultsRef = useRef(defaults);
  const [state, setState] = useState(() => parseListQuery(url.read(), defaults));
  const stateRef = useRef(state);

  useEffect(() => {
    defaultsRef.current = defaults;
  }, [defaults]);

  useEffect(
    () =>
      url.subscribe(() => {
        stateRef.current = parseListQuery(url.read(), defaultsRef.current);
        setState(stateRef.current);
      }),
    [url],
  );

  const commit = useCallback(
    (change: StateChange) => {
      stateRef.current = change(stateRef.current);
      setState(stateRef.current);
      url.write(serializeListQuery(stateRef.current, defaultSize));
    },
    [url, defaultSize],
  );

  const actions = useMemo(() => listActions(commit, defaultSize), [commit, defaultSize]);
  return useMemo(() => ({ state, ...actions }), [state, actions]);
}
