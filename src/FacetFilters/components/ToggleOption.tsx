import React from 'react';
import { Pressable, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetStyles as s } from './styles';

const CHECK_MARK = '✓';
const RADIO_ON = '●';
const RADIO_OFF = '○';
const DISABLED_OPACITY = 0.6;

export interface ToggleOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint: string;
  role: 'checkbox' | 'radio';
  disabled?: boolean;
  testID: string;
}

function markFor(role: ToggleOptionProps['role'], selected: boolean): string {
  if (role === 'radio') return selected ? RADIO_ON : RADIO_OFF;
  return selected ? CHECK_MARK : '';
}

/** One pickable row with a mark, so the picked state never relies on colour alone. */
export function ToggleOption({ label, selected, onPress, hint, role, disabled = false, testID }: ToggleOptionProps): React.ReactElement {
  const { theme } = useUi();
  const brand = theme.palette.primary['500'];
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.option, disabled && { opacity: DISABLED_OPACITY }]}
      testID={testID}
    >
      <Text aria-hidden style={[s.mark, { color: brand }]}>
        {markFor(role, selected)}
      </Text>
      <Text style={[s.chipText, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}
