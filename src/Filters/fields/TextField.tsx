/**
 * TextField — renders both the `text` (free search) and `number` (numeric) field kinds; the
 * only difference is the keyboard. Enter/submit calls the bar's `onSubmit` (Apply) so a
 * keyboard user commits a draft without reaching for the mouse (aml's `onSubmitEditing`).
 *
 * F2 — why this did NOT move to `ui-forms` with its siblings: `ui-forms` already ships TWO text
 * inputs (`ThemedTextInput` and `FormField`). Promoting a third would ADD a duplicate to the very
 * package this campaign is de-duplicating. The right convergence is to render this on
 * `ThemedTextInput`, but that swaps in the focus ring, the hover border and the
 * `surfaceElevated` rest background — a visible change for six live portals, so it belongs in the
 * visual-QA-gated wave, not here. It uses the shared `controlStyles.input` box meanwhile, so
 * there is no forked metric.
 */
import React from 'react';
import { TextInput } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

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

export function TextField({ field, barTestID, value, onChange, onSubmit }: TextFieldProps): React.ReactElement {
  const { theme } = useUi();
  const { colors } = theme;
  const isNumber = field.kind === 'number';

  return (
    <TextInput
      accessibilityLabel={field.label}
      accessibilityHint={field.accessibilityHint}
      keyboardType={isNumber ? 'numeric' : 'default'}
      placeholder={field.placeholder}
      placeholderTextColor={colors.textSecondary}
      value={value}
      onChangeText={onChange}
      onSubmitEditing={onSubmit}
      style={[s.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
      testID={`${field.testID ?? fieldTestID(barTestID, field.key)}-input`}
    />
  );
}

export default TextField;
