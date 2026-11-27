import { StyleSheet } from 'react-native';

import { MIN_TARGET_PX } from '../../minTarget';

export const COMPACT_PILL_PX = 30;
const PILL_INSET = (MIN_TARGET_PX - COMPACT_PILL_PX) / 2;
const RADIUS = 999;
const BORDER = 1;
const PAD_H = 10;
const FONT = 13;

export const chipSizeStyles = StyleSheet.create({
  shell: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TARGET_PX, position: 'relative' },
  backdrop: { position: 'absolute', left: 0, right: 0, top: PILL_INSET, bottom: PILL_INSET, borderWidth: BORDER, borderRadius: RADIUS },
  dashed: { borderStyle: 'dashed' },
  body: { minHeight: MIN_TARGET_PX, justifyContent: 'center', paddingHorizontal: PAD_H, flexShrink: 1 },
  text: { fontSize: FONT },
});
