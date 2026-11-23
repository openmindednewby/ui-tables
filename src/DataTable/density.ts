import { createContext } from 'react';
import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { MIN_TARGET_PX } from '../minTarget';
import { TableDensity } from './TableDensity';

export const DENSE_ROW_HEIGHT = 36;
export const DENSE_HEAD_HEIGHT = 34;
const DENSE_HEAD_LINE = 16;
const DENSE_CELL_LINE = 20;
const DENSE_ROW_PAD_V = (DENSE_ROW_HEIGHT - DENSE_CELL_LINE) / 2;
const DENSE_HEAD_PAD_V = (DENSE_HEAD_HEIGHT - DENSE_HEAD_LINE) / 2;
const DENSE_GUTTER_BLEED = (DENSE_ROW_HEIGHT - MIN_TARGET_PX) / 2;

const denseStyles = StyleSheet.create({
  headRow: { alignItems: 'center', paddingVertical: DENSE_HEAD_PAD_V, minHeight: DENSE_HEAD_HEIGHT },
  headCell: { lineHeight: DENSE_HEAD_LINE },
  row: { paddingVertical: DENSE_ROW_PAD_V, minHeight: DENSE_ROW_HEIGHT },
  rowSelectCell: { height: MIN_TARGET_PX, marginVertical: DENSE_GUTTER_BLEED },
});

/** The density-specific slot styles merged after the base table styles. */
export interface DensitySlotStyles {
  headRow: ViewStyle;
  headCell: TextStyle;
  row: ViewStyle;
  rowSelectCell: ViewStyle;
}

/**
 * The slot styles a density adds on top of the base table styles.
 * @returns `null` for the default comfortable density, so nothing changes for callers that do not opt in.
 */
export function densitySlotStyles(density: TableDensity): DensitySlotStyles | null {
  return density === TableDensity.Dense ? denseStyles : null;
}

export const TableDensityContext = createContext<TableDensity>(TableDensity.Comfortable);
