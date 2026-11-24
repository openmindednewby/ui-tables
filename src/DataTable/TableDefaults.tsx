import React, { createContext, useMemo } from 'react';

import { TableDensity } from './TableDensity';

/** App-wide defaults a DataTable falls back to when its own prop is not set. */
export interface TableDefaults {
  density: TableDensity;
}

const COMFORTABLE_DEFAULTS: TableDefaults = { density: TableDensity.Comfortable };

export const TableDefaultsContext = createContext<TableDefaults>(COMFORTABLE_DEFAULTS);

export interface TableDefaultsProviderProps {
  /** The density every DataTable and StatusLedger below uses unless it passes its own `density`. */
  density: TableDensity;
  children: React.ReactNode;
}

/** Sets one table look for a whole app or section, so each table does not repeat the preset. */
export function TableDefaultsProvider({ density, children }: TableDefaultsProviderProps): React.ReactElement {
  const value = useMemo(() => ({ density }), [density]);
  return <TableDefaultsContext.Provider value={value}>{children}</TableDefaultsContext.Provider>;
}
