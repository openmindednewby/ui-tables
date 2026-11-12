import { act, renderHook } from '@testing-library/react';

import type { ReportFilterValues } from '../types';
import { useReportDraft } from './useReportDraft';

const START: ReportFilterValues = { scope: '', range: { from: '', to: '' }, statuses: [], currency: '' };

describe('useReportDraft', () => {
  it('with an inverted range edit, keeps it in the draft and does not call onChange', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useReportDraft(START, onChange));
    const inverted = { ...START, range: { from: '2026-02-01', to: '2026-01-01' } };

    act(() => result.current.edit(inverted));

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.draft).toEqual(inverted);
  });

  it('with a valid edit, calls onChange with it', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useReportDraft(START, onChange));
    const valid = { ...START, currency: 'EUR' };

    act(() => result.current.edit(valid));

    expect(onChange).toHaveBeenCalledWith(valid);
  });

  it('with an outside value change, resets the draft to the new value', () => {
    const onChange = jest.fn();
    const { result, rerender } = renderHook(({ value }) => useReportDraft(value, onChange), { initialProps: { value: START } });
    const shared = { ...START, scope: 'm9' };

    rerender({ value: shared });

    expect(result.current.draft).toEqual(shared);
  });
});
