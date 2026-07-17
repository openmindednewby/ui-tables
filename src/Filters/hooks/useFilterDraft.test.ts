import { act, renderHook } from '@testing-library/react';

import { useFilterDraft } from './useFilterDraft';
import type { FilterValues } from '../types';

const INITIAL: FilterValues = { q: '', status: '', active: false };

describe('useFilterDraft', () => {
  it('starts with draft === committed === initial and not dirty', () => {
    const { result } = renderHook(() => useFilterDraft({ initial: INITIAL }));
    expect(result.current.draft).toEqual(INITIAL);
    expect(result.current.committed).toEqual(INITIAL);
    expect(result.current.dirty).toBe(false);
  });

  it('patches a single field of the draft only (committed untouched) and marks dirty', () => {
    const { result } = renderHook(() => useFilterDraft({ initial: INITIAL }));
    act(() => result.current.setField('q', 'acme'));
    expect(result.current.draft.q).toBe('acme');
    expect(result.current.committed.q).toBe('');
    expect(result.current.dirty).toBe(true);
  });

  it('apply commits the draft to committed and fires onApply with it', () => {
    const onApply = jest.fn();
    const { result } = renderHook(() => useFilterDraft({ initial: INITIAL, onApply }));
    act(() => result.current.setField('status', 'open'));
    act(() => result.current.apply());
    expect(result.current.committed.status).toBe('open');
    expect(result.current.dirty).toBe(false);
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ status: 'open' }));
  });

  it('reset returns draft + committed to initial and fires onReset', () => {
    const onReset = jest.fn();
    const { result } = renderHook(() => useFilterDraft({ initial: INITIAL, onReset }));
    act(() => result.current.setField('q', 'x'));
    act(() => result.current.apply());
    act(() => result.current.reset());
    expect(result.current.draft).toEqual(INITIAL);
    expect(result.current.committed).toEqual(INITIAL);
    expect(result.current.dirty).toBe(false);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('setDraft replaces the whole draft', () => {
    const { result } = renderHook(() => useFilterDraft({ initial: INITIAL }));
    act(() => result.current.setDraft({ q: 'a', status: 'b', active: true }));
    expect(result.current.draft).toEqual({ q: 'a', status: 'b', active: true });
    expect(result.current.dirty).toBe(true);
  });

  it('is not dirty when the draft is edited back to the committed value', () => {
    const { result } = renderHook(() => useFilterDraft({ initial: INITIAL }));
    act(() => result.current.setField('q', 'a'));
    act(() => result.current.setField('q', ''));
    expect(result.current.dirty).toBe(false);
  });
});
