import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { facetTestIds } from '../testIds';
import type { DateFieldChipLabels, DateFilterValue, FacetOption } from '../types';
import { TextButton } from './TextButton';
import { ToggleOption } from './ToggleOption';
import { facetStyles as s } from './styles';

export interface DateFieldChipProps {
  fields: readonly FacetOption[];
  ranges: readonly FacetOption[];
  value: DateFilterValue | null;
  onChange: (value: DateFilterValue | null) => void;
  labels: DateFieldChipLabels;
  testID?: string;
  testIDPrefix?: string;
}

function pick(value: DateFilterValue | null, fields: readonly FacetOption[], ranges: readonly FacetOption[]): DateFilterValue | null {
  const field = fields[0];
  const range = ranges[0];
  if (value !== null) return value;
  return field === undefined || range === undefined ? null : { field: field.value, range: range.value };
}

/** The which-date chip editor: choose the date (updated, created, reviewed) and the range it filters on. */
export function DateFieldChip({ fields, ranges, value, onChange, labels, testID, testIDPrefix }: DateFieldChipProps): React.ReactElement {
  const { theme } = useUi();
  const ids = facetTestIds(testIDPrefix);
  const current = pick(value, fields, ranges);
  const muted = { color: theme.colors.textSecondary };
  return (
    <View accessibilityLabel={labels.title} style={[s.panel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} testID={testID ?? ids.dateChip}>
      <Text style={[s.panelTitle, muted]}>{labels.fieldGroup}</Text>
      <View accessibilityLabel={labels.fieldGroup} accessibilityRole="radiogroup">
        {fields.map((f) => (
          <ToggleOption
            hint={labels.fieldHint}
            key={f.value}
            label={f.label}
            onPress={() => onChange({ field: f.value, range: current?.range ?? f.value })}
            role="radio"
            selected={value !== null && value.field === f.value}
            testID={ids.dateField(f.value)}
          />
        ))}
      </View>
      <Text style={[s.panelTitle, muted]}>{labels.rangeGroup}</Text>
      <View accessibilityLabel={labels.rangeGroup} accessibilityRole="radiogroup">
        {ranges.map((r) => (
          <ToggleOption
            hint={labels.rangeHint}
            key={r.value}
            label={r.label}
            onPress={() => onChange({ field: current?.field ?? r.value, range: r.value })}
            role="radio"
            selected={value !== null && value.range === r.value}
            testID={ids.dateRange(r.value)}
          />
        ))}
      </View>
      {value !== null && <TextButton hint={labels.clearHint} label={labels.clear} onPress={() => onChange(null)} testID={ids.dateClear} />}
    </View>
  );
}
