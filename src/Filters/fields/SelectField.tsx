/**
 * SelectField — a single-select enum/status dropdown (aml decision/status/riskBand, zygos
 * status/direction/currency, agora category/order-status). A bordered trigger shows the
 * selected option's label (or the placeholder when unset) + a chevron; pressing it opens the
 * shared {@link AnchoredMenu}. Selecting fires `onChange` and closes.
 *
 * Apps that need ui-layout's responsive modal/bottom-sheet select inject it via
 * `Filters.renderSelect`; this in-tree control is the dependency-free default.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { accessibleName } from '../../accessibleName';
import { FILTERS_I18N, fieldTestID } from '../constants';
import { filterStyles as s } from '../styles';
import type { SelectFilterField } from '../types';
import { AnchoredMenu } from '../components/AnchoredMenu';

const CHEVRON_DOWN = '▾';
const CHEVRON_UP = '▴';

export interface SelectFieldProps {
  field: SelectFilterField;
  barTestID: string;
  value: string;
  onChange: (value: string) => void;
  /** Pre-localized fallback placeholder when the field supplies none and the value is unset. */
  placeholder: string;
  /** Pre-localized accessibility hint for the trigger + options. */
  dropdownHint: string;
  optionHint: string;
}

export function SelectField({ field, barTestID, value, onChange, placeholder, dropdownHint, optionHint }: SelectFieldProps): React.ReactElement {
  const { theme, t } = useUi();
  const { colors, palette } = theme;
  const anchorRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const testID = field.testID ?? fieldTestID(barTestID, field.key);

  const selectedLabel = useMemo(() => {
    const found = field.options.find((o) => o.value === value);
    return found?.label ?? field.placeholder ?? placeholder;
  }, [field.options, field.placeholder, placeholder, value]);

  // The accessible name REPLACES the trigger's visible text, so it must carry the selection
  // too — "Status: Active", not just "Status", which announces the control but not its value.
  const triggerLabel = accessibleName(
    t(FILTERS_I18N.selectTriggerLabel, field.label, selectedLabel),
    FILTERS_I18N.selectTriggerLabel,
    field.label,
  );

  const close = useCallback(() => { setIsOpen(false); }, []);
  const toggle = useCallback(() => { setIsOpen((prev) => !prev); }, []);
  const select = useCallback(
    (next: string) => {
      onChange(next);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <View ref={anchorRef} style={s.anchor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        accessibilityHint={field.accessibilityHint ?? dropdownHint}
        accessibilityState={{ expanded: isOpen }}
        aria-expanded={isOpen}
        onPress={toggle}
        style={[s.selectTrigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
        testID={`${testID}-trigger`}
      >
        <Text numberOfLines={1} style={[s.selectTriggerText, { color: value === '' ? colors.textSecondary : colors.text }]}>
          {selectedLabel}
        </Text>
        <Text aria-hidden style={[s.chevron, { color: colors.textSecondary }]}>{isOpen ? CHEVRON_UP : CHEVRON_DOWN}</Text>
      </Pressable>
      {isOpen ? (
        <AnchoredMenu
          options={field.options}
          selectedValue={value}
          onSelect={select}
          onDismiss={close}
          colors={{ text: colors.text, border: colors.border, surface: colors.surface, brand: palette.primary['500'] }}
          optionHint={optionHint}
          testID={testID}
          anchorRef={anchorRef}
        />
      ) : null}
    </View>
  );
}

export default SelectField;
