import React from 'react';

import { View } from 'react-native';

import { DateField } from '@dloizides/ui-forms';

import { fieldTestID } from '../constants';
import { controlStyles } from '../styles';
import type { DateRangeFilterField, DateRangeValue } from '../types';

const NO_HINT = '';

export interface DateRangeFieldProps {
  field: DateRangeFilterField;
  barTestID: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  onSubmit: () => void;
  fromLabel: string;
  toLabel: string;
}

/** Binds a `dateRange` filter to two `ui-forms` `DateField`s; editing one side keeps the other. */
export function DateRangeField({ field, barTestID, value, onChange, onSubmit, fromLabel, toLabel }: DateRangeFieldProps): React.ReactElement {
  const testID = field.testID ?? fieldTestID(barTestID, field.key);
  const hint = field.accessibilityHint ?? NO_HINT;
  return (
    <View style={controlStyles.dateRow} testID={`${testID}-range`}>
      <View style={controlStyles.dateCol}>
        <DateField
          accessibilityHint={hint}
          label={field.fromLabel ?? fromLabel}
          testID={`${testID}-from`}
          value={value.from}
          onChange={(from) => onChange({ from, to: value.to })}
          onSubmit={onSubmit}
        />
      </View>
      <View style={controlStyles.dateCol}>
        <DateField
          accessibilityHint={hint}
          label={field.toLabel ?? toLabel}
          testID={`${testID}-to`}
          value={value.to}
          onChange={(to) => onChange({ from: value.from, to })}
          onSubmit={onSubmit}
        />
      </View>
    </View>
  );
}

export default DateRangeField;
