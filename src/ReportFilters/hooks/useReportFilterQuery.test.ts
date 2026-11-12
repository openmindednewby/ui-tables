import { act, renderHook } from '@testing-library/react';

import type { ReportFilterValues, ReportQueryKeys } from '../types';
import { useReportFilterQuery } from './useReportFilterQuery';

const NEXT: ReportFilterValues = {
  scope: 'acme',
  range: { from: '2026-01-01', to: '' },
  statuses: ['Failed', 'Pending'],
  currency: '',
};

const CUSTOM_KEYS: ReportQueryKeys = { scope: 'm', from: 'df', to: 'dt', statuses: 's', currency: 'c' };

describe('useReportFilterQuery', () => {
  it('with filter params, reads them into values', () => {
    const params = { scope: 'acme', from: '2026-01-01', status: 'Failed,Pending', currency: 'EUR' };

    const { result } = renderHook(() => useReportFilterQuery({ params, setParams: jest.fn() }));

    expect(result.current.values).toEqual({
      scope: 'acme',
      range: { from: '2026-01-01', to: '' },
      statuses: ['Failed', 'Pending'],
      currency: 'EUR',
    });
  });

  it('with new values, sets every key and clears the empty ones', () => {
    const setParams = jest.fn();
    const { result } = renderHook(() => useReportFilterQuery({ params: {}, setParams }));

    act(() => result.current.setValues(NEXT));

    expect(setParams).toHaveBeenCalledWith({
      scope: 'acme',
      from: '2026-01-01',
      to: undefined,
      status: 'Failed,Pending',
      currency: undefined,
    });
  });

  it('with custom keys, reads and writes under those keys', () => {
    const setParams = jest.fn();
    const params = { m: 'beta', c: 'USD' };
    const { result } = renderHook(() => useReportFilterQuery({ params, setParams, keys: CUSTOM_KEYS }));

    act(() => result.current.setValues(NEXT));

    expect(result.current.values.scope).toBe('beta');
    expect(result.current.values.currency).toBe('USD');
    expect(setParams).toHaveBeenCalledWith({ m: 'acme', df: '2026-01-01', dt: undefined, s: 'Failed,Pending', c: undefined });
  });
});
