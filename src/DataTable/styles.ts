/**
 * Shared StyleSheet for the DataTable family. All colours are applied inline from
 * `useUi().theme` at render time — nothing here carries a colour literal.
 */
import { Platform, StyleSheet, type ViewStyle } from 'react-native';

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
const CHEVRON_FONT = 10;
const MENU_TOP_GAP = 4;
const MENU_PAD_V = 4;
const MENU_MIN_WIDTH = 80;
const MENU_OPT_PAD_V = 7;
const MENU_Z_INDEX = 1000;
const MENU_ELEVATION = 8;
/** Soft drop shadow so the rows-per-page popover reads as floating above the page (mirrors ui-layout's InlineMenu). */
const MENU_BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.15)';
const RESULTS_FONT = 13;
const HEAD_LETTER_SPACING = 0.4;
const LABEL_LETTER_SPACING = 0.3;
const STICKY_Z = 2;
const FULL_WIDTH = '100%' as const;
/** The checkbox column's width — a fixed gutter, so header and rows line up exactly. */
const SELECT_COL_WIDTH = 20;
const CHECKBOX_SIZE = 18;
const CHECKBOX_RADIUS = 4;
const CHECKBOX_GLYPH_FONT = 11;
const CHECKBOX_GLYPH_LINE = 13;
const BANNER_PAD_V = 8;
const BANNER_FONT = 13;
const BANNER_GAP = 6;

/**
 * `position: 'sticky'` is a react-native-web-only value that RN's `ViewStyle`
 * type does not enumerate. Cast through `unknown` (never `any`) so the sticky
 * header stays typed without an eslint `no-explicit-any` violation.
 *
 * This is a KNOWN, deliberate web-only escape hatch — but it must never reach a
 * native renderer: RN's style parser maps `position` onto a Yoga enum and an
 * unrecognised value is a hard error on the native side (it is NOT silently
 * ignored the way an unknown web CSS value is). So we emit it on web ONLY and
 * degrade to a normal, non-sticky header on iOS/Android.
 */
const STICKY_WEB_STYLE = {
  position: 'sticky',
  top: 0,
  zIndex: STICKY_Z,
} as unknown as ViewStyle;

/**
 * The sticky-header style for a platform: the web-only `position: 'sticky'`
 * block on web, `null` (no sticky, no invalid enum) everywhere else.
 * `platformOs` is injectable purely so both branches are unit-testable — the
 * Jest suite runs on react-native-web, where `Platform.OS` is always `'web'`.
 */
export function resolveStickyHeaderStyle(platformOs: string): ViewStyle | null {
  return platformOs === 'web' ? STICKY_WEB_STYLE : null;
}

export const STICKY_HEADER_STYLE: ViewStyle | null = resolveStickyHeaderStyle(Platform.OS);

/** Alpha suffix (~12%) for the soft brand row-hover tint, mirroring the v1 `--brand-soft` fill. */
const HOVER_TINT_ALPHA = '1f';
const HEX_RGB = /^#[0-9a-f]{6}$/i;

/**
 * The soft brand tint used for the web row-hover highlight on clickable rows — the
 * theme's `palette.primary['500']` at low alpha, so it re-themes per tenant (v1's
 * `.ui-table--zebra tbody tr.clickable:hover` used `--brand-soft`). Returns `undefined`
 * when `primary` is not a plain `#rrggbb` so the caller can fall back to a surface tint.
 */
export function softBrandTint(primary: string): string | undefined {
  return HEX_RGB.test(primary) ? `${primary}${HOVER_TINT_ALPHA}` : undefined;
}

export const tableStyles = StyleSheet.create({
  wrap: { borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS, overflow: 'hidden' },
  headRow: { flexDirection: 'row', columnGap: COLUMN_GAP, paddingHorizontal: ROW_PAD_H, paddingVertical: HEAD_PAD_V },
  headCell: { fontSize: HEAD_FONT, fontWeight: '600', letterSpacing: HEAD_LETTER_SPACING, textTransform: 'uppercase' },
  row: { flexDirection: 'row', columnGap: COLUMN_GAP, alignItems: 'center', paddingHorizontal: ROW_PAD_H, paddingVertical: ROW_PAD_V, borderTopWidth: BORDER_WIDTH },
  cell: { fontSize: CELL_FONT, fontWeight: '400' },
  numCell: { fontVariant: ['tabular-nums'], textAlign: 'right' },
  state: { paddingVertical: STATE_PAD_V, alignItems: 'center' },
  stateText: { fontSize: STATE_FONT },
  /** Full-width panel under an expanded row — spans every column (the wrap is a column flexbox). */
  rowDetail: { width: FULL_WIDTH, paddingHorizontal: ROW_PAD_H, paddingVertical: ROW_PAD_V, borderTopWidth: BORDER_WIDTH },
  card: { paddingHorizontal: ROW_PAD_H, paddingVertical: ROW_PAD_V, borderTopWidth: BORDER_WIDTH },
  cardLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: CARD_LINE_PAD_V, gap: CARD_LINE_GAP },
  cardLabel: { fontSize: HEAD_FONT, fontWeight: '600', textTransform: 'uppercase', letterSpacing: LABEL_LETTER_SPACING },
  cardValue: { flexShrink: 1, alignItems: 'flex-end' },
});

