/**
 * Shared StyleSheet for the DataTable family. All colours are applied inline from
 * `useUi().theme` at render time — nothing here carries a colour literal.
 */
import { StyleSheet, type ViewStyle } from 'react-native';

const BORDER_WIDTH = 1;
const BORDER_RADIUS = 12;
const COLUMN_GAP = 16;
const ROW_PAD_H = 14;
const ROW_PAD_V = 12;
const HEAD_PAD_V = 11;
const STATE_PAD_V = 34;
const HEAD_FONT = 12;
const CELL_FONT = 14;
const STATE_FONT = 14;
const CARD_LINE_PAD_V = 3;
const CARD_LINE_GAP = 12;
const PILL_RADIUS = 999;
const PAGER_GAP = 8;
const PAGER_SIZE_GAP = 6;
const CONTROL_PAD_H = 12;
const CONTROL_PAD_V = 6;
const CONTROL_FONT = 13;
const RESULTS_FONT = 13;
const HEAD_LETTER_SPACING = 0.4;
const LABEL_LETTER_SPACING = 0.3;
const STICKY_Z = 2;

/**
 * `position: 'sticky'` is a react-native-web-only value that RN's `ViewStyle`
 * type does not enumerate. Cast through `unknown` (never `any`) so the sticky
 * header stays typed without an eslint `no-explicit-any` violation.
 */
export const STICKY_HEADER_STYLE = {
  position: 'sticky',
  top: 0,
  zIndex: STICKY_Z,
} as unknown as ViewStyle;

export const tableStyles = StyleSheet.create({
  wrap: { borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS, overflow: 'hidden' },
  headRow: { flexDirection: 'row', columnGap: COLUMN_GAP, paddingHorizontal: ROW_PAD_H, paddingVertical: HEAD_PAD_V },
  headCell: { fontSize: HEAD_FONT, fontWeight: '600', letterSpacing: HEAD_LETTER_SPACING, textTransform: 'uppercase' },
  row: { flexDirection: 'row', columnGap: COLUMN_GAP, alignItems: 'center', paddingHorizontal: ROW_PAD_H, paddingVertical: ROW_PAD_V, borderTopWidth: BORDER_WIDTH },
  cell: { fontSize: CELL_FONT, fontWeight: '400' },
  numCell: { fontVariant: ['tabular-nums'], textAlign: 'right' },
  state: { paddingVertical: STATE_PAD_V, alignItems: 'center' },
  stateText: { fontSize: STATE_FONT },
  card: { paddingHorizontal: ROW_PAD_H, paddingVertical: ROW_PAD_V, borderTopWidth: BORDER_WIDTH },
  cardLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: CARD_LINE_PAD_V, gap: CARD_LINE_GAP },
  cardLabel: { fontSize: HEAD_FONT, fontWeight: '600', textTransform: 'uppercase', letterSpacing: LABEL_LETTER_SPACING },
  cardValue: { flexShrink: 1, alignItems: 'flex-end' },
});

export const chromeStyles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', columnGap: COLUMN_GAP, rowGap: PAGER_GAP, borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS, paddingHorizontal: ROW_PAD_H, paddingVertical: ROW_PAD_V },
  filtersSpacer: { flexGrow: 1 },
  results: { fontSize: RESULTS_FONT },
  filtersActions: { flexDirection: 'row', gap: PAGER_SIZE_GAP, alignItems: 'center' },
  pager: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: PAGER_GAP },
  pagerInfo: { fontSize: CONTROL_FONT, fontVariant: ['tabular-nums'] },
  pagerNav: { flexDirection: 'row', alignItems: 'center', gap: PAGER_SIZE_GAP, flexWrap: 'wrap' },
  pagerRowsLabel: { fontSize: HEAD_FONT, textTransform: 'uppercase', letterSpacing: LABEL_LETTER_SPACING },
  sizeGroup: { flexDirection: 'row', gap: PAGER_SIZE_GAP, alignItems: 'center' },
  control: { paddingHorizontal: CONTROL_PAD_H, paddingVertical: CONTROL_PAD_V, borderRadius: BORDER_RADIUS, borderWidth: BORDER_WIDTH },
  controlText: { fontSize: CONTROL_FONT, fontWeight: '600' },
  sizePill: { paddingHorizontal: CONTROL_PAD_H, paddingVertical: CONTROL_PAD_V, borderRadius: PILL_RADIUS, borderWidth: BORDER_WIDTH },
  sizePillText: { fontSize: HEAD_FONT, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
