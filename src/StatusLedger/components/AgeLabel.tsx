import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { DurationUnit } from '../DurationUnit';
import { formatDuration, type DurationStrings } from '../utils/duration';

const AGE_FONT = 14;
const AGE_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  text: { fontSize: AGE_FONT, fontWeight: AGE_WEIGHT, fontVariant: ['tabular-nums'] },
});

export interface AgeLabelProps {
  ageMs: number | null;
  strings: DurationStrings;
  largestUnit?: DurationUnit;
  color?: string;
  testID?: string;
}

/** An age or waiting time as one short label, e.g. "50 h"; `color` comes from the caller's tone. */
export function AgeLabel({ ageMs, strings, largestUnit = DurationUnit.Day, color, testID }: AgeLabelProps): React.ReactElement {
  const { theme } = useUi();
  return (
    <Text style={[styles.text, { color: color ?? theme.colors.text }]} testID={testID}>
      {formatDuration(ageMs, strings, largestUnit)}
    </Text>
  );
}
