import React from 'react';
import { Pressable, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetTestIds } from '../testIds';
import type { DateFilterChipLabels, DateFilterValue, FacetOption } from '../types';
import { activeDataSet } from './activeDataSet';
import { facetStyles as s } from './styles';

const LABEL_SEPARATOR = ': ';
const PART_JOINER = ' · ';

export interface DateFilterChipProps {
  fields: readonly FacetOption[];
  ranges: readonly FacetOption[];
  value: DateFilterValue | null;
  open: boolean;
  onPress: () => void;
  labels: DateFilterChipLabels;
  testIDPrefix?: string;
}

const labelOf = (options: readonly FacetOption[], value: string): string => options.find((o) => o.value === value)?.label ?? value;

function summaryOf(value: DateFilterValue | null, fields: readonly FacetOption[], ranges: readonly FacetOption[], anyDate: string): string {
  if (value === null) return anyDate;
  return `${labelOf(fields, value.field)}${PART_JOINER}${labelOf(ranges, value.range)}`;
}

/** The date chip in the filter row: says which date and range apply and opens the DateFieldChip panel. */
export function DateFilterChip({ fields, ranges, value, open, onPress, labels, testIDPrefix }: DateFilterChipProps): React.ReactElement {
  const { theme } = useUi();
  const active = value !== null;
  const summary = summaryOf(value, fields, ranges, labels.anyDate);
  const border = active ? theme.palette.primary['500'] : theme.colors.border;
  return (
    <Pressable
      accessibilityHint={labels.editHint}
      accessibilityLabel={`${labels.title}${LABEL_SEPARATOR}${summary}`}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      {...activeDataSet(active)}
      onPress={onPress}
      style={[s.chip, s.chipBody, { borderColor: border, backgroundColor: theme.colors.surface }]}
      testID={facetTestIds(testIDPrefix).dateTrigger}
    >
      <Text numberOfLines={1} style={[s.chipText, { color: theme.colors.text }]}>
        <Text style={s.chipLabel}>{`${labels.title}${LABEL_SEPARATOR}`}</Text>
        {summary}
      </Text>
    </Pressable>
  );
}
