/**
 * useFilterDraft — the draft-vs-applied state model harvested from aml-v2 (cases/leaders/peps)
 * and kefi's audit log: the bar edits a `draft`; nothing hits the query until `apply` commits it
 * to `committed`. `reset` returns both to the initial value. This is the reusable state engine
 * behind `Filters` in `mode="apply"`; a screen can also drive it directly.
 *
 * The page-reset-to-1 invariant (universal across every portal's query hook — any narrowing or
 * reorder returns to page 1) is surfaced as `onApply`/`onReset` callbacks the caller wires to its
 * `setPage(1)`, so this hook stays free of any pagination coupling.
 */
import { useCallback, useMemo, useState } from 'react';

import type { FilterValue, FilterValues } from '../types';

export interface UseFilterDraftOptions<V extends FilterValues> {
  /** The initial (and reset target) value — the "all filters cleared" state. */
  initial: V;
  /** Fired when a draft is committed. Wire your `setPage(1)` + query refresh here. */
  onApply?: (committed: V) => void;
  /** Fired when the draft + committed are reset to `initial` (e.g. clear an inline error). */
  onReset?: () => void;
}

export interface FilterDraft<V extends FilterValues> {
  /** The live, uncommitted value the bar edits. */
  draft: V;
  /** The committed value the query reads. */
  committed: V;
  /** Patch one field of the draft (merge, like aml's per-bar `set`). */
  setField: (key: string, value: FilterValue) => void;
  /** Replace the whole draft (the bar's `onChange`). */
  setDraft: (next: V) => void;
  /** Commit the draft → committed and fire `onApply`. */
  apply: () => void;
  /** Reset draft + committed to `initial` and fire `onReset`. */
  reset: () => void;
  /** True when the draft differs from the committed value (an Apply would change the result). */
  dirty: boolean;
}

function shallowEqual(a: FilterValues, b: FilterValues): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useFilterDraft<V extends FilterValues>({ initial, onApply, onReset }: UseFilterDraftOptions<V>): FilterDraft<V> {
  const [draft, setDraft] = useState<V>(initial);
  const [committed, setCommitted] = useState<V>(initial);

  const setField = useCallback((key: string, value: FilterValue) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const apply = useCallback(() => {
    setCommitted(draft);
    onApply?.(draft);
  }, [draft, onApply]);

  const reset = useCallback(() => {
    setDraft(initial);
    setCommitted(initial);
    onReset?.();
  }, [initial, onReset]);

  const dirty = useMemo(() => !shallowEqual(draft, committed), [draft, committed]);

  return { draft, committed, setField, setDraft, apply, reset, dirty };
}

export default useFilterDraft;
