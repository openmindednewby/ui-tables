import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { formatRelativeTime, toEpochMs, type RelativeTimeStrings, type TimeInput } from '../../StatusLedger/utils/relativeTime';
import { FACET_TEST_IDS } from '../constants';
import { facetStyles as s } from './styles';

export interface DateStampCellProps {
  value: TimeInput;
  nowMs: number;
  strings: RelativeTimeStrings;
  formatAbsolute: (epochMs: number) => string;
  emptyLabel: string;
  testID?: string;
}

/** A two-line date cell: the exact date, then how long ago on a muted line. */
export function DateStampCell({ value, nowMs, strings, formatAbsolute, emptyLabel, testID = FACET_TEST_IDS.dateStampCell }: DateStampCellProps): React.ReactElement {
  const { theme } = useUi();
  const ms = toEpochMs(value);
  if (ms === null) {
    return (
      <Text style={[s.secondary, { color: theme.colors.textSecondary }]} testID={testID}>
        {emptyLabel}
      </Text>
    );
  }
  return (
    <View testID={testID}>
      <Text numberOfLines={1} style={[s.chipText, { color: theme.colors.text }]}>
        {formatAbsolute(ms)}
      </Text>
      <Text numberOfLines={1} style={[s.secondary, { color: theme.colors.textSecondary }]}>
        {formatRelativeTime(value, nowMs, strings)}
      </Text>
    </View>
  );
}
