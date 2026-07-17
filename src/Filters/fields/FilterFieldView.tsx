/**
 * FilterFieldView — dispatches one {@link FilterField} to its renderer, wired to the value map.
 * Reads the field's typed value out of {@link FilterValues} (coercing a missing/mismatched
 * entry to that kind's empty value) and writes edits back via `setField`. `boolean` renders its
 * own inline switch-row; every other kind is wrapped in the label-over-control {@link FieldShell}.
 */
import React from 'react';

import { FieldShell } from './FieldShell';
import { BooleanField } from './BooleanField';
import { DateRangeField } from './DateRangeField';
import { SelectField } from './SelectField';
import { TextField } from './TextField';
import { TypeaheadField } from './TypeaheadField';
import { fieldTestID } from '../constants';
import type { DateRangeValue, FilterField, FilterValue, FilterValues, SelectFilterField } from '../types';

const EMPTY_RANGE: DateRangeValue = { from: '', to: '' };

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
 * native, inline menu on desktop). The label wrapper (FieldShell) is still supplied by the bar.
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

  return (
    <FieldShell field={field} barTestID={barTestID}>
      {body}
    </FieldShell>
  );
}

export default FilterFieldView;
