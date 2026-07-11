/**
 * The DataTable contract — a `columns + rows` grid (the shape proven in the POC and
 * carried over unchanged; it is the right API). Every user-facing string is either
 * caller-supplied (already translated by the app's FM) or routed through the
 * UiProvider `t` inside the components — no literals baked into the render.
 */
import type React from 'react';

export interface DataTableColumn<T> {
  /** Stable column id (used for React keys + per-cell test ids). */
  key: string;
  /** Column header text. Also the `label` in the mobile label:value card-stack. */
  header: string;
  /** Right-align + tabular figures for numeric columns (GRID.md `.num`). */
  numeric?: boolean;
  /** Flex weight on desktop. Default 1. */
  weight?: number;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: readonly T[];
  keyExtractor: (row: T) => string;
  /** Optional per-row background tint (e.g. gap rows). Wins over `zebra`. */
  rowTint?: (row: T) => string | undefined;
  /** Even-row striping (GRID.md `.ui-table--zebra`). Ignored on rows that have a `rowTint`. */
  zebra?: boolean;
  /** Keep the header pinned while the body scrolls (web `position: sticky`). */
  stickyHeader?: boolean;
  /** Make rows pressable (GRID.md `is-click`). Enables row accessibilityRole=button. */
  onRowPress?: (row: T) => void;
  /** Per-row accessibility label. Falls back to the kit's `rowLabel` translation. */
  getRowAccessibilityLabel?: (row: T) => string;
  /**
   * Render a full-width detail panel beneath a row (spanning every column), for
   * expandable-row surfaces (e.g. an audit log's before/after snapshots). The
   * panel renders only for rows whose `keyExtractor` key is in `expandedRowKeys`,
   * and sits between that row and the next — in the card-stack mode too.
   * Omit for a plain table (nothing about the row rendering changes).
   */
  renderRowDetail?: (row: T) => React.ReactNode;
  /**
   * Keys (as produced by `keyExtractor`) of the rows currently expanded. Expansion
   * is CONTROLLED by the caller: own the state, toggle it from `onRowPress`. The
   * table adds no chevron and keeps no internal expand state.
   */
  expandedRowKeys?: readonly string[];
  loading?: boolean;
  /** Loading text (already translated). Falls back to the kit's `loading` translation. */
  loadingLabel?: string;
  /** Empty text (already translated). Falls back to the kit's `empty` translation. */
  emptyLabel?: string;
  /** Below this width (px) rows collapse to a label:value card. Default 640. */
  stackBreakpoint?: number;
  testID?: string;
}
