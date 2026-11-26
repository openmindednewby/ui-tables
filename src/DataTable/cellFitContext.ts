import { createContext } from 'react';

/** How the current cell's text fits its box: one line uncut (`noWrap`) or at most `maxLines` lines. */
export interface CellFit {
  noWrap?: boolean;
  maxLines?: number;
}

export const CellFitContext = createContext<CellFit>({});

/** The line cap for a cell's text: 1 for `truncate`, else the column's `maxLines`. */
export function fitLines(truncate: boolean | undefined, maxLines: number | undefined): number | undefined {
  return truncate === true ? 1 : maxLines;
}
