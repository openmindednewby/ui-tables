/**
 * FilterBar — the shared filter-bar shell from GRID.md (`.ui-filters`): a themed,
 * wrapping row that holds the caller's filter fields, an optional live results
 * count (`<b>N</b> results`) and an optional actions slot (Apply / Export …).
 * Layout + theming only — the fields themselves come from the app (or @dloizides/
 * ui-forms), keeping this reusable across every grid rather than coverage-specific.
 */
import React from 'react';
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { chromeStyles as c } from './styles';

const RESULTS_COUNT_WEIGHT = '700' as const;

/**
 * Per-slot style overrides for the FilterBar, merged **LAST** into each slot's style
 * array so the consumer always wins — over the base StyleSheet AND over the inline
 * colours taken from `useUi().theme`. Omit for the shared defaults (nothing changes).
 */
export interface FilterBarStyleOverrides {
  /** The bordered, rounded filter shell. */
  filters?: StyleProp<ViewStyle>;
  /** The flex spacer that pushes the count + actions right. */
  filtersSpacer?: StyleProp<ViewStyle>;
  /** The `<b>N</b> results` count line. */
  results?: StyleProp<TextStyle>;
  /** The right-aligned actions cluster. */
  filtersActions?: StyleProp<ViewStyle>;
}

export interface FilterBarProps {
  /** The filter fields (labels + inputs), supplied by the app / ui-forms. */
  children?: React.ReactNode;
  /** Live count shown as `<b>{resultsCount}</b> {results}`. Omit to hide. */
  resultsCount?: number;
  /** Overrides the kit's translated "results" word (pass an app-translated string). */
  resultsLabel?: string;
  /** Right-aligned action buttons (Apply, Export CSV, …). */
  actions?: React.ReactNode;
  /**
   * Per-slot style overrides, merged LAST so the consumer always wins — including over
   * the inline theme colours. Omit for the shared defaults.
   */
  styleOverrides?: FilterBarStyleOverrides;
  testID?: string;
}

export function FilterBar({
  children,
  resultsCount,
  resultsLabel,
  actions,
  styleOverrides: o,
  testID = TABLE_TEST_IDS.filterBar,
}: FilterBarProps): React.ReactElement {
  const { theme, t } = useUi();
  const { colors } = theme;
  const word = resultsLabel ?? t(TABLE_I18N.results);

  return (
    <View style={[c.filters, { backgroundColor: colors.surface, borderColor: colors.border }, o?.filters]} testID={testID}>
      {children}
      <View style={[c.filtersSpacer, o?.filtersSpacer]} />
      {typeof resultsCount === 'number' && (
        // Live region: announce the new count when filters change the result set (WCAG 4.1.3).
        <Text
          accessibilityLiveRegion="polite"
          role="status"
          style={[c.results, { color: colors.textSecondary }, o?.results]}
          testID={TABLE_TEST_IDS.results}
        >
          <Text style={{ color: colors.text, fontWeight: RESULTS_COUNT_WEIGHT }}>{resultsCount.toLocaleString()}</Text>
          {` ${word}`}
        </Text>
      )}
      {!!actions && <View style={[c.filtersActions, o?.filtersActions]}>{actions}</View>}
    </View>
  );
}

export default FilterBar;
