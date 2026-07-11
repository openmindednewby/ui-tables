/**
 * Native-safety tests for the sticky-header escape hatch.
 *
 * `position: 'sticky'` is a react-native-web-only value. It is a DELIBERATE,
 * documented web-only escape hatch — but it must not reach a native renderer:
 * RN maps `position` onto a Yoga enum and an unrecognised value is an error on
 * the native side (unlike an unknown CSS value on the web, which is ignored).
 *
 * The Jest suite runs on react-native-web (`Platform.OS === 'web'`), so the
 * native branch is exercised through the injectable `resolveStickyHeaderStyle`.
 */
import { STICKY_HEADER_STYLE, resolveStickyHeaderStyle } from './styles';

describe('resolveStickyHeaderStyle', () => {
  it('emits the web-only sticky block on web (unchanged web rendering)', () => {
    expect(resolveStickyHeaderStyle('web')).toEqual({ position: 'sticky', top: 0, zIndex: 2 });
  });

  it('emits nothing on iOS — no invalid position enum reaches the native renderer', () => {
    expect(resolveStickyHeaderStyle('ios')).toBeNull();
  });

  it('emits nothing on Android', () => {
    expect(resolveStickyHeaderStyle('android')).toBeNull();
  });

  it('resolves the web block under the test platform (react-native-web)', () => {
    expect(STICKY_HEADER_STYLE).toEqual({ position: 'sticky', top: 0, zIndex: 2 });
  });
});