/**
 * Bulk-select slots. Separate from `tableStyles` so a consumer that never selects anything
 * pays for none of it, and so the checkbox gutter's width lives in exactly one place —
 * header and body read the SAME `selectCell`, which is what keeps the columns aligned.
 */
export const selectionStyles = StyleSheet.create({
  /** The fixed-width gutter holding the checkbox, in both the header and every row. */
  selectCell: { width: SELECT_COL_WIDTH, alignItems: 'flex-start', justifyContent: 'center' },
  /** The checkbox's pressable area (the hit target is grown further with `hitSlop`). */
  checkboxHit: { alignItems: 'center', justifyContent: 'center' },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: CHECKBOX_RADIUS,
    borderWidth: BORDER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxGlyph: { fontSize: CHECKBOX_GLYPH_FONT, lineHeight: CHECKBOX_GLYPH_LINE, fontWeight: '700' },
  /**
   * The cells of a SELECTABLE row, wrapped so the checkbox can sit OUTSIDE the pressable
   * area. `flex: 1` so the cells still claim the row minus the checkbox gutter.
   */
  rowContent: { flex: 1, flexDirection: 'row', columnGap: COLUMN_GAP, alignItems: 'center' },
  /** The same, for the card-stack: a card's lines are a column, not a row. */
  cardContent: { flex: 1 },
  /** The select-all-matching banner, spanning the table above the header. */
  banner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BANNER_GAP,
    paddingHorizontal: ROW_PAD_H,
    paddingVertical: BANNER_PAD_V,
  },
  bannerText: { fontSize: BANNER_FONT },
  bannerAction: { fontSize: BANNER_FONT, fontWeight: '700', textDecorationLine: 'underline' },
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
  /** Mixed-case "Rows" caption for the dropdown variant (v1's muted `.hint` label — no uppercase transform). */
  pagerRowsLabelPlain: { fontSize: HEAD_FONT, letterSpacing: LABEL_LETTER_SPACING },
  sizeGroup: { flexDirection: 'row', gap: PAGER_SIZE_GAP, alignItems: 'center' },
  control: { paddingHorizontal: CONTROL_PAD_H, paddingVertical: CONTROL_PAD_V, borderRadius: BORDER_RADIUS, borderWidth: BORDER_WIDTH },
  controlText: { fontSize: CONTROL_FONT, fontWeight: '600' },
  sizePill: { paddingHorizontal: CONTROL_PAD_H, paddingVertical: CONTROL_PAD_V, borderRadius: PILL_RADIUS, borderWidth: BORDER_WIDTH },
  sizePillText: { fontSize: HEAD_FONT, fontWeight: '600', fontVariant: ['tabular-nums'] },
  /** Dropdown variant: relatively-positioned wrapper holding the trigger + the anchored popover. */
  sizeAnchor: { position: 'relative' },
  /** Dropdown variant: the compact `<select>`-like trigger (bordered ghost look, height-matched to Prev/Next) + chevron. */
  sizeTrigger: { flexDirection: 'row', alignItems: 'center', gap: PAGER_SIZE_GAP, paddingHorizontal: CONTROL_PAD_H, paddingVertical: CONTROL_PAD_V, borderRadius: BORDER_RADIUS, borderWidth: BORDER_WIDTH },
  sizeTriggerText: { fontSize: CONTROL_FONT, fontWeight: '600', fontVariant: ['tabular-nums'] },
  sizeChevron: { fontSize: CHEVRON_FONT },
  /** Dropdown variant: the anchored popover listing the rows-per-page options. */
  sizeMenu: { position: 'absolute', top: '100%', right: 0, marginTop: MENU_TOP_GAP, minWidth: MENU_MIN_WIDTH, borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS, paddingVertical: MENU_PAD_V, zIndex: MENU_Z_INDEX, boxShadow: MENU_BOX_SHADOW, elevation: MENU_ELEVATION },
  sizeOption: { paddingHorizontal: CONTROL_PAD_H, paddingVertical: MENU_OPT_PAD_V },
  sizeOptionText: { fontSize: CONTROL_FONT, fontVariant: ['tabular-nums'] },
});
