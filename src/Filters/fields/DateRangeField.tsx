/**
 * DateRangeField — the ADAPTER binding this bar's {@link DateRangeFilterField} schema to
 * `@dloizides/ui-forms`' `DateRangeControl`.
 *
 * The from/to pair (web `type="date"`, one-sided patching) moved to ui-forms in F2. What stays is
 * the schema binding, the derived testID, and the per-field sub-label override — `field.fromLabel`
 * beats the bar's default, which the bar resolved from `FILTERS_I18N.from` / `.to`. Those keys
 * stay owned by this package, so the manifest is untouched.
 */
import React from 'react';

import { DateRangeControl } from '@dloizides/ui-forms';

import { fieldTestID } from '../constants';
import type { DateRangeFilterField, DateRangeValue } from '../types';

export interface DateRangeFieldProps {
  field: DateRangeFilterField;
  barTestID: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  onSubmit: () => void;
  fromLabel: string;
  toLabel: string;
}

export function DateRangeField({ field, barTestID, value, onChange, onSubmit, fromLabel, toLabel }: DateRangeFieldProps): React.ReactElement {
  return (
    <DateRangeControl
      accessibilityHint={field.accessibilityHint}
      fromLabel={field.fromLabel ?? fromLabel}
      fromPlaceholder={field.fromPlaceholder}
      testID={field.testID ?? fieldTestID(barTestID, field.key)}
      toLabel={field.toLabel ?? toLabel}
      toPlaceholder={field.toPlaceholder}
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}

export default DateRangeField;
