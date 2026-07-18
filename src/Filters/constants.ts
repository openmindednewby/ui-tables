/**
 * Constants for the declarative Filters bar — every test id, i18n key and layout number in
 * one place so the components carry no magic numbers and no ad-hoc strings.
 */
import type { FilterFieldKind } from './types';

/** Root testID of the declarative filter bar. */
export const FILTERS_TEST_ID = 'ui-filters-declarative';

/** Default minimum widths (px) per field kind before it wraps. */
export const FIELD_MIN_WIDTH: Record<FilterFieldKind, number> = {
  select: 150,
  text: 200,
  number: 130,
  dateRange: 260,
  typeahead: 200,
  boolean: 150,
};

/** Default min characters before a typeahead surfaces suggestions. */
export const DEFAULT_TYPEAHEAD_MIN_CHARS = 1;
/** Default cap on typeahead suggestions rendered. */
export const DEFAULT_TYPEAHEAD_MAX_SUGGESTIONS = 8;

/** Derived testIDs for the declarative bar. */
export const fieldTestID = (barTestID: string, key: string): string => `${barTestID}-field-${key}`;
export const applyTestID = (barTestID: string): string => `${barTestID}-apply`;
export const clearTestID = (barTestID: string): string => `${barTestID}-clear`;

/**
 * Translation keys for the bar's own controls. Apps map these in their UiProvider `t`; the
 * neutral default `t` returns the key, so a forgotten key degrades to the key, never a literal.
 * A caller may also override any of them with a pre-localized string prop on {@link Filters}.
 */
export const FILTERS_I18N = {
  apply: 'uiTables.filters.apply',
  applyHint: 'uiTables.filters.applyHint',
  clear: 'uiTables.filters.clear',
  clearHint: 'uiTables.filters.clearHint',
  selectPlaceholder: 'uiTables.filters.selectPlaceholder',
  dropdownHint: 'uiTables.filters.dropdownHint',
  optionHint: 'uiTables.filters.optionHint',
  /**
   * Accessible NAME of a select trigger, e.g. "{{p1}}: {{p2}}" → "Status: Active". The
   * trigger's `accessibilityLabel` REPLACES its visible text for a screen reader, so labelling
   * it with the field name alone silently hides the current selection. Untranslated it
   * degrades to the field label alone (prior behaviour) — never to the raw key.
   */
  selectTriggerLabel: 'uiTables.filters.selectTriggerLabel',
  from: 'uiTables.filters.from',
  to: 'uiTables.filters.to',
} as const;
