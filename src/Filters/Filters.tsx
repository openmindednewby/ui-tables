/**
 * Filters — the declarative, configurable filter bar every portal shares. A caller passes a
 * `fields` schema + a `values` map + `onChange`; the bar renders the same structure + behaviour
 * everywhere, themed per app. It builds ON the existing {@link FilterBar} shell (so its live
 * results count + WCAG live region + actions slot are reused unchanged).
 *
 * Two value models, selected by whether `onApply` is passed:
 *  - LIVE (no `onApply`): each edit calls `onChange` immediately (agora, zygos). No Apply button.
 *  - DRAFT/APPLY (`onApply` set): edits accumulate in the caller's draft (see {@link useFilterDraft});
 *    an Apply button + Enter-in-a-field commit it (aml, kefi audit). Pass `onClear` for a Reset.
 *
 * Contract discipline: every user-facing string is a pre-localized value — supplied per-field, via
 * the `*Label`/`*Placeholder` props, or resolved through the UiProvider `t` (which defaults to the
 * i18n KEY, never a hardcoded literal). No FM/router/store; customisation is style + slots only.
 */
import React, { useCallback, useMemo } from 'react';

import { useUi } from '@dloizides/ui-feedback';

import { FilterBar, type FilterBarStyleOverrides } from '../DataTable/FilterBar';
import { ActionButton } from './components/ActionButton';
import { FILTERS_I18N, FILTERS_TEST_ID, applyTestID, clearTestID } from './constants';
import { FilterFieldView, type FieldStrings, type RenderSelectArgs } from './fields/FilterFieldView';
import type { FilterField, FilterValue, FilterValues } from './types';

export interface FiltersProps {
  /** The declarative field schema — the SUPERSET of every portal's filters, as data. */
  fields: readonly FilterField[];
  /** The current value map (applied values in live mode, or the draft in draft/apply mode). */
  values: FilterValues;
  /** Called with the next full value map on every edit. */
  onChange: (next: FilterValues) => void;
  /** Live results count shown by the FilterBar (WCAG live region). Omit to hide. */
  resultsCount?: number;
  /** Pre-localized noun for the count (already singularised by the caller if needed). */
  resultsLabel?: string;
  /** When set, shows an Apply button + commits on Enter — the draft/apply model. Omit for live. */
  onApply?: () => void;
  /** Pre-localized Apply label / hint (default via UiProvider `t`). */
  applyLabel?: string;
  applyHint?: string;
  /** Disable Apply (e.g. while busy or when a date field is invalid — aml's gate). */
  applyDisabled?: boolean;
  /** When set, shows a Clear/Reset button. */
  onClear?: () => void;
  clearLabel?: string;
  clearHint?: string;
  /** Extra actions (Export CSV/PDF, bulk bar) rendered BEFORE the built-in Apply/Clear. */
  actions?: React.ReactNode;
  /** Pre-localized fallback placeholder for an unset select (default via `t`). */
  selectPlaceholder?: string;
  /** Pre-localized default sub-labels for date-range fields (default via `t`). */
  fromLabel?: string;
  toLabel?: string;
  /**
   * Optional custom renderer for `select` fields — the injection point for
   * `@dloizides/ui-layout`'s responsive `ModalDropdown` (or any other select). When omitted, the
   * dependency-free in-tree dropdown is used. The label wrapper stays supplied by the bar.
   */
  renderSelect?: (args: RenderSelectArgs) => React.ReactNode;
  /** FilterBar per-slot style overrides — merged LAST, so a consumer always wins. */
  styleOverrides?: FilterBarStyleOverrides;
  testID?: string;
}

export function Filters({
  fields,
  values,
  onChange,
  resultsCount,
  resultsLabel,
  onApply,
  applyLabel,
  applyHint,
  applyDisabled = false,
  onClear,
  clearLabel,
  clearHint,
  actions,
  selectPlaceholder,
  fromLabel,
  toLabel,
  renderSelect,
  styleOverrides,
  testID = FILTERS_TEST_ID,
}: FiltersProps): React.ReactElement {
  const { t } = useUi();

  const setField = useCallback(
    (key: string, value: FilterValue) => {
      onChange({ ...values, [key]: value });
    },
    [onChange, values],
  );

  // Enter in a text/number/date/typeahead field commits the draft (draft/apply); no-op when live.
  const onSubmit = useCallback(() => {
    if (onApply !== undefined && !applyDisabled) onApply();
  }, [onApply, applyDisabled]);

  const strings = useMemo<FieldStrings>(
    () => ({
      selectPlaceholder: selectPlaceholder ?? t(FILTERS_I18N.selectPlaceholder),
      dropdownHint: t(FILTERS_I18N.dropdownHint),
      optionHint: t(FILTERS_I18N.optionHint),
      fromLabel: fromLabel ?? t(FILTERS_I18N.from),
      toLabel: toLabel ?? t(FILTERS_I18N.to),
    }),
    [selectPlaceholder, fromLabel, toLabel, t],
  );

  const barActions = (
    <>
      {actions}
      {onClear !== undefined && (
        <ActionButton
          label={clearLabel ?? t(FILTERS_I18N.clear)}
          hint={clearHint ?? t(FILTERS_I18N.clearHint)}
          tone="ghost"
          onPress={onClear}
          testID={clearTestID(testID)}
        />
      )}
      {onApply !== undefined && (
        <ActionButton
          label={applyLabel ?? t(FILTERS_I18N.apply)}
          hint={applyHint ?? t(FILTERS_I18N.applyHint)}
          tone="primary"
          disabled={applyDisabled}
          onPress={onApply}
          testID={applyTestID(testID)}
        />
      )}
    </>
  );

  const hasActions = actions !== undefined || onClear !== undefined || onApply !== undefined;

  return (
    <FilterBar
      resultsCount={resultsCount}
      resultsLabel={resultsLabel}
      actions={hasActions ? barActions : undefined}
      styleOverrides={styleOverrides}
      testID={testID}
    >
      {fields.map((field) => (
        <FilterFieldView
          key={field.key}
          field={field}
          barTestID={testID}
          values={values}
          setField={setField}
          onSubmit={onSubmit}
          strings={strings}
          renderSelect={renderSelect}
        />
      ))}
    </FilterBar>
  );
}

export default Filters;
