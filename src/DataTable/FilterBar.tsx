/**
 * FilterBar — the shared filter-bar shell from GRID.md (`.ui-filters`): a themed,
 * wrapping row that holds the caller's filter fields, an optional live results
 * count (`<b>N</b> results`) and an optional actions slot (Apply / Export …).
 * Layout + theming only — the fields themselves come from the app (or @dloizides/
 * ui-forms), keeping this reusable across every grid rather than coverage-specific.
 */
import React from 'react';
import { Text, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { TABLE_I18N, TABLE_TEST_IDS } from './constants';
import { chromeStyles as c } from './styles';

export interface FilterBarProps {
  /** The filter fields (labels + inputs), supplied by the app / ui-forms. */
  children?: React.ReactNode;
  /** Live count shown as `<b>{resultsCount}</b> {results}`. Omit to hide. */
  resultsCount?: number;
  /** Overrides the kit's translated "results" word (pass an app-translated string). */
  resultsLabel?: string;
  /** Right-aligned action buttons (Apply, Export CSV, …). */
  actions?: React.ReactNode;
  testID?: string;
}

export function FilterBar({
  children,
  resultsCount,
  resultsLabel,
  actions,
  testID = TABLE_TEST_IDS.filterBar,
}: FilterBarProps): React.ReactElement {
  const { theme, t } = useUi();
  const { colors } = theme;
  const word = resultsLabel ?? t(TABLE_I18N.results);

  return (
    <View style={[c.filters, { backgroundColor: colors.surface, borderColor: colors.border }]} testID={testID}>
      {children}
      <View style={c.filtersSpacer} />
      {typeof resultsCount === 'number' && (
        <Text style={[c.results, { color: colors.textSecondary }]} testID={TABLE_TEST_IDS.results}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{resultsCount.toLocaleString()}</Text>
          {` ${word}`}
        </Text>
      )}
      {!!actions && <View style={c.filtersActions}>{actions}</View>}
    </View>
  );
}

export default FilterBar;
