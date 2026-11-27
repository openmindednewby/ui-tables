import React from 'react';
import { Pressable, Text } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { ChipSize } from '../ChipSize';
import { TextButtonVariant } from '../TextButtonVariant';
import { ChipBackdrop } from './ChipBackdrop';
import { useChipLook } from './ChipLook';
import { chipSizeStyles as c } from './chipSizeStyles';
import { readableInk } from './readableInk';
import { facetStyles as s } from './styles';

const DISABLED_OPACITY = 0.5;
const PLUS_GLYPH = '+ ';

export interface TextButtonProps {
  label: string;
  hint: string;
  onPress: () => void;
  expanded?: boolean;
  disabled?: boolean;
  testID: string;
  variant?: TextButtonVariant;
}

/** A quiet 44 px text action used for Add filter, Reset and Clear; DashedChip draws it as a dashed pill. */
export function TextButton({ label, hint, onPress, expanded, disabled = false, testID, variant = TextButtonVariant.Plain }: TextButtonProps): React.ReactElement {
  const { theme } = useUi();
  const compact = useChipLook().size === ChipSize.Compact;
  const dashed = variant === TextButtonVariant.DashedChip;
  const ink = readableInk(theme.palette.primary['500'], [theme.colors.background, theme.colors.surface], theme.colors.text);
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={expanded === undefined && !disabled ? undefined : { expanded, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[dashed ? [c.shell, c.body] : s.textButton, disabled && { opacity: DISABLED_OPACITY }]}
      testID={testID}
    >
      {dashed && <ChipBackdrop dashed testID={`${testID}-pill`} tone={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }} />}
      <Text style={[s.chipText, s.chipLabel, compact && c.text, { color: ink }]}>
        {dashed && <Text aria-hidden>{PLUS_GLYPH}</Text>}
        {label}
      </Text>
    </Pressable>
  );
}
