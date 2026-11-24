import { createContext } from 'react';

/** How a card-stack line places its label: `Stacked` above the value (default), `Inline` left with the value right. */
export const enum CardLineLayout {
  Stacked = 'stacked',
  Inline = 'inline',
}

export const CardLineLayoutContext = createContext<CardLineLayout>(CardLineLayout.Stacked);
