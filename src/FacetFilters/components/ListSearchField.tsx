import React, { useRef, useState } from 'react';
import { Text, TextInput, View, type TextStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { useShortcutFocus } from '../hooks/useShortcutFocus';
import { SearchFieldLook } from '../SearchFieldLook';
import { INNER_OUTLINE_OFF, searchFieldStyles as s } from './searchFieldStyles';

export interface ListSearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  label: string;
  hint: string;
  placeholder: string;
  testID: string;
  look?: SearchFieldLook;
  shortcutKey?: string;
}

function SearchGlyph({ color }: { color: string }): React.ReactElement {
  return (
    <View aria-hidden style={s.glyph}>
      <View style={[s.lens, { borderColor: color }]} />
      <View style={[s.handle, { backgroundColor: color }]} />
    </View>
  );
}

/** The search input of a filtered list; Enter runs onSubmit. */
export function ListSearchField({ value, onChangeText, onSubmit, label, hint, placeholder, testID, look = SearchFieldLook.Plain, shortcutKey }: ListSearchFieldProps): React.ReactElement {
  const { theme } = useUi();
  const { colors } = theme;
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  useShortcutFocus(inputRef, shortcutKey);
  const framed = look === SearchFieldLook.Framed;
  const input = (
    <TextInput
      ref={inputRef}
      accessibilityHint={hint}
      accessibilityLabel={label}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      style={framed ? [s.input, INNER_OUTLINE_OFF as TextStyle, { color: colors.text }] : [s.plain, { borderColor: colors.border, color: colors.text }]}
      testID={testID}
      value={value}
      onBlur={() => setFocused(false)}
      onChangeText={onChangeText}
      onFocus={() => setFocused(true)}
      onSubmitEditing={onSubmit}
    />
  );
  if (!framed) return input;
  const showBadge = shortcutKey !== undefined && shortcutKey !== '' && value === '' && !focused;
  return (
    <View style={[s.frame, { backgroundColor: colors.surface, borderColor: focused ? theme.palette.primary['500'] : colors.border }]} testID={`${testID}-frame`}>
      <SearchGlyph color={colors.textSecondary} />
      {input}
      {showBadge ? (
        <View aria-hidden style={[s.badge, { borderColor: colors.border }]} testID={`${testID}-shortcut`}>
          <Text style={[s.badgeText, { color: colors.textSecondary }]}>{shortcutKey}</Text>
        </View>
      ) : null}
    </View>
  );
}
