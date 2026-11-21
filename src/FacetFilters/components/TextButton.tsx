import React from 'react';
import { Pressable, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { readableInk } from './readableInk';
import { facetStyles as s } from './styles';

const DISABLED_OPACITY = 0.5;

export interface TextButtonProps {
  label: string;
  hint: string;
  onPress: () => void;
  expanded?: boolean;
  disabled?: boolean;
  testID: string;
}

/** A quiet 44 px text action used for Add filter, Reset and Clear. */
export function TextButton({ label, hint, onPress, expanded, disabled = false, testID }: TextButtonProps): React.ReactElement {
  const { theme } = useUi();
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={expanded === undefined && !disabled ? undefined : { expanded, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.textButton, disabled && { opacity: DISABLED_OPACITY }]}
      testID={testID}
    >
      <Text style={[s.chipText, s.chipLabel, { color: readableInk(theme.palette.primary['500'], [theme.colors.background, theme.colors.surface], theme.colors.text) }]}>{label}</Text>
    </Pressable>
  );
}
