import { StyleSheet } from 'react-native';

import { MIN_TARGET_PX } from '../minTarget';
import { DENSE_HEAD_HEIGHT, DENSE_ROW_HEIGHT, densitySlotStyles } from './density';
import { TableDensity } from './TableDensity';

describe('densitySlotStyles', () => {
  it('with the comfortable density, adds no styles', () => {
    const result = densitySlotStyles(TableDensity.Comfortable);

    expect(result).toBeNull();
  });

  it('with the dense density, pads a 20 px text line to a 36 px row', () => {
    const result = StyleSheet.flatten(densitySlotStyles(TableDensity.Dense)?.row);

    expect(result).toMatchObject({ minHeight: 36, paddingVertical: 8 });
    expect(DENSE_ROW_HEIGHT).toBe(36);
  });

  it('with the dense density, pads a 16 px header line to a 34 px band', () => {
    const slots = densitySlotStyles(TableDensity.Dense);

    const row = StyleSheet.flatten(slots?.headRow);

    expect(row).toMatchObject({ minHeight: 34, paddingVertical: 9 });
    expect(StyleSheet.flatten(slots?.headCell)).toMatchObject({ lineHeight: 16 });
    expect(DENSE_HEAD_HEIGHT).toBe(34);
  });

  it('with the dense density, keeps the 44 px checkbox box but bleeds it so the row stays 36 px', () => {
    const result = StyleSheet.flatten(densitySlotStyles(TableDensity.Dense)?.rowSelectCell);

    expect(result).toMatchObject({ height: MIN_TARGET_PX, marginVertical: -4 });
  });
});
