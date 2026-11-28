import { skeletonBarWidth, skeletonRowIndexes, skeletonRowTestID } from './skeletonBars';

describe('skeletonBarWidth', () => {
  it('with a numeric column, returns the short right-hand bar', () => {
    const numeric = true;

    const width = skeletonBarWidth(3, 2, numeric);

    expect(width).toBe('40%');
  });

  it('with neighbouring cells, returns different widths so rows read as text', () => {
    const cells = [[0, 0], [0, 1], [1, 0]] as const;

    const widths = cells.map(([row, col]) => skeletonBarWidth(row, col));

    expect(new Set(widths).size).toBe(3);
  });
});

describe('skeletonRowIndexes', () => {
  it('with a negative or fractional count, returns whole non-negative rows', () => {
    const counts = [-2, 2.7];

    const rows = counts.map(skeletonRowIndexes);

    expect(rows).toEqual([[], [0, 1]]);
  });
});

describe('skeletonRowTestID', () => {
  it('with a table id and an index, returns the per-row id', () => {
    const tableTestID = 'list';

    const id = skeletonRowTestID(tableTestID, 4);

    expect(id).toBe('list-row-4');
  });
});
