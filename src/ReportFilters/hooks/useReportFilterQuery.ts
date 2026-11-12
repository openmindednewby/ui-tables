import { useCallback, useMemo } from 'react';

import { DEFAULT_REPORT_QUERY_KEYS } from '../constants';
import type { ReportFilterValues, ReportQueryKeys, ReportQuerySource } from '../types';
import { reportFiltersFromQuery, reportFiltersToParams } from '../utils/reportQuery';

export type ReportParamsSetter = (next: Record<string, string | undefined>) => void;

export interface UseReportFilterQueryOptions {
  params: ReportQuerySource;
  setParams: ReportParamsSetter;
  keys?: ReportQueryKeys;
}

export interface ReportFilterQuery {
  values: ReportFilterValues;
  setValues: (next: ReportFilterValues) => void;
}

/** Report filters read from and written to any router's query params, so a refresh or link restores them. */
export function useReportFilterQuery({
  params,
  setParams,
  keys = DEFAULT_REPORT_QUERY_KEYS,
}: UseReportFilterQueryOptions): ReportFilterQuery {
  const values = useMemo(() => reportFiltersFromQuery(params, keys), [params, keys]);
  const setValues = useCallback(
    (next: ReportFilterValues): void => setParams(reportFiltersToParams(next, keys)),
    [setParams, keys],
  );
  return { values, setValues };
}
