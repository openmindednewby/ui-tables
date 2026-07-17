/**
 * TypeaheadField — search-as-you-type combobox (aml's CountryPicker, generalized). A text
 * input plus a floating {@link AnchoredMenu} of ranked suggestions ({@link suggestOptions});
 * picking one fills the canonical label. Free typing is preserved (the caller resolves the
 * text to a code at query time); an optional pre-localized `error` shows a persistent banner.
 *
 * The value stored in {@link FilterValues} is the raw text — so a caller can accept "CY",
 * "cyprus" or "Cyprus (CY)" and normalise it themselves, exactly as aml does.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TextInput, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { DEFAULT_TYPEAHEAD_MAX_SUGGESTIONS, DEFAULT_TYPEAHEAD_MIN_CHARS, fieldTestID } from '../constants';
import { filterStyles as s } from '../styles';
import type { TypeaheadFilterField } from '../types';
import { AnchoredMenu } from '../components/AnchoredMenu';
import { suggestOptions } from '../utils/suggest';

/** Delay before blur closes the menu, so a tap on an option registers first (aml CLOSE_DELAY_MS). */
const CLOSE_DELAY_MS = 140;

export interface TypeaheadFieldProps {
  field: TypeaheadFilterField;
  barTestID: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  optionHint: string;
}

export function TypeaheadField({ field, barTestID, value, onChange, onSubmit, optionHint }: TypeaheadFieldProps): React.ReactElement {
  const { theme } = useUi();
  const { colors, palette, semantic } = theme;
  const anchorRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const testID = field.testID ?? fieldTestID(barTestID, field.key);
  const minChars = field.minChars ?? DEFAULT_TYPEAHEAD_MIN_CHARS;
  const maxSuggestions = field.maxSuggestions ?? DEFAULT_TYPEAHEAD_MAX_SUGGESTIONS;

  // Hide the menu once the field already holds an exact pick (nothing left to disambiguate).
  const exactPick = useMemo(
    () => field.options.some((o) => o.label === value),
    [field.options, value],
  );
  const suggestions = useMemo(
    () => (exactPick ? [] : suggestOptions(field.options, value, minChars, maxSuggestions)),
    [exactPick, field.options, value, minChars, maxSuggestions],
  );
  const showMenu = isOpen && suggestions.length > 0;

  const handleChange = useCallback(
    (next: string) => {
      onChange(next);
      setIsOpen(true);
    },
    [onChange],
  );
  const pick = useCallback(
    (optionValue: string) => {
      const opt = field.options.find((o) => o.value === optionValue);
      onChange(opt?.label ?? optionValue);
      setIsOpen(false);
    },
    [field.options, onChange],
  );
  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  }, []);
  const handleSubmit = useCallback(() => {
    setIsOpen(false);
    onSubmit();
  }, [onSubmit]);

  const hasError = field.error !== undefined && field.error !== '';

  return (
    <View ref={anchorRef} style={s.anchor}>
      <TextInput
        accessibilityLabel={field.label}
        accessibilityHint={field.accessibilityHint}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={field.placeholder}
        placeholderTextColor={colors.textSecondary}
        spellCheck={false}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        style={[s.input, { borderColor: hasError ? semantic.error['500'] : colors.border, backgroundColor: colors.surface, color: colors.text }]}
        testID={`${testID}-input`}
      />
      {showMenu ? (
        <AnchoredMenu
          options={suggestions}
          selectedValue={value}
          onSelect={pick}
          onDismiss={() => setIsOpen(false)}
          colors={{ text: colors.text, border: colors.border, surface: colors.surface, brand: palette.primary['500'] }}
          optionHint={optionHint}
          testID={testID}
          anchorRef={anchorRef}
        />
      ) : null}
      {hasError ? (
        <Text role="alert" style={[s.error, { color: semantic.error['500'] }]} testID={`${testID}-error`}>
          {field.error}
        </Text>
      ) : null}
    </View>
  );
}

export default TypeaheadField;
