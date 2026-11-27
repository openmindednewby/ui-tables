import { useMemo } from 'react';
import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { useUi, type UiThemeColors } from '@dloizides/ui-feedback';

import { TableLook } from './TableLookName';

export const BANDED_HEAD_HEIGHT = 36;
export const BANDED_ROW_HEIGHT = 52;
export const BANDED_HEAD_FONT = 12;
export const BANDED_CELL_FONT = 13;
export const BANDED_PAD_H = 14;
export const BANDED_COLUMN_GAP = 16;
const BANDED_HEAD_LINE = 16;
const BANDED_CELL_LINE = 18;
const BANDED_ROW_PAD_V = 8;
const HAIRLINE = 1;

const banded = StyleSheet.create({
  headRow: { alignItems: 'center', borderBottomWidth: HAIRLINE, columnGap: BANDED_COLUMN_GAP, flexDirection: 'row', minHeight: BANDED_HEAD_HEIGHT, paddingHorizontal: BANDED_PAD_H, paddingVertical: 0 },
  headCell: { fontSize: BANDED_HEAD_FONT, fontWeight: '500', letterSpacing: 0, lineHeight: BANDED_HEAD_LINE, textTransform: 'none' },
  row: { alignItems: 'center', columnGap: BANDED_COLUMN_GAP, flexDirection: 'row', minHeight: BANDED_ROW_HEIGHT, paddingHorizontal: BANDED_PAD_H, paddingVertical: BANDED_ROW_PAD_V },
  cell: { fontSize: BANDED_CELL_FONT, lineHeight: BANDED_CELL_LINE },
});

/** The slot styles a look lays over a table's header band, header cells, rows and text cells. */
export interface TableLookStyles {
  /** Colour and height of the header band only, for a table that keeps its own padding (DataTable). */
  band: ViewStyle;
  /** Height and vertical alignment of a row only, for a table that keeps its own padding (DataTable). */
  rowHeight: ViewStyle;
  headRow: ViewStyle;
  headCell: TextStyle;
  row: ViewStyle;
  cell: TextStyle;
}

type LookColors = Pick<UiThemeColors, 'background' | 'border' | 'textSecondary'>;

/**
 * The slot styles of a look, coloured from the theme tokens; the header band takes the page `background` token so it reads against a `surface` card.
 * @returns `null` for `TableLook.Default`, so a table that does not opt in keeps its density's look.
 */
export function tableLookStyles(look: TableLook | undefined, colors: LookColors): TableLookStyles | null {
  if (look !== TableLook.Banded) return null;
  const band = { alignItems: 'center' as const, backgroundColor: colors.background, borderBottomColor: colors.border, borderBottomWidth: HAIRLINE, minHeight: BANDED_HEAD_HEIGHT, paddingVertical: 0 };
  return {
    band,
    rowHeight: { alignItems: 'center', minHeight: BANDED_ROW_HEIGHT },
    headRow: { ...banded.headRow, backgroundColor: colors.background, borderBottomColor: colors.border },
    headCell: { ...banded.headCell, color: colors.textSecondary },
    row: { ...banded.row, borderBottomColor: colors.border },
    cell: banded.cell,
  };
}

/** The look's slot styles from the current UI theme, for hand-built tables that share the DataTable look. */
export function useTableLook(look: TableLook | undefined): TableLookStyles | null {
  const { colors } = useUi().theme;
  return useMemo(() => tableLookStyles(look, colors), [look, colors]);
}

/** One column's share of the row width: the header cell and the row cell of a column take the same style, so they line up. */
export function tableColumnStyle(weight: number, minWidth = 0): ViewStyle {
  return { flexBasis: 0, flexGrow: weight, flexShrink: 1, minWidth };
}
