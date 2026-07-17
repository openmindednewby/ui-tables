/**
 * BooleanField — a themed RN `Switch` for a boolean filter (aml's `includeRelatives` /
 * `prioritize`). The label sits inline to the LEFT of the switch (switch-row idiom), not
 * above it, so it reads as a toggle rather than an input.
 */
import React from 'react';
import { Switch, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { fieldTestID } from '../constants';
import { filterStyles as s } from '../styles';
import type { BooleanFilterField } from '../types';

export interface BooleanFieldProps {
  field: BooleanFilterField;
  barTestID: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanField({ field, barTestID, value, onChange }: BooleanFieldProps): React.ReactElement {
  const { theme } = useUi();
  const { colors, palette } = theme;
  const testID = field.testID ?? fieldTestID(barTestID, field.key);

  return (
    <View style={s.switchRow} testID={testID}>
      <Text style={[s.subLabel, { color: colors.text }]}>{field.label}</Text>
      <Switch
        accessibilityLabel={field.label}
        accessibilityHint={field.accessibilityHint}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        trackColor={{ false: colors.border, true: palette.primary['500'] }}
        thumbColor={colors.surface}
        value={value}
        onValueChange={onChange}
        testID={`${testID}-switch`}
      />
    </View>
  );
}

export default BooleanField;
