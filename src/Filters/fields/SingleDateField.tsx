import React from 'react';

import { View, type StyleProp, type ViewStyle } from 'react-native';

import { DateField } from '@dloizides/ui-forms';

import { fieldTestID } from '../constants';
import type { DateFilterField } from '../types';

const NO_HINT = '';

export interface SingleDateFieldProps {
  field: DateFilterField;
  barTestID: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  containerStyle: StyleProp<ViewStyle>;
}

/** Binds a `date` filter to `ui-forms`' `DateField`, which renders its own label. */
export function SingleDateField({ field, barTestID, value, onChange, onSubmit, containerStyle }: SingleDateFieldProps): React.ReactElement {
  const testID = field.testID ?? fieldTestID(barTestID, field.key);
  return (
    <View style={containerStyle} testID={testID}>
      <DateField
        accessibilityHint={field.accessibilityHint ?? NO_HINT}
        label={field.label}
        testID={`${testID}-input`}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </View>
  );
}

export default SingleDateField;
