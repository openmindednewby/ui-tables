import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetChipRemoveTestID, facetChipTestID } from '../constants';
import { facetStyles as s } from './styles';

const REMOVE_GLYPH = '×';
const LABEL_SEPARATOR = ': ';

export interface FilterChipProps {
  facetKey: string;
  label: string;
  summary: string;
  open: boolean;
  onPress: () => void;
  onRemove: () => void;
  editHint: string;
  removeLabel: string;
  removeHint: string;
}

/** An active filter: "Label: values" opens its editor, the cross removes the filter. */
export function FilterChip({ facetKey, label, summary, open, onPress, onRemove, editHint, removeLabel, removeHint }: FilterChipProps): React.ReactElement {
  const { theme } = useUi();
  const brand = theme.palette.primary['500'];
  const text = `${label}${LABEL_SEPARATOR}${summary}`;
  return (
    <View style={[s.chip, { borderColor: brand, backgroundColor: theme.colors.surface }]}>
      <Pressable
        accessibilityHint={editHint}
        accessibilityLabel={text}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={s.chipBody}
        testID={facetChipTestID(facetKey)}
      >
        <Text numberOfLines={1} style={[s.chipText, { color: theme.colors.text }]}>
          <Text style={s.chipLabel}>{`${label}${LABEL_SEPARATOR}`}</Text>
          {summary}
        </Text>
      </Pressable>
      <Pressable
        accessibilityHint={removeHint}
        accessibilityLabel={removeLabel}
        accessibilityRole="button"
        onPress={onRemove}
        style={s.iconButton}
        testID={facetChipRemoveTestID(facetKey)}
      >
        <Text aria-hidden style={[s.chipText, { color: theme.colors.textSecondary }]}>
          {REMOVE_GLYPH}
        </Text>
      </Pressable>
    </View>
  );
}
