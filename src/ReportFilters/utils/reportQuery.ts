import { DEFAULT_REPORT_QUERY_KEYS, LIST_SEPARATOR } from '../constants';
import type { ReportFilterValues, ReportQueryKeys, ReportQuerySource } from '../types';
import type { DateRangeValue } from '../../Filters/types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_LENGTH = 10;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, ISO_DATE_LENGTH) === value;
}

export function isRangeInverted(range: DateRangeValue): boolean {
  const bothSet = range.from !== '' && range.to !== '';
  return bothSet && range.from > range.to;
}

export function countActiveReportFilters(values: ReportFilterValues): number {
  const hasRange = values.range.from !== '' || values.range.to !== '';
  return [values.scope !== '', hasRange, values.statuses.length > 0, values.currency !== ''].filter(Boolean).length;
}

function readAll(source: ReportQuerySource, key: string): string[] {
  if (source instanceof URLSearchParams) return source.getAll(key);
  const raw = source[key];
  if (raw === undefined || raw === null) return [];
  return typeof raw === 'string' ? [raw] : [...raw];
}

function readOne(source: ReportQuerySource, key: string): string {
  return (readAll(source, key)[0] ?? '').trim();
}

function readDate(source: ReportQuerySource, key: string): string {
  const value = readOne(source, key);
  return isIsoDate(value) ? value : '';
}

function readList(source: ReportQuerySource, key: string): string[] {
  const items = readAll(source, key)
    .flatMap((entry) => entry.split(LIST_SEPARATOR))
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
  return Array.from(new Set(items));
}

export function reportFiltersFromQuery(
  source: ReportQuerySource,
  keys: ReportQueryKeys = DEFAULT_REPORT_QUERY_KEYS,
): ReportFilterValues {
  return {
    scope: readOne(source, keys.scope),
    range: { from: readDate(source, keys.from), to: readDate(source, keys.to) },
    statuses: readList(source, keys.statuses),
    currency: readOne(source, keys.currency),
  };
}

export function reportFiltersToQuery(
  values: ReportFilterValues,
  keys: ReportQueryKeys = DEFAULT_REPORT_QUERY_KEYS,
): Record<string, string> {
  const entries: Array<[string, string]> = [
    [keys.scope, values.scope],
    [keys.from, values.range.from],
    [keys.to, values.range.to],
    [keys.statuses, values.statuses.join(LIST_SEPARATOR)],
    [keys.currency, values.currency],
  ];
  return Object.fromEntries(entries.filter(([, value]) => value !== ''));
}

/** Route params that name every filter key, `undefined` for a key without a value so a router clears it. */
export function reportFiltersToParams(
  values: ReportFilterValues,
  keys: ReportQueryKeys = DEFAULT_REPORT_QUERY_KEYS,
): Record<string, string | undefined> {
  const query: Record<string, string | undefined> = reportFiltersToQuery(values, keys);
  const allKeys = [keys.scope, keys.from, keys.to, keys.statuses, keys.currency];
  return Object.fromEntries(allKeys.map((key): [string, string | undefined] => [key, query[key]]));
}

export function reportFiltersToSearch(
  values: ReportFilterValues,
  keys: ReportQueryKeys = DEFAULT_REPORT_QUERY_KEYS,
): string {
  return new URLSearchParams(reportFiltersToQuery(values, keys)).toString();
}
