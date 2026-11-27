import React, { createContext, useContext, useMemo } from 'react';

import { FieldLookProvider } from '@dloizides/ui-forms';

import { ChipLookProvider } from '../FacetFilters/components/ChipLook';
import { LookPreset } from './LookPreset';
import { definedField, hasFieldLook, resolveLookSet, type LookSet, type LookSetOverrides } from './lookSet';

const LookSetContext = createContext<LookSet>(resolveLookSet(LookPreset.Standard));

export interface LookPresetProviderProps {
  /** The density preset every table, chip bar and search field below uses. */
  preset: LookPreset;
  /** Per-part changes over the preset; a component's own `look` prop still wins. */
  overrides?: LookSetOverrides;
  children: React.ReactNode;
}

/** Sets the table, chip and search field looks together for a whole app or section. */
export function LookPresetProvider({ preset, overrides, children }: LookPresetProviderProps): React.ReactElement {
  const table = overrides?.table;
  const searchField = overrides?.searchField;
  const chipSize = overrides?.chips?.size;
  const addFilter = overrides?.chips?.addFilter;
  const fieldSize = overrides?.field?.size;
  const labelVariant = overrides?.field?.labelVariant;
  const value = useMemo(
    () => resolveLookSet(preset, { table, searchField, chips: { size: chipSize, addFilter }, field: definedField(fieldSize, labelVariant) }),
    [preset, table, searchField, chipSize, addFilter, fieldSize, labelVariant],
  );
  const chips = <ChipLookProvider look={value.chips}>{children}</ChipLookProvider>;
  return (
    <LookSetContext.Provider value={value}>
      {hasFieldLook(value.field) ? <FieldLookProvider labelVariant={value.field.labelVariant} size={value.field.size}>{chips}</FieldLookProvider> : chips}
    </LookSetContext.Provider>
  );
}

/** The part looks in effect here; outside a provider, the Standard preset. */
export function useLookSet(): LookSet {
  return useContext(LookSetContext);
}
