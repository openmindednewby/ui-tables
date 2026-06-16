/**
 * StatCard — a single labelled metric tile (label + formatted numeric value).
 */
import React, { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

const CARD_PADDING = 16;
const CARD_BORDER_RADIUS = 12;
const CARD_BORDER_WIDTH = 1;
const LABEL_FONT_SIZE = 14;
const VALUE_FONT_SIZE = 28;
const VALUE_LINE_HEIGHT = 36;

const styles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '500',
  },
  value: {
    fontSize: VALUE_FONT_SIZE,
    fontWeight: '700',
    lineHeight: VALUE_LINE_HEIGHT,
  },
});

export interface StatCardProps {
  label: string;
  value: number;
  testID: string;
}

export const StatCard = memo(({ label, value, testID }: StatCardProps): React.ReactElement => {
  const { theme, t } = useUi();
  const { colors } = theme;

  const formattedValue = value.toLocaleString();

  return (
    <View
      accessibilityHint={t('analytics.statHint', label)}
      accessibilityLabel={t('analytics.statCardLabel', label, formattedValue)}
      accessibilityRole="text"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={testID}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {formattedValue}
      </Text>
    </View>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
