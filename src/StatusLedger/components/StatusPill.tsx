import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TONE_GLYPH } from '../constants';
import type { StatusTone } from '../StatusTone';

const PILL_RADIUS = 999;
const PILL_BORDER = 1;
const PILL_PAD_H = 8;
const PILL_PAD_V = 2;
const PILL_GAP = 6;
const PILL_FONT = 13;
const PILL_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: PILL_GAP,
    borderWidth: PILL_BORDER,
    borderRadius: PILL_RADIUS,
    paddingHorizontal: PILL_PAD_H,
    paddingVertical: PILL_PAD_V,
  },
  text: { fontSize: PILL_FONT, fontWeight: PILL_WEIGHT },
});

export interface StatusPillProps {
  label: string;
  tone: StatusTone;
  color: string;
  testID?: string;
}

/** A status label with a tone glyph, so the tone never relies on colour alone. */
export function StatusPill({ label, tone, color, testID }: StatusPillProps): React.ReactElement {
  return (
    <View accessibilityLabel={label} accessibilityRole="text" style={[styles.pill, { borderColor: color }]} testID={testID}>
      <Text aria-hidden style={[styles.text, { color }]}>
        {TONE_GLYPH[tone]}
      </Text>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}
