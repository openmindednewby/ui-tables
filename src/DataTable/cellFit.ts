import { Platform, type DimensionValue, type TextStyle } from 'react-native';

const WEB = 'web';
const INTRINSIC_MIN: DimensionValue = 'auto';
const WHOLE_CONTENT_MIN = 'max-content' as DimensionValue;

export const NO_WRAP_TEXT = { whiteSpace: 'nowrap' } as TextStyle;

/** A desktop cell's width floor: the column's own, else on web with `keepWords` its longest word, so no word breaks in the middle. */
export function cellMinWidth(minWidth: number | undefined, truncate: boolean | undefined, keepWords: boolean | undefined, noWrap?: boolean): DimensionValue | undefined {
  if (minWidth !== undefined) return minWidth;
  if ((keepWords !== true && noWrap !== true) || truncate === true || Platform.OS !== WEB) return undefined;
  return noWrap === true ? WHOLE_CONTENT_MIN : INTRINSIC_MIN;
}

interface TitledNode {
  setAttribute: (name: string, value: string) => void;
}

function isTitledNode(node: unknown): node is TitledNode {
  return typeof node === 'object' && node !== null && typeof (node as Partial<TitledNode>).setAttribute === 'function';
}

/** A ref that puts the full text of a truncated cell in its web `title`, so the cut text is still readable. */
export function titleRef(text: string): (node: unknown) => void {
  return (node: unknown): void => {
    if (isTitledNode(node)) node.setAttribute('title', text);
  };
}
