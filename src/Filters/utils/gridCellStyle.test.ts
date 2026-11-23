import { fieldContainerStyle } from '../fields/FilterFieldView';
import type { FilterField } from '../types';
import { gridCellStyle } from './gridCellStyle';

const GAP = 16;

describe('gridCellStyle', () => {
  it('with four columns, returns a quarter of the row less three gaps', () => {
    const columns = 4;

    const style = gridCellStyle(columns, GAP);

    expect(style).toMatchObject({ width: 'calc((100% - 48px) / 4)', minWidth: 0, flexGrow: 0 });
  });

  it('with one column, returns the full row width', () => {
    const columns = 1;

    const style = gridCellStyle(columns, GAP);

    expect(style).toEqual({ width: '100%', minWidth: 0, flexGrow: 0 });
  });

  it('with zero columns, treats it as one full-width column', () => {
    const columns = 0;

    const style = gridCellStyle(columns, GAP);

    expect(style.width).toBe('100%');
  });
});

describe('fieldContainerStyle', () => {
  it('with gridColumns set, returns the grid cell instead of the min-width flow', () => {
    const field: FilterField = { kind: 'select', key: 'risk', label: 'Risk', options: [], gridColumns: 4 };

    const style = fieldContainerStyle(field) as unknown[];

    expect(style[1]).toMatchObject({ width: 'calc((100% - 48px) / 4)' });
  });

  it('with no gridColumns, keeps the per-kind clamped min width', () => {
    const field: FilterField = { kind: 'select', key: 'risk', label: 'Risk', options: [] };

    const style = fieldContainerStyle(field) as unknown[];

    expect(style[1]).toMatchObject({ minWidth: 'min(150px, 100%)' });
  });
});
