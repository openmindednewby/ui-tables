/**
 * ActionButton — the themed Apply / Clear button the declarative bar renders in its actions
 * slot. A bordered pill (primary = brand fill, ghost = bordered) kept in-tree so ui-tables
 * needs no ui-buttons dependency; richer buttons (Export with a spinner) go in the caller's
 * own `actions` slot.
 */
import React from 'react';
import { Pressable, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { FILTER_HIT_SLOP, filterStyles as s } from '../styles';

const DISABLED_OPACITY = 0.4;
const FULL_OPACITY = 1;
const TRANSPARENT = 'transparent';

export interface ActionButtonProps {
  label: string;
  hint: string;
  tone: 'primary' | 'ghost';
  disabled?: boolean;
  onPress: () => void;
  testID: string;
}

export function ActionButton({ label, hint, tone, disabled = false, onPress, testID }: ActionButtonProps): React.ReactElement {
  const { theme } = useUi();
  const { colors, palette } = theme;
  const isPrimary = tone === 'primary';
  const brand = palette.primary['500'];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={FILTER_HIT_SLOP}
      onPress={onPress}
      style={[
        s.action,
        {
          borderColor: isPrimary ? brand : colors.border,
          backgroundColor: isPrimary ? brand : TRANSPARENT,
          opacity: disabled ? DISABLED_OPACITY : FULL_OPACITY,
        },
      ]}
      testID={testID}
    >
      <Text style={[s.actionText, { color: isPrimary ? colors.surface : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export default ActionButton;
