import { renderHook } from '@testing-library/react';
import React from 'react';

import { useTableLook } from '../DataTable/tableLook';
import { TableLook } from '../DataTable/TableLookName';
import { ChipSize } from '../FacetFilters/ChipSize';
import { useChipLook } from '../FacetFilters/components/ChipLook';
import { SearchFieldLook } from '../FacetFilters/SearchFieldLook';
import { LookPreset } from './LookPreset';
import { LookPresetProvider, useLookSet } from './LookPresetProvider';
import type { LookSetOverrides } from './lookSet';

function wrapperFor(preset: LookPreset, overrides?: LookSetOverrides): React.FC<{ children: React.ReactNode }> {
  return function Wrapper({ children }) {
    return <LookPresetProvider overrides={overrides} preset={preset}>{children}</LookPresetProvider>;
  };
}

describe('LookPresetProvider', () => {
  it('outside a provider, gives the Standard looks', () => {
    const { result } = renderHook(() => useLookSet());

    expect(result.current.table).toBe(TableLook.Default);
  });

  it('with the Dense preset, sets the chip look for chips below it', () => {
    const { result } = renderHook(() => useChipLook(), { wrapper: wrapperFor(LookPreset.Dense) });

    expect(result.current.size).toBe(ChipSize.Compact);
  });

  it('with the Dense preset, gives hand-built tables the banded slot styles', () => {
    const { result } = renderHook(() => useTableLook(), { wrapper: wrapperFor(LookPreset.Dense) });

    expect(result.current).not.toBeNull();
  });

  it('with an explicit Default table look, the component value wins over the preset', () => {
    const { result } = renderHook(() => useTableLook(TableLook.Default), { wrapper: wrapperFor(LookPreset.Dense) });

    expect(result.current).toBeNull();
  });

  it('with a search override, gives the overridden search look', () => {
    const { result } = renderHook(() => useLookSet(), { wrapper: wrapperFor(LookPreset.Dense, { searchField: SearchFieldLook.Plain }) });

    expect(result.current.searchField).toBe(SearchFieldLook.Plain);
  });
});
