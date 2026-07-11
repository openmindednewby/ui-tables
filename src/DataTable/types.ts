/**
 * The DataTable contract — a `columns + rows` grid (the shape proven in the POC and
 * carried over unchanged; it is the right API). Every user-facing string is either
 * caller-supplied (already translated by the app's FM) or routed through the
 * UiProvider `t` inside the components — no literals baked into the render.
 */
import type React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

/**
 * Per-slot style overrides for the DataTable, merged **LAST** into each slot's style
 * array so the consumer always wins — over the base StyleSheet AND over the inline
 * colour the component applies from `useUi().theme` (the kit keeps colours out of the
 * StyleSheet, so an override that only beat the base would still lose to the theme).
 *
 * The shared defaults are opinionated but never mandatory: omit `styleOverrides` and
 * the table renders exactly as it always has.
 */
export interface DataTableStyleOverrides {
  /** The bordered, rounded table frame (border radius / border colour / surface). */
  wrap?: StyleProp<ViewStyle>;
  /** The desktop header row (its background comes from `theme.colors.background`). */
  headRow?: StyleProp<ViewStyle>;
  /** A desktop header cell. */
  headCell?: StyleProp<TextStyle>;
  /** A desktop body row. */
  row?: StyleProp<ViewStyle>;
  /**
   * The wrapping `View` of a desktop cell. Unlike `cell` (a TextStyle, which only
   * reaches cells rendering a string/number), this reaches EVERY cell — including
   * ones rendering a custom node (badge, link, action menu) — so it is the slot to
   * use for cell padding/alignment when you need true pixel-parity.
   */
  cellWrap?: StyleProp<ViewStyle>;
  /** The `<Text>` of a cell whose column renders a string/number (both branches). */
  cell?: StyleProp<TextStyle>;
  /** Extra layer applied to numeric cells, after `cell`. */
  numCell?: StyleProp<TextStyle>;
  /** The loading / empty state container. */
  state?: StyleProp<ViewStyle>;
  /** The loading / empty state text. */
  stateText?: StyleProp<TextStyle>;
  /** The full-width detail panel under an expanded row. */
  rowDetail?: StyleProp<ViewStyle>;
  /** A card in the responsive card-stack (below `stackBreakpoint`). */
  card?: StyleProp<ViewStyle>;
  /** One label:value line inside a card. */
  cardLine?: StyleProp<ViewStyle>;
  /** The label of a card line. */
  cardLabel?: StyleProp<TextStyle>;
  /** The value container of a card line. */
  cardValue?: StyleProp<ViewStyle>;
}

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
  /**
   * Below this width (px) rows collapse to a label:value card. Default 640.
   *
   * **Opt out of the card-stack entirely with `stackBreakpoint={0}`**: the stack is
   * chosen by `width < stackBreakpoint`, which is never true for 0, so the desktop
   * grid renders at every width. Use it when your surface never had a card-stack.
   */
  stackBreakpoint?: number;
  /**
   * Per-slot style overrides, merged LAST so the consumer always wins — including over
   * the inline colours taken from `useUi().theme`. Omit for the shared defaults.
   */
  styleOverrides?: DataTableStyleOverrides;
  testID?: string;
}
