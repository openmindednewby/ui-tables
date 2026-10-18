import { createContext, useContext } from 'react';

const RowPressContext = createContext<(() => void) | undefined>(undefined);

export const RowPressProvider = RowPressContext.Provider;

/** The enclosing interactive row's press handler, so a pressable cell can also open its row. */
export const useRowPress = (): (() => void) | undefined => useContext(RowPressContext);
