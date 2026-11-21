import { useState } from 'react';

import type { FacetDefinition, FacetValues } from '../types';
import { activeFacetKeys } from '../utils/facetState';

export interface ChipBarState {
  active: readonly string[];
  shown: readonly FacetDefinition[];
  addable: readonly FacetDefinition[];
  openKey: string | null;
  openFacet: FacetDefinition | undefined;
  adding: boolean;
  toggleAdding: () => void;
  toggleOpen: (key: string) => void;
  startFacet: (key: string) => void;
  closeEditor: () => void;
}

function shownKeys(active: readonly string[], pinned: readonly string[], openKey: string | null): ReadonlySet<string> {
  const keys = new Set([...pinned, ...active]);
  if (openKey !== null) keys.add(openKey);
  return keys;
}

/** Which chips the bar shows, which facets Add filter offers, and which chip editor is open. */
export function useChipBarState(facets: readonly FacetDefinition[], values: FacetValues, pinnedKeys: readonly string[]): ChipBarState {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const active = activeFacetKeys(facets, values);
  const keys = shownKeys(active, pinnedKeys, openKey);
  return {
    active,
    shown: facets.filter((f) => keys.has(f.key)),
    addable: facets.filter((f) => !keys.has(f.key)),
    openKey,
    openFacet: facets.find((f) => f.key === openKey),
    adding,
    toggleAdding: () => setAdding(!adding),
    toggleOpen: (key) => setOpenKey(openKey === key ? null : key),
    startFacet: (key) => {
      setAdding(false);
      setOpenKey(key);
    },
    closeEditor: () => setOpenKey(null),
  };
}
