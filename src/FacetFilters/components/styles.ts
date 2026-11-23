import { StyleSheet } from 'react-native';

import { MIN_TARGET_PX } from '../../minTarget';

const RADIUS = 999;
const BORDER = 1;
const PAD_H = 12;
const GAP = 8;
const FONT = 14;
const SMALL_FONT = 12;
const WEIGHT = '600' as const;
const PANEL_RADIUS = 8;
const PANEL_PAD = 8;
const HALF_GAP = GAP / 2;
const WIDE_GAP = GAP * 2;
const MARK_WIDTH = FONT + GAP;

export const facetStyles = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: GAP },
  barScroll: { flexWrap: 'nowrap' },
  chevron: { fontSize: SMALL_FONT },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TARGET_PX,
    borderWidth: BORDER,
    borderRadius: RADIUS,
    overflow: 'hidden',
  },
  chipBody: { minHeight: MIN_TARGET_PX, justifyContent: 'center', paddingHorizontal: PAD_H, flexShrink: 1 },
  chipText: { fontSize: FONT },
  chipLabel: { fontWeight: WEIGHT },
  iconButton: { minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, alignItems: 'center', justifyContent: 'center' },
  textButton: { minHeight: MIN_TARGET_PX, justifyContent: 'center', paddingHorizontal: PAD_H },
  panel: { borderWidth: BORDER, borderRadius: PANEL_RADIUS, padding: PANEL_PAD, gap: HALF_GAP, width: '100%' },
  panelTitle: { fontSize: SMALL_FONT, fontWeight: WEIGHT },
  option: { flexDirection: 'row', alignItems: 'center', gap: GAP, minHeight: MIN_TARGET_PX, paddingHorizontal: PANEL_PAD },
  mark: { width: MARK_WIDTH, textAlign: 'center', fontSize: FONT, fontWeight: WEIGHT },
  stack: { gap: HALF_GAP },
  primary: { fontSize: FONT, fontWeight: WEIGHT },
  secondary: { fontSize: SMALL_FONT },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: WIDE_GAP },
  footerNav: { flexDirection: 'row', marginLeft: 'auto', gap: GAP },
});
