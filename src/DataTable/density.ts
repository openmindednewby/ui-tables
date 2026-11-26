import { createContext } from 'react';
import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { MIN_TARGET_PX } from '../minTarget';
import { TableDensity } from './TableDensity';
import type { DataTableStyleOverrides } from './types';

export const DENSE_ROW_HEIGHT = 36;
export const DENSE_HEAD_HEIGHT = 34;
export const COMPACT_ROW_HEIGHT = 34;
export const COMPACT_HEAD_HEIGHT = 28;
const DENSE_HEAD_LINE = 16;
const DENSE_CELL_LINE = 20;
const DENSE_ROW_PAD_V = (DENSE_ROW_HEIGHT - DENSE_CELL_LINE) / 2;
const DENSE_HEAD_PAD_V = (DENSE_HEAD_HEIGHT - DENSE_HEAD_LINE) / 2;
const DENSE_GUTTER_BLEED = (DENSE_ROW_HEIGHT - MIN_TARGET_PX) / 2;
const COMPACT_ROW_PAD_V = (COMPACT_ROW_HEIGHT - DENSE_CELL_LINE) / 2;
const COMPACT_HEAD_PAD_V = (COMPACT_HEAD_HEIGHT - DENSE_HEAD_LINE) / 2;
const COMPACT_GUTTER_BLEED = (COMPACT_ROW_HEIGHT - MIN_TARGET_PX) / 2;
/** Each cell carries 10 px each side, so the gutter between two cells is 20 px and the row edge 10 px. */
export const COMPACT_CELL_PAD_H = 10;
const COMPACT_COLUMN_GAP = COMPACT_CELL_PAD_H * 2;
export const COMPACT_CELL_FONT = 13;
export const COMPACT_HEAD_FONT = 11;
/** 0.06em at 11 px. */
const COMPACT_HEAD_TRACKING = 0.66;

const denseStyles = StyleSheet.create({
  headRow: { alignItems: 'center', paddingVertical: DENSE_HEAD_PAD_V, minHeight: DENSE_HEAD_HEIGHT },
  headCell: { lineHeight: DENSE_HEAD_LINE },
  row: { paddingVertical: DENSE_ROW_PAD_V, minHeight: DENSE_ROW_HEIGHT },
  rowSelectCell: { height: MIN_TARGET_PX, marginVertical: DENSE_GUTTER_BLEED },
  cell: {},
});

const compactStyles = StyleSheet.create({
  headRow: { alignItems: 'center', paddingVertical: COMPACT_HEAD_PAD_V, minHeight: COMPACT_HEAD_HEIGHT, paddingHorizontal: COMPACT_CELL_PAD_H, columnGap: COMPACT_COLUMN_GAP },
  headCell: { lineHeight: DENSE_HEAD_LINE, fontSize: COMPACT_HEAD_FONT, letterSpacing: COMPACT_HEAD_TRACKING },
  row: { paddingVertical: COMPACT_ROW_PAD_V, minHeight: COMPACT_ROW_HEIGHT, paddingHorizontal: COMPACT_CELL_PAD_H, columnGap: COMPACT_COLUMN_GAP },
  rowSelectCell: { height: MIN_TARGET_PX, marginVertical: COMPACT_GUTTER_BLEED },
  cell: { fontSize: COMPACT_CELL_FONT, lineHeight: DENSE_CELL_LINE },
});

/** The density-specific slot styles merged after the base table styles. */
export interface DensitySlotStyles {
  headRow: ViewStyle;
  headCell: TextStyle;
  row: ViewStyle;
  rowSelectCell: ViewStyle;
  cell: TextStyle;
}

/**
 * The slot styles a density adds on top of the base table styles.
 * @returns `null` for the default comfortable density, so nothing changes for callers that do not opt in.
 */
export function densitySlotStyles(density: TableDensity): DensitySlotStyles | null {
  if (density === TableDensity.Dense) return denseStyles;
  if (density === TableDensity.Compact) return compactStyles;
  return null;
}

/**
 * The caller's style overrides with the density's text-cell style placed under the caller's own `cell`.
 * @returns the caller's overrides unchanged when the density adds no cell style.
 */
export function withDensityCell(overrides: DataTableStyleOverrides | undefined, dense: DensitySlotStyles | null): DataTableStyleOverrides | undefined {
  if (dense === null || Object.keys(dense.cell).length === 0) return overrides;
  return { ...overrides, cell: [dense.cell, overrides?.cell] };
}

/**
 * The vertical margin that trims a cell's share of the row padding down to `cellPaddingY`.
 * @returns `null` when the column sets none or the density has no row padding, so the row keeps its default height.
 */
export function cellPaddingStyle(density: TableDensity, cellPaddingY: number | undefined): ViewStyle | null {
  if (cellPaddingY === undefined) return null;
  const rowPad = densitySlotStyles(density)?.row.paddingVertical;
  if (typeof rowPad !== 'number') return null;
  return { marginVertical: cellPaddingY - rowPad };
}

export const TableDensityContext = createContext<TableDensity>(TableDensity.Comfortable);
