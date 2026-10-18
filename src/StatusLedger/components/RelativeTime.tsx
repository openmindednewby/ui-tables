import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { useRowPress } from '../../DataTable/rowPressContext';
import { MIN_TARGET_PX } from '../../minTarget';
import { formatRelativeTime, toEpochMs, type RelativeTimeStrings, type TimeInput } from '../utils/relativeTime';

const styles = StyleSheet.create({
  target: { minHeight: MIN_TARGET_PX, minWidth: MIN_TARGET_PX, justifyContent: 'center' },
});

const defaultAbsolute = (ms: number): string => new Date(ms).toLocaleString();

export interface RelativeTimeProps {
  value: TimeInput;
  nowMs: number;
  strings: RelativeTimeStrings;
  hint: string;
  formatAbsolute?: (epochMs: number) => string;
  testID?: string;
}

/** Shows "5 min ago"; a tap or click swaps to the absolute time, which is also the accessible name. */
export function RelativeTime({ value, nowMs, strings, hint, formatAbsolute = defaultAbsolute, testID }: RelativeTimeProps): React.ReactElement {
  const { theme } = useUi();
  const [showAbsolute, setShowAbsolute] = useState(false);
  const pressRow = useRowPress();
  const ms = toEpochMs(value);
  const relative = formatRelativeTime(value, nowMs, strings);
  const absolute = ms === null ? relative : formatAbsolute(ms);

  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={absolute}
      accessibilityRole="button"
      disabled={ms === null}
      onPress={() => {
        setShowAbsolute((current) => !current);
        pressRow?.();
      }}
      style={styles.target}
      testID={testID}
    >
      <Text style={{ color: theme.colors.text }}>{showAbsolute ? absolute : relative}</Text>
    </Pressable>
  );
}
