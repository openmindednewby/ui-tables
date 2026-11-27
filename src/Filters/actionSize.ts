import { createContext } from 'react';

/** Whether the bar's action buttons draw at the compact 36 px desktop height (every variant at or above the stack breakpoint). */
export const FiltersCompactActionsContext = createContext<boolean>(false);

/** Whether the bar's action buttons share one full-width row in equal parts (the stacked phone layout). */
export const FiltersStretchActionsContext = createContext<boolean>(false);
