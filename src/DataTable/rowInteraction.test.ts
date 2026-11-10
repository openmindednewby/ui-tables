import { StyleSheet } from 'react-native';

import { rowInteractionStyle, type RowInteractionTokens } from './rowInteraction';

const tokens: RowInteractionTokens = { brand: '#0f766e', fallbackTint: '#dddddd' };

describe('rowInteractionStyle', () => {
  it('with an idle row, sets only the pointer cursor', () => {
    const state = { pressed: false, focused: false };

    const style = StyleSheet.flatten(rowInteractionStyle(state, tokens));

    expect(style).toEqual({ cursor: 'pointer' });
  });

  it('with a pressed row, applies the stronger brand tint', () => {
    const state = { pressed: true, focused: false };

    const style = StyleSheet.flatten(rowInteractionStyle(state, tokens));

    expect(style.backgroundColor).toBe('#0f766e33');
  });

  it('with a pressed row and a non-hex brand, uses the fallback tint', () => {
    const state = { pressed: true, focused: false };

    const style = StyleSheet.flatten(rowInteractionStyle(state, { ...tokens, brand: 'rgb(1, 2, 3)' }));

    expect(style.backgroundColor).toBe('#dddddd');
  });

  it('with a focused row, draws a solid 2px ring in the brand colour', () => {
    const state = { pressed: false, focused: true };

    const style = StyleSheet.flatten(rowInteractionStyle(state, tokens));

    expect(style).toEqual(expect.objectContaining({ outlineStyle: 'solid', outlineWidth: 2, outlineColor: '#0f766e' }));
  });
});
