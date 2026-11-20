import type { ColumnOption } from '../types';
import { resolveVisibleColumns, toggleColumn } from './columns';

const COLUMNS: ColumnOption[] = [
  { key: 'name', label: 'Name', locked: true },
  { key: 'status', label: 'Status' },
  { key: 'updated', label: 'Updated' },
];

describe('toggleColumn', () => {
  it('with a hidden column, shows it in column order', () => {
    const visible = ['name', 'updated'];

    const result = toggleColumn(COLUMNS, visible, 'status');

    expect(result).toEqual(['name', 'status', 'updated']);
  });

  it('with a locked column, keeps it visible', () => {
    const visible = ['name', 'status'];

    const result = toggleColumn(COLUMNS, visible, 'name');

    expect(result).toEqual(['name', 'status']);
  });

  it('with the only visible column, keeps it visible', () => {
    const visible = ['status'];

    const result = toggleColumn(COLUMNS, visible, 'status');

    expect(result).toEqual(['status']);
  });
});

describe('resolveVisibleColumns', () => {
  it('with no saved choice, returns every column', () => {
    const saved = null;

    const result = resolveVisibleColumns(COLUMNS, saved);

    expect(result).toEqual(['name', 'status', 'updated']);
  });

  it('with a saved choice that omits a locked column, adds the locked column back', () => {
    const saved = ['updated'];

    const result = resolveVisibleColumns(COLUMNS, saved);

    expect(result).toEqual(['name', 'updated']);
  });
});
