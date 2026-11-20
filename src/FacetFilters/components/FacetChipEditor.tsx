import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { FACET_TEST_IDS, facetOptionTestID } from '../constants';
import type { FacetDefinition } from '../types';
import { ToggleOption } from './ToggleOption';
import { facetStyles as s } from './styles';

export interface FacetChipEditorProps {
  facet: FacetDefinition;
  selected: readonly string[];
  onToggle: (value: string) => void;
  optionHint: string;
  testID?: string;
}

/** The open facet chip: every option of one facet as a checkbox row. */
export function FacetChipEditor({ facet, selected, onToggle, optionHint, testID = FACET_TEST_IDS.editor }: FacetChipEditorProps): React.ReactElement {
  const { theme } = useUi();
  return (
    <View
      accessibilityLabel={facet.label}
      accessibilityRole="list"
      style={[s.panel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
      testID={testID}
    >
      <Text style={[s.panelTitle, { color: theme.colors.textSecondary }]}>{facet.label}</Text>
      {facet.options.map((o) => (
        <ToggleOption
          hint={optionHint}
          key={o.value}
          label={o.label}
          onPress={() => onToggle(o.value)}
          role="checkbox"
          selected={selected.includes(o.value)}
          testID={facetOptionTestID(facet.key, o.value)}
        />
      ))}
    </View>
  );
}
