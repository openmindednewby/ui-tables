import type { StyleProp, ViewStyle } from 'react-native';

const PRESSED_TINT_ALPHA = '33';
const HEX_RGB = /^#[0-9a-f]{6}$/i;
const FOCUS_RING_WIDTH = 2;
const FOCUS_RING_OFFSET = -2;

const POINTER: ViewStyle = { cursor: 'pointer' };

export interface RowInteractionTokens {
  brand: string;
  fallbackTint: string;
}

export interface RowInteractionState {
  pressed: boolean;
  focused?: boolean;
}

/** Pointer cursor always, the pressed brand tint while pressed, the brand focus ring while focused. */
export function rowInteractionStyle(state: RowInteractionState, tokens: RowInteractionTokens): StyleProp<ViewStyle> {
  const pressedTint = HEX_RGB.test(tokens.brand) ? `${tokens.brand}${PRESSED_TINT_ALPHA}` : tokens.fallbackTint;
  return [
    POINTER,
    state.pressed ? { backgroundColor: pressedTint } : null,
    state.focused === true
      ? { outlineStyle: 'solid', outlineWidth: FOCUS_RING_WIDTH, outlineColor: tokens.brand, outlineOffset: FOCUS_RING_OFFSET }
      : null,
  ];
}
