/**
 * TypeaheadField — the ADAPTER binding this bar's {@link TypeaheadFilterField} schema to
 * `@dloizides/ui-forms`' `TypeaheadControl`.
 *
 * The combobox itself (ranked suggestions, blur-delay, canonical-label fill, error banner) moved
 * to ui-forms in F2. What stays is the schema binding and the derived testID. This field carries
 * NO i18n keys of its own — its strings arrive pre-resolved from the bar — so nothing here
 * touches the FILTERS_I18N manifest.
 */
import React from 'react';

import { TypeaheadControl } from '@dloizides/ui-forms';

import { DEFAULT_TYPEAHEAD_MAX_SUGGESTIONS, DEFAULT_TYPEAHEAD_MIN_CHARS, fieldTestID } from '../constants';
import type { TypeaheadFilterField } from '../types';

export interface TypeaheadFieldProps {
  field: TypeaheadFilterField;
  barTestID: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  optionHint: string;
}

export function TypeaheadField({ field, barTestID, value, onChange, onSubmit, optionHint }: TypeaheadFieldProps): React.ReactElement {
  return (
    <TypeaheadControl
      accessibilityHint={field.accessibilityHint}
      accessibilityLabel={field.label}
      error={field.error}
      maxSuggestions={field.maxSuggestions ?? DEFAULT_TYPEAHEAD_MAX_SUGGESTIONS}
      minChars={field.minChars ?? DEFAULT_TYPEAHEAD_MIN_CHARS}
      options={field.options}
      optionHint={optionHint}
      placeholder={field.placeholder}
      testID={field.testID ?? fieldTestID(barTestID, field.key)}
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}

export default TypeaheadField;
