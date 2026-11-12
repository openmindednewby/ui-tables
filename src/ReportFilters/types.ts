import type { DateRangeValue, FilterOption } from '../Filters/types';

export interface ReportFilterValues {
  scope: string;
  range: DateRangeValue;
  statuses: readonly string[];
  currency: string;
}

export interface ReportQueryKeys {
  scope: string;
  from: string;
  to: string;
  statuses: string;
  currency: string;
}

export type ReportQuerySource =
  | URLSearchParams
  | Readonly<Record<string, string | readonly string[] | null | undefined>>;

export interface ReportFilterOptions {
  scopes: readonly FilterOption[];
  statuses: readonly FilterOption[];
  currencies: readonly FilterOption[];
}

export interface ReportFilterLabels {
  scope: string;
  range: string;
  from: string;
  to: string;
  statuses: string;
  currency: string;
  invalidRange: string;
  openPanel: string;
  openPanelHint: string;
  panelTitle: string;
  closePanel: string;
  closePanelHint: string;
}
