import { StyleSheet } from 'react-native';

import { MIN_TARGET_PX } from '../../minTarget';

const RADIUS = 8;
const BORDER = 1;
const PAD_H = 12;
const GAP = 8;
const FONT = 14;
const BADGE_FONT = 12;
const BADGE_SIZE = 20;
const BADGE_RADIUS = 4;
const LENS = 11;
const LENS_BORDER = 1.5;
const HANDLE_LENGTH = 6;
const HANDLE_LEFT = 8;
const HANDLE_TOP = 12;
const GLYPH = 16;

export const searchFieldStyles = StyleSheet.create({
  plain: { borderRadius: RADIUS, borderWidth: BORDER, flexGrow: 1, flexShrink: 1, fontSize: FONT, minHeight: MIN_TARGET_PX, minWidth: 0, paddingHorizontal: PAD_H },
  frame: { alignItems: 'center', borderRadius: RADIUS, borderWidth: BORDER, flexDirection: 'row', flexGrow: 1, flexShrink: 1, gap: GAP, minHeight: MIN_TARGET_PX, minWidth: 0, paddingHorizontal: PAD_H },
  input: { alignSelf: 'stretch', borderWidth: 0, flexGrow: 1, flexShrink: 1, fontSize: FONT, minWidth: 0 },
  glyph: { height: GLYPH, width: GLYPH },
  lens: { borderRadius: LENS, borderWidth: LENS_BORDER, height: LENS, left: 0, position: 'absolute', top: 0, width: LENS },
  handle: { height: LENS_BORDER, left: HANDLE_LEFT, position: 'absolute', top: HANDLE_TOP, transform: [{ rotate: '45deg' }], width: HANDLE_LENGTH },
  badge: { alignItems: 'center', borderRadius: BADGE_RADIUS, borderWidth: BORDER, height: BADGE_SIZE, justifyContent: 'center', minWidth: BADGE_SIZE, paddingHorizontal: BADGE_RADIUS },
  badgeText: { fontSize: BADGE_FONT },
});

export const INNER_OUTLINE_OFF = { outlineStyle: 'none' } as const;
