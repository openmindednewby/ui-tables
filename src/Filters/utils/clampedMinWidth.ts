import { Platform, type ViewStyle } from 'react-native';

/**
 * A filter field's minimum width, never wider than its container.
 *
 * `minWidth` beats `maxWidth` in both CSS and Yoga, so a 260px date-range floor inside a ~330px phone
 * card still overflowed with `maxWidth: '100%'` alone. On web `min(Npx, 100%)` keeps the exact floor
 * at desktop widths (the bar wraps fields at the same breakpoints as before) and yields to the
 * container below it. Native keeps the plain number: Yoga has no `min()`.
 */
export function clampedMinWidth(minWidth: number): ViewStyle['minWidth'] {
  if (Platform.OS !== 'web') return minWidth;
  return `min(${minWidth}px, 100%)` as unknown as ViewStyle['minWidth'];
}
