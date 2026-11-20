import { DATE_SEPARATOR, DEFAULT_LIST_PAGE_SIZE, FIRST_PAGE, URL_PARAM, VALUE_SEPARATOR } from '../constants';
import type { DateFilterValue, ListFilterState } from '../types';

export interface UrlStateDefaults {
  facetKeys: readonly string[];
  size?: number;
  allowedSizes?: readonly number[];
}

const splitList = (raw: string | null): string[] => (raw === null ? [] : raw.split(VALUE_SEPARATOR).filter((v) => v !== ''));

function parsePositive(raw: string | null, fallback: number): number {
  const n = raw === null ? Number.NaN : Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function parseDate(raw: string | null): DateFilterValue | null {
  if (raw === null) return null;
  const [field, range] = raw.split(DATE_SEPARATOR);
  return field !== undefined && field !== '' && range !== undefined && range !== '' ? { field, range } : null;
}

/** Reads a query string into list state; unknown keys, bad numbers and unlisted sizes fall back to defaults. */
export function parseListQuery(search: string, defaults: UrlStateDefaults): ListFilterState {
  const params = new URLSearchParams(search);
  const fallbackSize = defaults.size ?? DEFAULT_LIST_PAGE_SIZE;
  const size = parsePositive(params.get(URL_PARAM.size), fallbackSize);
  const allowed = defaults.allowedSizes;
  const columns = splitList(params.get(URL_PARAM.columns));
  const facets = Object.fromEntries(
    defaults.facetKeys.map((k) => [k, splitList(params.get(k))] as const).filter(([, v]) => v.length > 0),
  );
  return {
    facets,
    date: parseDate(params.get(URL_PARAM.date)),
    page: parsePositive(params.get(URL_PARAM.page), FIRST_PAGE),
    size: allowed === undefined || allowed.includes(size) ? size : fallbackSize,
    columns: columns.length > 0 ? columns : null,
  };
}

/** Writes list state as a query string without the "?"; default page and size are left out. */
export function serializeListQuery(state: ListFilterState, defaultSize: number = DEFAULT_LIST_PAGE_SIZE): string {
  const params = new URLSearchParams();
  Object.entries(state.facets).forEach(([k, v]) => {
    if (v !== undefined && v.length > 0) params.set(k, v.join(VALUE_SEPARATOR));
  });
  if (state.date !== null) params.set(URL_PARAM.date, `${state.date.field}${DATE_SEPARATOR}${state.date.range}`);
  if (state.page !== FIRST_PAGE) params.set(URL_PARAM.page, String(state.page));
  if (state.size !== defaultSize) params.set(URL_PARAM.size, String(state.size));
  if (state.columns !== null) params.set(URL_PARAM.columns, state.columns.join(VALUE_SEPARATOR));
  return params.toString();
}
