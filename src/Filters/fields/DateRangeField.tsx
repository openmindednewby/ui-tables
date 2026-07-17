/**
 * DateRangeField — an inclusive from/to pair (aml cases `from`/`to`, kefi audit `from`/`to`).
 * Each side is a `YYYY-MM-DD` text input; on web the browser's native date UI is offered via
 * `type="date"` (a react-native-web `TextInput` passes unknown props to the DOM input). The
 * value is a {@link DateRangeValue}; editing either side patches only that side.
 */
import React from 'react';
import { TextInput, View, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { fieldTestID } from '../constants';
import { filterStyles as s } from '../styles';
import type { DateRangeFilterField, DateRangeValue } from '../types';

const WEB_DATE_PROPS = typeof document !== 'undefined' ? { type: 'date' } : {};

export interface DateRangeFieldProps {
  field: DateRangeFilterField;
  barTestID: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  onSubmit: () => void;
  fromLabel: string;
  toLabel: string;
}

interface DateInputProps {
  side: 'from' | 'to';
  label: string;
  placeholder?: string;
  value: string;
  color: string;
  border: string;
  surface: string;
  muted: string;
  testID: string;
  hint?: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
}

function DateInput(p: DateInputProps): React.ReactElement {
  return (
    <View style={s.dateCol}>
      <Text style={[s.subLabel, { color: p.muted }]}>{p.label}</Text>
      <TextInput
        accessibilityLabel={p.label}
        accessibilityHint={p.hint}
        placeholder={p.placeholder}
        placeholderTextColor={p.muted}
        value={p.value}
        onChangeText={p.onChangeText}
        onSubmitEditing={p.onSubmit}
        style={[s.input, { borderColor: p.border, backgroundColor: p.surface, color: p.color }]}
        testID={`${p.testID}-${p.side}`}
        {...WEB_DATE_PROPS}
      />
    </View>
  );
}

export function DateRangeField({ field, barTestID, value, onChange, onSubmit, fromLabel, toLabel }: DateRangeFieldProps): React.ReactElement {
  const { theme } = useUi();
  const { colors } = theme;
  const testID = field.testID ?? fieldTestID(barTestID, field.key);

  return (
    <View style={s.dateRow} testID={`${testID}-range`}>
      <DateInput
        side="from"
        label={field.fromLabel ?? fromLabel}
        placeholder={field.fromPlaceholder}
        value={value.from}
        color={colors.text}
        border={colors.border}
        surface={colors.surface}
        muted={colors.textSecondary}
        hint={field.accessibilityHint}
        testID={testID}
        onChangeText={(from) => onChange({ from, to: value.to })}
        onSubmit={onSubmit}
      />
      <DateInput
        side="to"
        label={field.toLabel ?? toLabel}
        placeholder={field.toPlaceholder}
        value={value.to}
        color={colors.text}
        border={colors.border}
        surface={colors.surface}
        muted={colors.textSecondary}
        hint={field.accessibilityHint}
        testID={testID}
        onChangeText={(to) => onChange({ from: value.from, to })}
        onSubmit={onSubmit}
      />
    </View>
  );
}

export default DateRangeField;
