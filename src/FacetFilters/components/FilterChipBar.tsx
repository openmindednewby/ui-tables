import React from 'react';
import { ScrollView, View } from 'react-native';

import { ChipBarLayout } from '../ChipBarLayout';

import { useChipBarState } from '../hooks/useChipBarState';
import { facetTestIds } from '../testIds';
import type { FacetDefinition, FacetValues, FilterChipBarLabels } from '../types';
import { facetSummary, isSameFacets, removeFacet, toggleFacetValue } from '../utils/facetState';
import { AddFilterMenu } from './AddFilterMenu';
import { useChipLook } from './ChipLook';
import { FacetChipEditor } from './FacetChipEditor';
import { FilterChip } from './FilterChip';
import { TextButton } from './TextButton';
import { facetStyles as s } from './styles';

export interface FilterChipBarProps {
  facets: readonly FacetDefinition[];
  values: FacetValues;
  onChange: (values: FacetValues) => void;
  defaultValues?: FacetValues;
  labels: FilterChipBarLabels;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  testID?: string;
  testIDPrefix?: string;
  pinnedKeys?: readonly string[];
  layout?: ChipBarLayout;
  chevron?: boolean;
}

const NO_KEYS: readonly string[] = [];
const NO_VALUES: FacetValues = {};

/** A row of facet chips with Add filter and Reset; `trailing` replaces Reset, `layout` Scroll keeps one sideways-scrolling row. */
export function FilterChipBar({ facets, values, onChange, defaultValues = NO_VALUES, labels, leading, trailing, testID, testIDPrefix, pinnedKeys = NO_KEYS, layout = ChipBarLayout.Wrap, chevron = false }: FilterChipBarProps): React.ReactElement {
  const ids = facetTestIds(testIDPrefix);
  const bar = useChipBarState(facets, values, pinnedKeys);
  const addFilterVariant = useChipLook().addFilter;
  const open = bar.openFacet;
  const closeAndChange = (next: FacetValues): void => {
    bar.closeEditor();
    onChange(next);
  };
  const showReset = trailing === undefined && !isSameFacets(values, defaultValues);

  const chips = (
    <>
      {leading}
      {bar.shown.map((f) => (
        <FilterChip
          active={bar.active.includes(f.key)}
          chevron={chevron}
          editHint={labels.editHint}
          facetKey={f.key}
          key={f.key}
          label={f.label}
          onPress={() => bar.toggleOpen(f.key)}
          onRemove={bar.active.includes(f.key) || !pinnedKeys.includes(f.key) ? () => closeAndChange(removeFacet(values, f.key)) : undefined}
          open={bar.openKey === f.key}
          removeHint={labels.removeHint}
          removeLabel={labels.remove(f.label)}
          summary={facetSummary(f, values[f.key] ?? [], labels)}
          testIDPrefix={testIDPrefix}
        />
      ))}
      {bar.addable.length > 0 && <TextButton expanded={bar.adding} hint={labels.addFilterHint} label={labels.addFilter} onPress={bar.toggleAdding} testID={ids.addFilter} variant={addFilterVariant} />}
      {showReset && <TextButton hint={labels.resetHint} label={labels.reset} onPress={() => closeAndChange(defaultValues)} testID={ids.reset} />}
      {trailing}
    </>
  );

  return (
    <View style={s.stack} testID={testID ?? ids.bar}>
      {layout === ChipBarLayout.Scroll ? (
        <ScrollView horizontal contentContainerStyle={[s.bar, s.barScroll]} showsHorizontalScrollIndicator={false} testID={`${testID ?? ids.bar}-scroll`}>
          {chips}
        </ScrollView>
      ) : (
        <View style={s.bar}>{chips}</View>
      )}
      {bar.adding && <AddFilterMenu facets={bar.addable} hint={labels.addFilterHint} ids={ids} onPick={bar.startFacet} />}
      {open !== undefined && (
        <FacetChipEditor facet={open} onToggle={(v) => onChange(toggleFacetValue(values, open.key, v))} optionHint={labels.optionHint} selected={values[open.key] ?? []} testIDPrefix={testIDPrefix} />
      )}
    </View>
  );
}
