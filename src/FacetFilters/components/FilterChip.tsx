import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetTestIds } from '../testIds';
import { activeDataSet } from './activeDataSet';
import { ChipChevron } from './ChipChevron';
import { chipTone } from './chipTone';
import { facetStyles as s } from './styles';

const REMOVE_GLYPH = '×';
const LABEL_SEPARATOR = ': ';

export interface FilterChipProps {
  facetKey: string;
  label: string;
  summary: string;
  open: boolean;
  onPress: () => void;
  onRemove?: () => void;
  editHint: string;
  removeLabel: string;
  removeHint: string;
  active?: boolean;
  testIDPrefix?: string;
  chevron?: boolean;
}

/** An active filter: "Label: values" opens its editor, the cross removes the filter. */
export function FilterChip({ facetKey, label, summary, open, onPress, onRemove, editHint, removeLabel, removeHint, active = true, testIDPrefix, chevron = false }: FilterChipProps): React.ReactElement {
  const { theme } = useUi();
  const ids = facetTestIds(testIDPrefix);
  const text = `${label}${LABEL_SEPARATOR}${summary}`;
  return (
    <View style={[s.chip, chipTone(theme, active)]}>
      <Pressable
        accessibilityHint={editHint}
        accessibilityLabel={text}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        {...activeDataSet(active)}
        onPress={onPress}
        style={s.chipBody}
        testID={ids.chip(facetKey)}
      >
        <Text numberOfLines={1} style={[s.chipText, { color: theme.colors.text }]}>
          <Text style={s.chipLabel}>{`${label}${LABEL_SEPARATOR}`}</Text>
          {summary}
          {chevron && <ChipChevron color={theme.colors.textSecondary} />}
        </Text>
      </Pressable>
      {onRemove !== undefined && (
      <Pressable
        accessibilityHint={removeHint}
        accessibilityLabel={removeLabel}
        accessibilityRole="button"
        onPress={onRemove}
        style={s.iconButton}
        testID={ids.chipRemove(facetKey)}
      >
        <Text aria-hidden style={[s.chipText, { color: theme.colors.textSecondary }]}>
          {REMOVE_GLYPH}
        </Text>
      </Pressable>
      )}
    </View>
  );
}
