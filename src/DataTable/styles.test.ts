import type { ViewStyle } from 'react-native';
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
import { filterStyles } from '../Filters/styles';
import { MIN_TARGET_PX } from '../minTarget';
import { STICKY_HEADER_STYLE, chromeStyles, resolveStickyHeaderStyle, selectionStyles, softBrandTint } from './styles';

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

describe('softBrandTint (row-hover highlight fill)', () => {
  it('appends a low-alpha suffix to a #rrggbb brand colour (re-themes per tenant)', () => {
    expect(softBrandTint('#4f46e5')).toBe('#4f46e51f');
    expect(softBrandTint('#005F73')).toBe('#005F731f');
  });

  it('returns undefined for a non #rrggbb colour so the caller falls back to a surface tint', () => {
    expect(softBrandTint('rgb(79,70,229)')).toBeUndefined();
    expect(softBrandTint('#fff')).toBeUndefined();
    expect(softBrandTint('rebeccapurple')).toBeUndefined();
  });
});

/**
 * SHOWCASE-1 "Publish the UI showcase at ui.dloizides.com" — every pressable's OWN box is the
 * hit target on RN-web (`hitSlop` is inert there). Live QA measured the switches at 40x20, the
 * page-size pills at 32-39x30 and the pager buttons 31px tall; these pin the 44px floor.
 */
describe('44px hit boxes', () => {

  it.each([
    ['pager nav button', chromeStyles.control],
    ['page-size pill', chromeStyles.sizePill],
    ['page-size dropdown trigger', chromeStyles.sizeTrigger],
    ['select checkbox', selectionStyles.checkboxHit],
    ['filter action button', filterStyles.action],
    ['switch wrapper', filterStyles.switchHit],
  ])('%s is at least 44x44', (_name, style) => {
    expect(style.minHeight).toBeGreaterThanOrEqual(MIN_TARGET_PX);
    expect(style.minWidth).toBeGreaterThanOrEqual(MIN_TARGET_PX);
  });

  it.each([
    ['page-size menu option', chromeStyles.sizeOption],
    ['select-all banner action', selectionStyles.bannerHit],
  ])('%s is at least 44px tall', (_name, style) => {
    expect(style.minHeight).toBeGreaterThanOrEqual(MIN_TARGET_PX);
  });

  it('the floor itself is 44px', () => {
    expect(MIN_TARGET_PX).toBe(44);
  });
});

/**
 * TABLES-MOBILE-1 "Filter bar and pager overflow at 360": the Filters actions cluster was a
 * nowrap row — 431px inside a 255px bar on aml-v2 Leaders at 360, Apply off-screen. These fail
 * if the bar, the actions cluster or the pager stops wrapping, or the cluster loses its width cap.
 */
describe('filter bar + pager wrap at narrow widths', () => {
  it.each([
    ['filter bar', chromeStyles.filters],
    ['filter actions cluster', chromeStyles.filtersActions],
    ['pager row', chromeStyles.pager],
    ['pager nav', chromeStyles.pagerNav],
  ])('%s wraps', (_name, style) => {
    expect(style.flexWrap).toBe('wrap');
  });

  it('the actions cluster is capped at the bar width and may shrink, so its wrap can engage', () => {
    expect(chromeStyles.filtersActions.maxWidth).toBe('100%');
    expect(chromeStyles.filtersActions.flexShrink).toBeGreaterThan(0);
  });

  // aml-v2 /app/cases at 360: the pager shares a wrapping title row; with flex-shrink 0 and no
  // width cap it measured 328px in a 255px slot and Next was clipped (TABLES-MOBILE-1).
  it.each<[string, ViewStyle]>([
    ['pager row', chromeStyles.pager],
    ['pager nav', chromeStyles.pagerNav],
  ])('the %s may shrink to its container so its own wrap engages beside a title', (_name, style) => {
    expect(style.flexShrink).toBeGreaterThan(0);
    expect(style.minWidth).toBe(0);
    expect(style.maxWidth).toBe('100%');
  });
});
