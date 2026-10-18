import type React from 'react';

import type { DataTableColumn } from '../DataTable/types';
import type { LedgerLayout } from './LedgerLayout';
import type { StatusTone } from './StatusTone';

export type SortValue = string | number | null | undefined;

/** A DataTable column that can also be sorted by `sortValue`. */
export interface StatusLedgerColumn<T> extends DataTableColumn<T> {
  sortValue?: (row: T) => SortValue;
}

/** Every user-facing string the ledger renders, already translated by the caller. */
export interface StatusLedgerLabels {
  status: string;
  group: string;
  search: string;
  sortBy: string;
  all: string;
  sortAscending: string;
  sortDescending: string;
  sortDirectionHint: string;
  clear: string;
  clearHint: string;
  results: string;
  needsLook: string;
  everythingElse: string;
  allClear: string;
  empty: string;
  actions: string;
}

export type ToneColors = Partial<Record<StatusTone, string>>;

export interface StatusLedgerProps<T> {
  rows: readonly T[];
  columns: ReadonlyArray<StatusLedgerColumn<T>>;
  keyExtractor: (row: T) => string;
  getStatus: (row: T) => string;
  statusLabel: (status: string) => string;
  statusTone: (status: string) => StatusTone;
  labels: StatusLedgerLabels;
  getGroup?: (row: T) => string;
  groupLabel?: (group: string) => string;
  getSearchText?: (row: T) => string;
  needsLook?: (row: T) => boolean;
  getRowAccessibilityLabel?: (row: T) => string;
  onRowPress?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
  toneColors?: ToneColors;
  layout?: LedgerLayout;
  breakpoint?: number;
  loading?: boolean;
  testID?: string;
}

export interface LedgerFilter {
  status: string;
  group: string;
  text: string;
}

export interface LedgerAccessors<T> {
  getStatus: (row: T) => string;
  getGroup?: (row: T) => string;
  getSearchText?: (row: T) => string;
}
