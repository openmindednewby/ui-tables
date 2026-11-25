/** Renders the `text` and `number` filter kinds; Enter calls the bar's `onSubmit` (Apply). */
import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { useA11y } from '@dloizides/a11y';
import { useUi } from '@dloizides/ui-feedback';
import { lookInputBox, useSelectLookMetrics } from '@dloizides/ui-forms';

import { fieldTestID } from '../constants';
import { controlStyles as s } from '../styles';
import type { NumberFilterField, TextFilterField } from '../types';

export interface TextFieldProps {
  field: TextFilterField | NumberFilterField;
  barTestID: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

function inputTestID(field: TextFilterField | NumberFilterField, barTestID: string): string {
  const custom = field.kind === 'text' ? field.inputTestID : undefined;
  return custom ?? `${field.testID ?? fieldTestID(barTestID, field.key)}-input`;
}

export function TextField({ field, barTestID, value, onChange, onSubmit }: TextFieldProps): React.ReactElement {
  const { theme } = useUi();
  const { colors } = theme;
  const look = useSelectLookMetrics();
  const isNumber = field.kind === 'number';
  const { a11yProps, hintNode } = useA11y({
    label: field.label,
    hint: field.accessibilityHint,
    testID: inputTestID(field, barTestID),
  });

  return (
    <>
      <TextInput
        {...(a11yProps as TextInputProps)}
        ref={field.kind === 'text' ? field.inputRef : undefined}
        keyboardType={isNumber ? 'numeric' : 'default'}
        placeholder={field.placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        style={[s.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }, lookInputBox(look)]}
      />
      {hintNode}
    </>
  );
}

export default TextField;
