import type { ReportFilterValues, ReportQueryKeys } from './types';

export const REPORT_FILTERS_TEST_ID = 'ui-report-filters';

export const REPORT_FIELD_KEYS = {
  scope: 'scope',
  range: 'range',
  statuses: 'statuses',
  currency: 'currency',
} as const;

export const DEFAULT_REPORT_QUERY_KEYS: ReportQueryKeys = {
  scope: 'scope',
  from: 'from',
  to: 'to',
  statuses: 'status',
  currency: 'currency',
};

export const EMPTY_REPORT_FILTERS: ReportFilterValues = {
  scope: '',
  range: { from: '', to: '' },
  statuses: [],
  currency: '',
};

export const LIST_SEPARATOR = ',';

export const PANEL_MAX_WIDTH = 360;
export const PANEL_SCREEN_SHARE = 0.88;

export const openPanelTestID = (testID: string): string => `${testID}-open`;
export const panelTestID = (testID: string): string => `${testID}-panel`;
export const panelFiltersTestID = (testID: string): string => `${testID}-panel-filters`;
