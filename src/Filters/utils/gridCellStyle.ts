import { Platform, type ViewStyle } from 'react-native';

const FULL_WIDTH = '100%';
const PERCENT = 100;

/** One equal-width cell of an N-column filter grid; one column fills the row. */
export function gridCellStyle(columns: number, gap: number): ViewStyle {
  const n = Math.max(1, Math.floor(columns));
  if (n === 1) return { width: FULL_WIDTH, minWidth: 0, flexGrow: 0 };
  const width = Platform.OS === 'web' ? `calc((100% - ${String((n - 1) * gap)}px) / ${String(n)})` : `${String(Math.floor(PERCENT / n) - 1)}%`;
  return { width: width as ViewStyle['width'], minWidth: 0, flexGrow: 0, flexShrink: 0 };
}
