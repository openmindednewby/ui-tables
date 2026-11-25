import { Platform, type ViewStyle } from 'react-native';

const FULL_WIDTH = '100%';
const PERCENT = 100;

/** A cell of an N-column filter grid spanning `span` columns; one column fills the row. */
export function gridCellStyle(columns: number, gap: number, span = 1): ViewStyle {
  const n = Math.max(1, Math.floor(columns));
  if (n === 1) return { width: FULL_WIDTH, minWidth: 0, flexGrow: 0 };
  const k = Math.min(n, Math.max(1, Math.floor(span)));
  const single = `calc((100% - ${String((n - 1) * gap)}px) / ${String(n)})`;
  const spanned = k === 1 ? single : `calc((100% - ${String((n - 1) * gap)}px) / ${String(n)} * ${String(k)} + ${String((k - 1) * gap)}px)`;
  const width = Platform.OS === 'web' ? spanned : `${String(Math.floor((PERCENT * k) / n) - 1)}%`;
  return { width: width as ViewStyle['width'], minWidth: 0, flexGrow: 0, flexShrink: 0 };
}
