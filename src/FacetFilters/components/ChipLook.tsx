import React, { createContext, useContext } from 'react';

import { ChipSize } from '../ChipSize';
import { TextButtonVariant } from '../TextButtonVariant';

export interface ChipLook {
  size: ChipSize;
  addFilter: TextButtonVariant;
}

const DEFAULT_LOOK: ChipLook = { size: ChipSize.Regular, addFilter: TextButtonVariant.Plain };
const ChipLookContext = createContext<ChipLook>(DEFAULT_LOOK);

export interface ChipLookProviderProps {
  look: Partial<ChipLook>;
  children: React.ReactNode;
}

/** Sets the chip size and the Add filter look for every chip inside it; outside a provider chips keep the Regular look. */
export function ChipLookProvider({ look, children }: ChipLookProviderProps): React.ReactElement {
  return <ChipLookContext.Provider value={{ ...DEFAULT_LOOK, ...look }}>{children}</ChipLookContext.Provider>;
}

/** The chip look in effect here. */
export function useChipLook(): ChipLook {
  return useContext(ChipLookContext);
}
