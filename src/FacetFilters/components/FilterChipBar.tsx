import React, { useState } from 'react';
import { View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetTestIds } from '../testIds';
import type { FacetDefinition, FacetValues, FilterChipBarLabels } from '../types';
import { activeFacetKeys, facetSummary, isSameFacets, removeFacet, toggleFacetValue } from '../utils/facetState';
import { FacetChipEditor } from './FacetChipEditor';
import { FilterChip } from './FilterChip';
import { TextButton } from './TextButton';
import { ToggleOption } from './ToggleOption';
import { facetStyles as s } from './styles';

export interface FilterChipBarProps {
  facets: readonly FacetDefinition[];
  values: FacetValues;
  onChange: (values: FacetValues) => void;
  defaultValues?: FacetValues;
  labels: FilterChipBarLabels;
  leading?: React.ReactNode;
  testID?: string;
  testIDPrefix?: string;
  pinnedKeys?: readonly string[];
  alwaysShowReset?: boolean;
  onReset?: () => void;
}

const NO_KEYS: readonly string[] = [];

function shownKeys(active: readonly string[], pinned: readonly string[], openKey: string | null): readonly string[] {
  const keys = new Set([...pinned, ...active]);
  if (openKey !== null) keys.add(openKey);
  return [...keys];
}

/** One wrapping row of facet chips with Add filter and Reset; the open chip's editor shows under the row. */
export function FilterChipBar({ facets, values, onChange, defaultValues = {}, labels, leading, testID, testIDPrefix, pinnedKeys = NO_KEYS, alwaysShowReset = false, onReset }: FilterChipBarProps): React.ReactElement {
  const { theme } = useUi();
  const ids = facetTestIds(testIDPrefix);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const active = activeFacetKeys(facets, values);
  const shown = shownKeys(active, pinnedKeys, openKey);
  const addable = facets.filter((f) => !shown.includes(f.key));
  const openFacet = facets.find((f) => f.key === openKey);

  const startFacet = (key: string): void => {
    setAdding(false);
    setOpenKey(key);
  };
  const removeKey = (key: string): void => {
    setOpenKey(null);
    onChange(removeFacet(values, key));
  };
  const resetAll = (): void => {
    setOpenKey(null);
    if (onReset === undefined) onChange(defaultValues);
    else onReset();
  };

  return (
    <View style={s.stack} testID={testID ?? ids.bar}>
      <View style={s.bar}>
        {leading}
        {facets.filter((f) => shown.includes(f.key)).map((f) => (
          <FilterChip
            active={active.includes(f.key)}
            editHint={labels.editHint}
            facetKey={f.key}
            key={f.key}
            label={f.label}
            onPress={() => setOpenKey(openKey === f.key ? null : f.key)}
            onRemove={active.includes(f.key) || !pinnedKeys.includes(f.key) ? () => removeKey(f.key) : undefined}
            open={openKey === f.key}
            removeHint={labels.removeHint}
            removeLabel={labels.remove(f.label)}
            summary={facetSummary(f, values[f.key] ?? [], labels)}
            testIDPrefix={testIDPrefix}
          />
        ))}
        {addable.length > 0 && (
          <TextButton expanded={adding} hint={labels.addFilterHint} label={labels.addFilter} onPress={() => setAdding(!adding)} testID={ids.addFilter} />
        )}
        {(alwaysShowReset || !isSameFacets(values, defaultValues)) && (
          <TextButton hint={labels.resetHint} label={labels.reset} onPress={resetAll} testID={ids.reset} />
        )}
      </View>
      {adding && (
        <View style={[s.panel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} testID={ids.addMenu}>
          {addable.map((f) => (
            <ToggleOption hint={labels.addFilterHint} key={f.key} label={f.label} onPress={() => startFacet(f.key)} role="checkbox" selected={false} testID={ids.addFacet(f.key)} />
          ))}
        </View>
      )}
      {openFacet !== undefined && (
        <FacetChipEditor facet={openFacet} onToggle={(v) => onChange(toggleFacetValue(values, openFacet.key, v))} optionHint={labels.optionHint} selected={values[openFacet.key] ?? []} testIDPrefix={testIDPrefix} />
      )}
    </View>
  );
}
