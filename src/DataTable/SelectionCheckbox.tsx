/**
 * The DataTable's select checkbox — used for BOTH a row and the tri-state header box.
 *
 * RN has no native checkbox, so this is a `Pressable` box drawn from the theme, exactly
 * like the Pager draws its size pills. It carries the real checkbox semantics rather than
 * miming them: `accessibilityRole="checkbox"` plus the checked state in BOTH spellings —
 * `accessibilityState` (RN native) and `aria-checked` (react-native-web ≥ 0.19 stopped
 * mapping the legacy prop), which is the same two-spelling rule the row's `aria-expanded`
 * already follows.
 *
 * `'mixed'` is the indeterminate state, and it is a real ARIA value, not a visual trick: a
 * screen reader announces "partially checked" for a header box over a part-selected page.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { HeaderCheckboxState } from './headerCheckboxState';
import { selectionStyles as sel } from './styles';

/** The tick glyph. A text mark keeps this native-safe — no SVG, no icon peer dependency. */
const CHECK_GLYPH = '✓';
/** The indeterminate mark: a dash, the conventional "some but not all". */
const MIXED_GLYPH = '–';
/**
 * Checkboxes are ~18px. `hitSlop` grows the TOUCH target toward the WCAG ≥44px minimum
 * without changing the rendered size — the same trick, and the same reason, as the Pager's
 * `PAGER_HIT_SLOP`.
 */
const CHECKBOX_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 } as const;
const TRANSPARENT = 'transparent';

interface SelectionCheckboxProps {
  /** `All` = checked, `Some` = indeterminate, `None` = unchecked. */
  state: HeaderCheckboxState;
  /** Already-translated accessible name (e.g. the row's label, or "select all on page"). */
  label: string;
  /** Already-translated accessible hint. */
  hint: string;
  onToggle: () => void;
  brandColor: string;
  borderColor: string;
  surfaceColor: string;
  testID: string;
}

/** ARIA's tri-state: `true` | `false` | `'mixed'`. */
function toCheckedValue(state: HeaderCheckboxState): boolean | 'mixed' {
  if (state === HeaderCheckboxState.All) return true;
  return state === HeaderCheckboxState.Some ? 'mixed' : false;
}

function toGlyph(state: HeaderCheckboxState): string | undefined {
  if (state === HeaderCheckboxState.All) return CHECK_GLYPH;
  return state === HeaderCheckboxState.Some ? MIXED_GLYPH : undefined;
}

export function SelectionCheckbox({
  state,
  label,
  hint,
  onToggle,
  brandColor,
  borderColor,
  surfaceColor,
  testID,
}: SelectionCheckboxProps): React.ReactElement {
  const checked = toCheckedValue(state);
  const glyph = toGlyph(state);
  const filled = state !== HeaderCheckboxState.None;

  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      aria-checked={checked}
      hitSlop={CHECKBOX_HIT_SLOP}
      style={sel.checkboxHit}
      testID={testID}
      onPress={onToggle}
    >
      <View
        style={[
          sel.checkbox,
          { borderColor: filled ? brandColor : borderColor, backgroundColor: filled ? brandColor : TRANSPARENT },
        ]}
      >
        {glyph === undefined ? null : <Text style={[sel.checkboxGlyph, { color: surfaceColor }]}>{glyph}</Text>}
      </View>
    </Pressable>
  );
}
