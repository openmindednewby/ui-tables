import { StyleSheet } from 'react-native';

import { FiltersVariant } from '../FiltersVariant';
import type { FilterField } from '../types';
import { isStackedVariant, variantFields, variantShell } from './variantLayout';

const BREAKPOINT = 768;
const fields: readonly FilterField[] = [
  { key: 'q', kind: 'text', label: 'Search', grow: true },
  { key: 'status', kind: 'select', label: 'Status', options: [], gridColumns: 4 },
];

describe('isStackedVariant', () => {
  it('with the bare variant below the breakpoint, stacks', () => {
    const result = isStackedVariant(FiltersVariant.Bare, 360, BREAKPOINT);

    expect(result).toBe(true);
  });

  it('with the bare variant at the breakpoint, does not stack', () => {
    const result = isStackedVariant(FiltersVariant.Bare, BREAKPOINT, BREAKPOINT);

    expect(result).toBe(false);
  });

  it('with the boxed variant on a phone, does not stack', () => {
    const result = isStackedVariant(FiltersVariant.Boxed, 360, BREAKPOINT);

    expect(result).toBe(false);
  });
});

describe('variantFields', () => {
  it('when stacked, gives every field one full row', () => {
    const result = variantFields(fields, true);

    expect(result.map((f) => f.gridColumns)).toEqual([1, 1]);
  });

  it('when not stacked, returns the caller fields unchanged', () => {
    const result = variantFields(fields, false);

    expect(result).toBe(fields);
  });
});

describe('variantShell', () => {
  it('with the boxed variant, returns the caller overrides unchanged', () => {
    const overrides = { filters: { borderRadius: 4 } };

    const result = variantShell(FiltersVariant.Boxed, false, overrides);

    expect(result).toBe(overrides);
  });

  it('with the bare variant, drops the border and padding', () => {
    const result = StyleSheet.flatten(variantShell(FiltersVariant.Bare, false, undefined)?.filters);

    expect(result).toMatchObject({ borderWidth: 0, paddingHorizontal: 0, paddingVertical: 0, backgroundColor: 'transparent' });
  });

  it('with the bare variant stacked, stretches the actions full width', () => {
    const result = StyleSheet.flatten(variantShell(FiltersVariant.Bare, true, undefined)?.filtersActions);

    expect(result).toMatchObject({ width: '100%', flexDirection: 'column', alignItems: 'stretch' });
  });

  it('with the bare variant and a caller override, the caller wins', () => {
    const result = StyleSheet.flatten(variantShell(FiltersVariant.Bare, false, { filters: { paddingVertical: 6 } })?.filters);

    expect(result).toMatchObject({ borderWidth: 0, paddingVertical: 6 });
  });
});
