import { createContext } from 'react';
import type { ViewStyle } from 'react-native';

import { BORDER_RADIUS, BORDER_WIDTH } from './styles';

export type PagedTableLayoutKind = 'toolbar' | 'spaced' | 'footer' | 'panel';

export interface JoinedFrameStyles {
  wrap?: ViewStyle;
  filters?: ViewStyle;
}

const SQUARE = 0;
const INNER_RADIUS = BORDER_RADIUS - BORDER_WIDTH;
const NO_OUTER_BORDER: ViewStyle = { borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, borderLeftWidth: 0 };

function cornerRadii(top: number, bottom: number): ViewStyle {
  return { borderTopLeftRadius: top, borderTopRightRadius: top, borderBottomLeftRadius: bottom, borderBottomRightRadius: bottom };
}

const AT_FRAME_TOP: ViewStyle = { ...NO_OUTER_BORDER, ...cornerRadii(INNER_RADIUS, SQUARE) };
const AT_FRAME_BOTTOM: ViewStyle = { ...NO_OUTER_BORDER, ...cornerRadii(SQUARE, INNER_RADIUS) };

export const JOINED_FRAME_STYLES: Record<PagedTableLayoutKind, JoinedFrameStyles | null> = {
  toolbar: { wrap: AT_FRAME_BOTTOM },
  spaced: null,
  footer: { wrap: AT_FRAME_TOP },
  panel: { wrap: AT_FRAME_BOTTOM, filters: AT_FRAME_TOP },
};

export const JoinedFrameContext = createContext<JoinedFrameStyles | null>(null);
