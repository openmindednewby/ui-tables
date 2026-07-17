/**
 * Declarative filter schema for the shared {@link Filters} bar. A consuming screen
 * describes its filters as data — an array of {@link FilterField} — and the bar renders
 * the SAME structure + behaviour everywhere; only the theme colours change per app.
 *
 * The capability set is the SUPERSET harvested from every portal's hand-rolled filters
 * (aml-v2 cases/leaders/peps, zygos instructions, agora products/orders, kefi audit,
 * erevna/katalogos menus): select/enum, free-text search, numeric, date-range, a
 * search-as-you-type typeahead (the country-picker), and a boolean switch.
 *
 * Contract discipline: every user-facing string (labels, placeholders, option labels,
 * error text) is a PRE-LOCALIZED string passed in by the caller — the package never
 * calls FM/i18n for content and never touches a router or store.
 */
import type { StyleProp, ViewStyle } from 'react-native';

/** The kinds of field the declarative bar can render. */
export type FilterFieldKind = 'select' | 'text' | 'number' | 'dateRange' | 'typeahead' | 'boolean';

/** A single choice for a `select` / `typeahead` field. Label is pre-localized. */
export interface FilterOption {
  readonly label: string;
  readonly value: string;
}

/** The inclusive from/to value of a `dateRange` field (each an ISO `YYYY-MM-DD` string, or ''). */
export interface DateRangeValue {
  readonly from: string;
  readonly to: string;
}

/** The runtime value a field holds, by kind. */
export type FilterValue = string | boolean | DateRangeValue;

/** The applied/draft value map, keyed by each field's `key`. */
export type FilterValues = Record<string, FilterValue>;

interface FilterFieldBase {
  /** Stable id — the key into {@link FilterValues} AND the field's testID infix. */
  key: string;
  /** Pre-localized field label rendered above the control. */
  label: string;
  /** Override the derived testID (`${barTestID}-field-${key}` by default). */
  testID?: string;
  /** Let the field grow to fill spare width (search boxes usually do). Default false. */
  grow?: boolean;
  /** Minimum width (px) before the field wraps to the next line. Sensible per-kind default. */
  minWidth?: number;
  /** Merged LAST onto the field's wrapper — the consumer always wins over the shared style. */
  style?: StyleProp<ViewStyle>;
  /** Pre-localized accessibility hint for the field's primary control. */
  accessibilityHint?: string;
}

/** A single-select enum/status dropdown. `value` is the chosen option's `value` (''=unset). */
export interface SelectFilterField extends FilterFieldBase {
  kind: 'select';
  options: readonly FilterOption[];
  /** Pre-localized text shown when the value matches no option (unset). */
  placeholder?: string;
}

/** A free-text search input. Submits (Enter) trigger the bar's `onSubmit` (Apply). */
export interface TextFilterField extends FilterFieldBase {
  kind: 'text';
  placeholder?: string;
}

/** A numeric text input (`keyboardType="numeric"`). Value stays a string (''=unset). */
export interface NumberFilterField extends FilterFieldBase {
  kind: 'number';
  placeholder?: string;
}

/** An inclusive from/to date range (two `YYYY-MM-DD` inputs). */
export interface DateRangeFilterField extends FilterFieldBase {
  kind: 'dateRange';
  /** Pre-localized sub-label for the FROM input (e.g. "From"). */
  fromLabel?: string;
  /** Pre-localized sub-label for the TO input (e.g. "To"). */
  toLabel?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

/** A search-as-you-type combobox (the country-picker pattern). */
export interface TypeaheadFilterField extends FilterFieldBase {
  kind: 'typeahead';
  options: readonly FilterOption[];
  placeholder?: string;
  /** Minimum characters before suggestions surface. Default 1. */
  minChars?: number;
  /** Cap on rendered suggestions. Default 8. */
  maxSuggestions?: number;
  /** Pre-localized inline error (e.g. "Unrecognised country"). Shows a persistent banner. */
  error?: string;
}

/** A boolean toggle (RN `Switch`). */
export interface BooleanFilterField extends FilterFieldBase {
  kind: 'boolean';
}

/** The discriminated union of every declarative filter field. */
export type FilterField =
  | SelectFilterField
  | TextFilterField
  | NumberFilterField
  | DateRangeFilterField
  | TypeaheadFilterField
  | BooleanFilterField;
