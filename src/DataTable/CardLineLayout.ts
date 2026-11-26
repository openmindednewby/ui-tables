import { createContext } from 'react';

/** How a card-stack places its lines: `Stacked` label above value (default), `Inline` label left and value right, `Compact` a bold title plus one `Label: value · Label: value` line. */
export const enum CardLineLayout {
  Stacked = 'stacked',
  Inline = 'inline',
  Compact = 'compact',
}

export const CardLineLayoutContext = createContext<CardLineLayout>(CardLineLayout.Stacked);
