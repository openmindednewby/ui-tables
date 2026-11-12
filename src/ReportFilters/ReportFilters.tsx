import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CARD_STACK_BREAKPOINT } from '../DataTable/constants';
import { Filters } from '../Filters/Filters';
import { ActionButton } from '../Filters/components/ActionButton';
import type { RenderSelectArgs } from '../Filters/fields/FilterFieldView';
import type { FilterValues } from '../Filters/types';
import { FilterSidePanel } from './components/FilterSidePanel';
import { REPORT_FILTERS_TEST_ID, openPanelTestID, panelFiltersTestID, panelTestID } from './constants';
import { useReportDraft } from './hooks/useReportDraft';
import type { ReportFilterLabels, ReportFilterOptions, ReportFilterValues } from './types';
import { buildReportFields, fromFilterValues, toFilterValues } from './utils/reportFields';

const COMPACT_GAP = 8;

export interface ReportFiltersProps {
  value: ReportFilterValues;
  onChange: (next: ReportFilterValues) => void;
  options: ReportFilterOptions;
  labels: ReportFilterLabels;
  actions?: React.ReactNode;
  compact?: boolean;
  renderSelect?: (args: RenderSelectArgs) => React.ReactNode;
  testID?: string;
}

export function ReportFilters({
  value,
  onChange,
  options,
  labels,
  actions,
  compact,
  renderSelect,
  testID = REPORT_FILTERS_TEST_ID,
}: ReportFiltersProps): React.ReactElement {
  const { width } = useWindowDimensions();
  const [panelOpen, setPanelOpen] = useState(false);
  const { draft, edit } = useReportDraft(value, onChange);
  const fields = useMemo(() => buildReportFields(options, labels, draft), [options, labels, draft]);
  const values = useMemo(() => toFilterValues(draft), [draft]);
  const handleChange = useCallback((next: FilterValues) => edit(fromFilterValues(next)), [edit]);
  const isCompact = compact ?? width < CARD_STACK_BREAKPOINT;

  const renderBar = (barTestID: string, barActions?: React.ReactNode): React.ReactElement => (
    <Filters fields={fields} values={values} onChange={handleChange} actions={barActions} renderSelect={renderSelect} testID={barTestID} />
  );

  if (!isCompact) return renderBar(testID, actions);

  return (
    <View style={styles.compactRow} testID={testID}>
      <ActionButton
        label={labels.openPanel}
        hint={labels.openPanelHint}
        tone="ghost"
        onPress={() => setPanelOpen(true)}
        testID={openPanelTestID(testID)}
      />
      {actions}
      <FilterSidePanel
        visible={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={labels.panelTitle}
        closeLabel={labels.closePanel}
        closeHint={labels.closePanelHint}
        testID={panelTestID(testID)}
      >
        {renderBar(panelFiltersTestID(testID))}
      </FilterSidePanel>
    </View>
  );
}

const styles = StyleSheet.create({
  compactRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: COMPACT_GAP },
});

export default ReportFilters;
