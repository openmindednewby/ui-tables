import { createContext } from 'react';
import type { ViewStyle } from 'react-native';

import { PagedTableLayoutKind } from './PagedTableLayoutKind';
import { BORDER_RADIUS, BORDER_WIDTH } from './styles';

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
  [PagedTableLayoutKind.Toolbar]: { wrap: AT_FRAME_BOTTOM },
  [PagedTableLayoutKind.Spaced]: null,
  [PagedTableLayoutKind.Footer]: { wrap: AT_FRAME_TOP },
  [PagedTableLayoutKind.Panel]: { wrap: AT_FRAME_BOTTOM, filters: AT_FRAME_TOP },
};

export const JoinedFrameContext = createContext<JoinedFrameStyles | null>(null);
