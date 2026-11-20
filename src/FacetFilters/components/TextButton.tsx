import React from 'react';
import { Pressable, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetStyles as s } from './styles';

export interface TextButtonProps {
  label: string;
  hint: string;
  onPress: () => void;
  expanded?: boolean;
  testID: string;
}

/** A quiet 44 px text action used for Add filter, Reset and Clear. */
export function TextButton({ label, hint, onPress, expanded, testID }: TextButtonProps): React.ReactElement {
  const { theme } = useUi();
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      onPress={onPress}
      style={s.textButton}
      testID={testID}
    >
      <Text style={[s.chipText, s.chipLabel, { color: theme.palette.primary['500'] }]}>{label}</Text>
    </Pressable>
  );
}
