import React from 'react';

import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

export const RESULT_SUMMARY_TEST_ID = 'ui-result-summary';

const SUMMARY_FONT = 13;
const COUNT_WEIGHT = '700' as const;

const s = StyleSheet.create({
  summary: { fontSize: SUMMARY_FONT },
  count: { fontWeight: COUNT_WEIGHT },
});

export interface ResultSummaryProps {
  count: number;
  label: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export function ResultSummary({ count, label, style, testID = RESULT_SUMMARY_TEST_ID }: ResultSummaryProps): React.ReactElement {
  const { colors } = useUi().theme;

  return (
    <Text accessibilityLiveRegion="polite" role="status" style={[s.summary, { color: colors.textSecondary }, style]} testID={testID}>
      <Text style={[s.count, { color: colors.text }]} testID={`${testID}-count`}>{count.toLocaleString()}</Text>
      {` ${label}`}
    </Text>
  );
}

export default ResultSummary;
