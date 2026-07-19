/**
 * FilterFieldView — dispatches one {@link FilterField} to its renderer, wired to the value map.
 * Reads the field's typed value out of {@link FilterValues} (coercing a missing/mismatched
 * entry to that kind's empty value) and writes edits back via `setField`. `boolean` renders its
 * own inline switch-row; every other kind is wrapped in `@dloizides/ui-forms`' `Field`.
 *
 * F2: the label wrapper used to be a PRIVATE `FieldShell` fork, which existed only because
 * `Field` hard-coded the 13/600 `field` label voice and offered no way out. `Field` now names
 * both contract voices, so the fork is deleted and the bar asks for `labelVariant="control"`
 * (11/700/uppercase) — the exact metrics `FieldShell` carried. One label implementation, and the
 * label-metric split that caused several defects this campaign is gone.
 */
import React from 'react';

import { Field } from '@dloizides/ui-forms';

import { BooleanField } from './BooleanField';
import { DateRangeField } from './DateRangeField';
import { SelectField } from './SelectField';
import { TextField } from './TextField';
import { TypeaheadField } from './TypeaheadField';
import { FIELD_MIN_WIDTH, fieldTestID } from '../constants';
import { filterStyles as s } from '../styles';
import type { DateRangeValue, FilterField, FilterValue, FilterValues, SelectFilterField } from '../types';

const EMPTY_RANGE: DateRangeValue = { from: '', to: '' };
const GROW_FLEX = 1;

/** Resolved, pre-localized strings the bar passes down to every field. */
export interface FieldStrings {
  selectPlaceholder: string;
  dropdownHint: string;
  optionHint: string;
  fromLabel: string;
  toLabel: string;
}

/**
 * Args for a custom select renderer — the injection point apps use to swap the built-in
 * in-tree dropdown for `@dloizides/ui-layout`'s responsive ModalDropdown (modal on mobile /
 * native, inline menu on desktop). The label wrapper is still supplied by the bar.
 */
export interface RenderSelectArgs {
  field: SelectFilterField;
  value: string;
  onChange: (value: string) => void;
  /** The field's canonical testID (`${barTestID}-field-${key}` unless overridden). */
  testID: string;
}

export interface FilterFieldViewProps {
  field: FilterField;
  barTestID: string;
  values: FilterValues;
  setField: (key: string, value: FilterValue) => void;
  onSubmit: () => void;
  strings: FieldStrings;
  /** Optional custom select renderer (e.g. inject ui-layout's ModalDropdown). */
  renderSelect?: (args: RenderSelectArgs) => React.ReactNode;
}

function asString(value: FilterValue | undefined): string {
  return typeof value === 'string' ? value : '';
}
function asBool(value: FilterValue | undefined): boolean {
  return value === true;
}
function asRange(value: FilterValue | undefined): DateRangeValue {
  if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) return value;
  return EMPTY_RANGE;
}

export function FilterFieldView({ field, barTestID, values, setField, onSubmit, strings, renderSelect }: FilterFieldViewProps): React.ReactElement {
  const raw = values[field.key];

  if (field.kind === 'boolean') {
    return <BooleanField field={field} barTestID={barTestID} value={asBool(raw)} onChange={(v) => setField(field.key, v)} />;
  }

  const body = ((): React.ReactNode => {
    switch (field.kind) {
      case 'select':
        if (renderSelect !== undefined) {
          return renderSelect({
            field,
            value: asString(raw),
            onChange: (v) => setField(field.key, v),
            testID: field.testID ?? fieldTestID(barTestID, field.key),
          });
        }
        return (
          <SelectField
            field={field}
            barTestID={barTestID}
            value={asString(raw)}
            onChange={(v) => setField(field.key, v)}
            placeholder={strings.selectPlaceholder}
            dropdownHint={strings.dropdownHint}
            optionHint={strings.optionHint}
          />
        );
      case 'typeahead':
        return (
          <TypeaheadField
            field={field}
            barTestID={barTestID}
            value={asString(raw)}
            onChange={(v) => setField(field.key, v)}
            onSubmit={onSubmit}
            optionHint={strings.optionHint}
          />
        );
      case 'dateRange':
        return (
          <DateRangeField
            field={field}
            barTestID={barTestID}
            value={asRange(raw)}
            onChange={(v) => setField(field.key, v)}
            onSubmit={onSubmit}
            fromLabel={strings.fromLabel}
            toLabel={strings.toLabel}
          />
        );
      default:
        return (
          <TextField
            field={field}
            barTestID={barTestID}
            value={asString(raw)}
            onChange={(v) => setField(field.key, v)}
            onSubmit={onSubmit}
          />
        );
    }
  })();

  // The per-field width/grow reflow rules (fields wrap to new lines as the bar narrows) and the
  // caller's own override, applied LAST. `s.fieldInBar` zeroes `Field`'s 16px form rhythm — see
  // its comment; inheriting it would add a phantom gap under every field in six live portals.
  const minWidth = field.minWidth ?? FIELD_MIN_WIDTH[field.kind];
  const grow = field.grow === true ? { flexGrow: GROW_FLEX } : null;

  return (
    <Field
      containerStyle={[s.fieldInBar, { minWidth }, grow, field.style]}
      label={field.label}
      labelVariant="control"
      testID={field.testID ?? fieldTestID(barTestID, field.key)}
    >
      {body}
    </Field>
  );
}

export default FilterFieldView;
