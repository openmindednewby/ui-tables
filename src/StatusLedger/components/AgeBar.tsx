import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const BAR_HEIGHT = 6;
const BAR_RADIUS = 3;
const GAP = 8;
const LABEL_FONT = 13;
const PERCENT = 100;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: GAP, flexGrow: 1 },
  track: { flexGrow: 1, flexShrink: 1, height: BAR_HEIGHT, borderRadius: BAR_RADIUS, overflow: 'hidden' },
  fill: { height: BAR_HEIGHT, borderRadius: BAR_RADIUS },
  label: { fontSize: LABEL_FONT, fontVariant: ['tabular-nums'] },
});

export interface AgeBarProps {
  fraction: number;
  color: string;
  label: string;
  testID?: string;
}

/** How much of a limit an age has used: a bar plus its text, so the meaning never relies on colour alone. */
export function AgeBar({ fraction, color, label, testID }: AgeBarProps): React.ReactElement {
  const { theme } = useUi();
  return (
    <View style={styles.row} testID={testID}>
      <View aria-hidden style={[styles.track, { backgroundColor: theme.colors.border }]}>
        <View style={[styles.fill, { width: `${Math.round(fraction * PERCENT)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
    </View>
  );
}
