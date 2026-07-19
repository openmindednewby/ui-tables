/**
 * SelectField — the ADAPTER binding this bar's declarative {@link SelectFilterField} schema to
 * `@dloizides/ui-forms`' `SelectControl`.
 *
 * The control itself (trigger, chevron, anchored menu, dismissal) moved to ui-forms in F2, where
 * every portal can reach it — six of them had reimplemented it because they could not. What stays
 * here is exactly what is FILTER-BAR-shaped and must not migrate:
 *
 *  - the schema binding (`field.options` / `field.placeholder` / `field.testID` → plain props);
 *  - the derived testID (`${barTestID}-field-${key}`);
 *  - the i18n. `ui-forms` never calls `t`, so the trigger's accessible NAME is composed HERE
 *    through `useUi().t` against `FILTERS_I18N.selectTriggerLabel`. That keeps the exported
 *    FILTERS_I18N manifest — which every portal's guard binds to LIVE — working untouched.
 *
 * Apps that need ui-layout's responsive modal/bottom-sheet select still inject it via
 * `Filters.renderSelect`; `SelectControl` is the dependency-free default.
 */
import React from 'react';

import { useUi } from '@dloizides/ui-feedback';
import { SelectControl } from '@dloizides/ui-forms';

import { accessibleName } from '../../accessibleName';
import { FILTERS_I18N, fieldTestID } from '../constants';
import type { SelectFilterField } from '../types';

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
  const { t } = useUi();
  const testID = field.testID ?? fieldTestID(barTestID, field.key);
  const resolvedPlaceholder = field.placeholder ?? placeholder;

  // The label the control will DISPLAY — resolved here too, because the accessible name must
  // carry it. That name REPLACES the trigger's visible text for a screen reader, so labelling
  // it with the field name alone silently hides the current selection.
  const selectedLabel = field.options.find((o) => o.value === value)?.label ?? resolvedPlaceholder;

  const triggerLabel = accessibleName(
    t(FILTERS_I18N.selectTriggerLabel, field.label, selectedLabel),
    FILTERS_I18N.selectTriggerLabel,
    field.label,
  );

  return (
    <SelectControl
      accessibilityHint={field.accessibilityHint ?? dropdownHint}
      accessibilityLabel={triggerLabel}
      options={field.options}
      optionHint={optionHint}
      placeholder={resolvedPlaceholder}
      testID={testID}
      value={value}
      onChange={onChange}
    />
  );
}

export default SelectField;
