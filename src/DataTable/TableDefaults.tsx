import React, { createContext, useMemo } from 'react';

import { TableDensity } from './TableDensity';

/** App-wide defaults a DataTable falls back to when its own prop is not set. */
export type PagerRowsVariant = 'pills' | 'dropdown';

export interface TableDefaults {
  density: TableDensity;
  pagerRowsVariant?: PagerRowsVariant;
}

const COMFORTABLE_DEFAULTS: TableDefaults = { density: TableDensity.Comfortable };

export const TableDefaultsContext = createContext<TableDefaults>(COMFORTABLE_DEFAULTS);

export interface TableDefaultsProviderProps {
  /** The density every DataTable and StatusLedger below uses unless it passes its own `density`. */
  density: TableDensity;
  pagerRowsVariant?: PagerRowsVariant;
  children: React.ReactNode;
}

/** Sets one table look for a whole app or section, so each table does not repeat the preset. */
export function TableDefaultsProvider({ density, pagerRowsVariant, children }: TableDefaultsProviderProps): React.ReactElement {
  const value = useMemo(() => ({ density, pagerRowsVariant }), [density, pagerRowsVariant]);
  return <TableDefaultsContext.Provider value={value}>{children}</TableDefaultsContext.Provider>;
}
