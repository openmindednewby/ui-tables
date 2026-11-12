import type { ReportFilterValues } from '../types';
import {
  countActiveReportFilters,
  isIsoDate,
  isRangeInverted,
  reportFiltersFromQuery,
  reportFiltersToQuery,
  reportFiltersToSearch,
} from './reportQuery';

const FULL: ReportFilterValues = {
  scope: 'merchant-7',
  range: { from: '2026-01-01', to: '2026-01-31' },
  statuses: ['Settled', 'Failed'],
  currency: 'EUR',
};

describe('reportFiltersToQuery', () => {
  it('with every filter set, writes one param per filter and joins statuses', () => {
    const values = FULL;

    const query = reportFiltersToQuery(values);

    expect(query).toEqual({ scope: 'merchant-7', from: '2026-01-01', to: '2026-01-31', status: 'Settled,Failed', currency: 'EUR' });
  });

  it('with nothing set, writes an empty record', () => {
    const values: ReportFilterValues = { scope: '', range: { from: '', to: '' }, statuses: [], currency: '' };

    const query = reportFiltersToQuery(values);

    expect(query).toEqual({});
  });

  it('with custom keys, writes under those names', () => {
    const keys = { scope: 'ChildTenantId', from: 'ValueDateFrom', to: 'ValueDateTo', statuses: 'Statuses', currency: 'Currency' };

    const query = reportFiltersToQuery(FULL, keys);

    expect(Object.keys(query)).toEqual(['ChildTenantId', 'ValueDateFrom', 'ValueDateTo', 'Statuses', 'Currency']);
  });
});

describe('reportFiltersFromQuery', () => {
  it('with a search string written by reportFiltersToSearch, restores the same values', () => {
    const params = new URLSearchParams(reportFiltersToSearch(FULL));

    const restored = reportFiltersFromQuery(params);

    expect(restored).toEqual(FULL);
  });

  it('with a router params record holding a status array, splits and dedupes the statuses', () => {
    const source = { status: ['Settled,Failed', 'Settled'], currency: ' USD ' };

    const restored = reportFiltersFromQuery(source);

    expect(restored).toEqual({ scope: '', range: { from: '', to: '' }, statuses: ['Settled', 'Failed'], currency: 'USD' });
  });

  it('with a non-calendar date, drops that end of the range', () => {
    const source = { from: '2026-02-30', to: '2026-03-01' };

    const restored = reportFiltersFromQuery(source);

    expect(restored.range).toEqual({ from: '', to: '2026-03-01' });
  });
});

describe('isIsoDate', () => {
  it('with a slash-separated date, returns false', () => {
    const value = '2026/01/01';

    const result = isIsoDate(value);

    expect(result).toBe(false);
  });
});

describe('isRangeInverted', () => {
  it('with from after to, returns true', () => {
    const range = { from: '2026-02-01', to: '2026-01-31' };

    const result = isRangeInverted(range);

    expect(result).toBe(true);
  });

  it('with the same day on both ends, returns false', () => {
    const range = { from: '2026-02-01', to: '2026-02-01' };

    const result = isRangeInverted(range);

    expect(result).toBe(false);
  });

  it('with only one end set, returns false', () => {
    const range = { from: '2026-02-01', to: '' };

    const result = isRangeInverted(range);

    expect(result).toBe(false);
  });
});

describe('countActiveReportFilters', () => {
  it('with scope and a from date only, counts two', () => {
    const values: ReportFilterValues = { scope: 'm1', range: { from: '2026-01-01', to: '' }, statuses: [], currency: '' };

    const count = countActiveReportFilters(values);

    expect(count).toBe(2);
  });
});
