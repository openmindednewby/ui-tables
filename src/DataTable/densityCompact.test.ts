import { StyleSheet } from 'react-native';

import { cellPaddingStyle, densitySlotStyles, withDensityCell } from './density';
import { TableDensity } from './TableDensity';

describe('densitySlotStyles compact', () => {
  it('with the compact density, gives 34 px rows with 10 px cell gutters', () => {
    const result = StyleSheet.flatten(densitySlotStyles(TableDensity.Compact)?.row);

    expect(result).toMatchObject({ minHeight: 34, paddingVertical: 7, paddingHorizontal: 10, columnGap: 20 });
  });

  it('with the compact density, gives a 28 px header band of 11 px tracked text', () => {
    const slots = densitySlotStyles(TableDensity.Compact);

    expect(StyleSheet.flatten(slots?.headRow)).toMatchObject({ minHeight: 28, paddingVertical: 6 });
    expect(StyleSheet.flatten(slots?.headCell)).toMatchObject({ fontSize: 11, letterSpacing: 0.66 });
  });

  it('with the compact density, puts the 13 px cell font under the caller cell override', () => {
    const callerCell = { fontSize: 15 };

    const result = withDensityCell({ cell: callerCell }, densitySlotStyles(TableDensity.Compact));

    expect(StyleSheet.flatten(result?.cell)).toMatchObject({ fontSize: 15, lineHeight: 20 });
  });

  it('with the dense density, leaves the caller overrides untouched', () => {
    const overrides = { cell: { fontSize: 15 } };

    const result = withDensityCell(overrides, densitySlotStyles(TableDensity.Dense));

    expect(result).toBe(overrides);
  });
});

describe('cellPaddingStyle', () => {
  it('with a compact column padding of 3, trims the 7 px row padding by 4 px each side', () => {
    const result = cellPaddingStyle(TableDensity.Compact, 3);

    expect(result).toEqual({ marginVertical: -4 });
  });

  it('with no column padding, adds no style', () => {
    const result = cellPaddingStyle(TableDensity.Compact, undefined);

    expect(result).toBeNull();
  });

  it('with the comfortable density, adds no style', () => {
    const result = cellPaddingStyle(TableDensity.Comfortable, 3);

    expect(result).toBeNull();
  });
});
