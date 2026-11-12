import React, { useMemo } from 'react';

import { ChipSelector } from '@dloizides/ui-forms';

import { fieldTestID } from '../constants';
import type { MultiSelectFilterField } from '../types';
import { toggleValue } from '../utils/toggleValue';

export interface MultiSelectFieldProps {
  field: MultiSelectFilterField;
  barTestID: string;
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
}

export function MultiSelectField({ field, barTestID, value, onChange }: MultiSelectFieldProps): React.ReactElement {
  const options = useMemo(() => field.options.map((option) => ({ value: option.value, label: option.label })), [field.options]);
  const testID = field.testID ?? fieldTestID(barTestID, field.key);

  return (
    <ChipSelector
      multiple
      options={options}
      value={[...value]}
      onChange={(picked: string) => onChange(toggleValue(value, picked))}
      testID={`${testID}-chips`}
    />
  );
}

export default MultiSelectField;
