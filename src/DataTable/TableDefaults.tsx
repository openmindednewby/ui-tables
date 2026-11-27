import React, { createContext, useMemo } from 'react';

import { TableDensity } from './TableDensity';
import type { TableLook } from './TableLook';

/** App-wide defaults a DataTable falls back to when its own prop is not set. */
export type PagerRowsVariant = 'pills' | 'dropdown';

export interface TableDefaults {
  density: TableDensity;
  pagerRowsVariant?: PagerRowsVariant;
  autoPageSize?: number;
  keepWords?: boolean;
  look?: TableLook;
}

const COMFORTABLE_DEFAULTS: TableDefaults = { density: TableDensity.Comfortable };

export const TableDefaultsContext = createContext<TableDefaults>(COMFORTABLE_DEFAULTS);

export interface TableDefaultsProviderProps {
  /** The density every DataTable and StatusLedger below uses unless it passes its own `density`. */
  density: TableDensity;
  pagerRowsVariant?: PagerRowsVariant;
  /** Every DataTable with more rows than this shows a pager under it. Omit for no auto pager. */
  autoPageSize?: number;
  /** Cells never break a word: a column keeps its longest word, a card line moves a long value under its label. */
  keepWords?: boolean;
  /** The header and row look every DataTable below uses; omit for the density's own look. */
  look?: TableLook;
  children: React.ReactNode;
}

/** Sets one table look for a whole app or section, so each table does not repeat the preset. */
export function TableDefaultsProvider({ density, pagerRowsVariant, autoPageSize, keepWords, look, children }: TableDefaultsProviderProps): React.ReactElement {
  const value = useMemo(
    () => ({ density, pagerRowsVariant, autoPageSize, keepWords, look }),
    [density, pagerRowsVariant, autoPageSize, keepWords, look],
  );
  return <TableDefaultsContext.Provider value={value}>{children}</TableDefaultsContext.Provider>;
}
