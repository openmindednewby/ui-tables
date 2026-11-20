import React, { useState } from 'react';
import { View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { FACET_TEST_IDS, addFacetTestID } from '../constants';
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
}

/** One wrapping row of facet chips with Add filter and Reset; the open chip's editor shows under the row. */
export function FilterChipBar({ facets, values, onChange, defaultValues = {}, labels, leading, testID = FACET_TEST_IDS.bar }: FilterChipBarProps): React.ReactElement {
  const { theme } = useUi();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const active = activeFacetKeys(facets, values);
  const shown = openKey !== null && !active.includes(openKey) ? [...active, openKey] : active;
  const addable = facets.filter((f) => !shown.includes(f.key));
  const openFacet = facets.find((f) => f.key === openKey);

  const startFacet = (key: string): void => {
    setAdding(false);
    setOpenKey(key);
  };

  return (
    <View style={s.stack} testID={testID}>
      <View style={s.bar}>
        {leading}
        {facets.filter((f) => shown.includes(f.key)).map((f) => (
          <FilterChip
            editHint={labels.editHint}
            facetKey={f.key}
            key={f.key}
            label={f.label}
            onPress={() => setOpenKey(openKey === f.key ? null : f.key)}
            onRemove={() => {
              setOpenKey(null);
              onChange(removeFacet(values, f.key));
            }}
            open={openKey === f.key}
            removeHint={labels.removeHint}
            removeLabel={labels.remove(f.label)}
            summary={facetSummary(f, values[f.key] ?? [], labels)}
          />
        ))}
        {addable.length > 0 && (
          <TextButton expanded={adding} hint={labels.addFilterHint} label={labels.addFilter} onPress={() => setAdding(!adding)} testID={FACET_TEST_IDS.addFilter} />
        )}
        {!isSameFacets(values, defaultValues) && (
          <TextButton
            hint={labels.resetHint}
            label={labels.reset}
            onPress={() => {
              setOpenKey(null);
              onChange(defaultValues);
            }}
            testID={FACET_TEST_IDS.reset}
          />
        )}
      </View>
      {adding && (
        <View style={[s.panel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} testID={FACET_TEST_IDS.addMenu}>
          {addable.map((f) => (
            <ToggleOption hint={labels.addFilterHint} key={f.key} label={f.label} onPress={() => startFacet(f.key)} role="checkbox" selected={false} testID={addFacetTestID(f.key)} />
          ))}
        </View>
      )}
      {openFacet !== undefined && (
        <FacetChipEditor facet={openFacet} onToggle={(v) => onChange(toggleFacetValue(values, openFacet.key, v))} optionHint={labels.optionHint} selected={values[openFacet.key] ?? []} />
      )}
    </View>
  );
}
