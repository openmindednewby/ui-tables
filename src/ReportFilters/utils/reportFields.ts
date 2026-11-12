import { REPORT_FIELD_KEYS } from '../constants';
import type { ReportFilterLabels, ReportFilterOptions, ReportFilterValues } from '../types';
import type { DateRangeValue, FilterField, FilterValue, FilterValues } from '../../Filters/types';
import { isRangeInverted } from './reportQuery';

const EMPTY_RANGE: DateRangeValue = { from: '', to: '' };

export function buildReportFields(
  options: ReportFilterOptions,
  labels: ReportFilterLabels,
  values: ReportFilterValues,
): FilterField[] {
  return [
    { key: REPORT_FIELD_KEYS.scope, kind: 'select', label: labels.scope, options: options.scopes },
    {
      key: REPORT_FIELD_KEYS.range,
      kind: 'dateRange',
      label: labels.range,
      fromLabel: labels.from,
      toLabel: labels.to,
      error: isRangeInverted(values.range) ? labels.invalidRange : undefined,
    },
    { key: REPORT_FIELD_KEYS.statuses, kind: 'multiSelect', label: labels.statuses, options: options.statuses },
    { key: REPORT_FIELD_KEYS.currency, kind: 'select', label: labels.currency, options: options.currencies },
  ];
}

export function toFilterValues(values: ReportFilterValues): FilterValues {
  return {
    [REPORT_FIELD_KEYS.scope]: values.scope,
    [REPORT_FIELD_KEYS.range]: values.range,
    [REPORT_FIELD_KEYS.statuses]: values.statuses,
    [REPORT_FIELD_KEYS.currency]: values.currency,
  };
}

function asText(value: FilterValue | undefined): string {
  return typeof value === 'string' ? value : '';
}

function asList(value: FilterValue | undefined): readonly string[] {
  return Array.isArray(value) ? (value as readonly string[]) : [];
}

function asRange(value: FilterValue | undefined): DateRangeValue {
  const isRange = typeof value === 'object' && !Array.isArray(value) && 'from' in value;
  return isRange ? (value as DateRangeValue) : EMPTY_RANGE;
}

export function fromFilterValues(map: FilterValues): ReportFilterValues {
  return {
    scope: asText(map[REPORT_FIELD_KEYS.scope]),
    range: asRange(map[REPORT_FIELD_KEYS.range]),
    statuses: asList(map[REPORT_FIELD_KEYS.statuses]),
    currency: asText(map[REPORT_FIELD_KEYS.currency]),
  };
}
