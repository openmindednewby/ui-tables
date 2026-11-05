import { fireEvent, render, screen } from '@testing-library/react';

import { MonthGridColumns } from './MonthGridColumns';
import { MonthStatusGrid, monthCellTestID } from './MonthStatusGrid';
import type { MonthStatusCell } from './MonthStatusGrid';
import { chunkIntoRows, fitMonthGridColumns } from './monthGridLayout';

const TEST_ID = 'grid';
const GAP = 6;
const PHONE_CONTENT_WIDTH = 328;
const DESKTOP_CONTENT_WIDTH = 1000;
const TOO_NARROW_FOR_SIX = 280;

const twelveCells: MonthStatusCell[] = Array.from({ length: 12 }, (_, index) => ({
  id: `m${index + 1}`,
  label: `M${index + 1}`,
}));

function renderGrid(overrides: Partial<React.ComponentProps<typeof MonthStatusGrid>> = {}): void {
  render(
    <MonthStatusGrid
      accessibilityLabel="Year"
      cellHint="Filters by this period"
      cells={twelveCells}
      onSelect={jest.fn()}
      testID={TEST_ID}
      {...overrides}
    />,
  );
}

describe('fitMonthGridColumns', () => {
  it('with desktop width and twelve requested, returns twelve', () => {
    const result = fitMonthGridColumns(MonthGridColumns.Twelve, DESKTOP_CONTENT_WIDTH, GAP);

    expect(result).toBe(MonthGridColumns.Twelve);
  });

  it('with phone width and twelve requested, narrows to six', () => {
    const result = fitMonthGridColumns(MonthGridColumns.Twelve, PHONE_CONTENT_WIDTH, GAP);

    expect(result).toBe(MonthGridColumns.Six);
  });

  it('with too little width for six, narrows to four', () => {
    const result = fitMonthGridColumns(MonthGridColumns.Six, TOO_NARROW_FOR_SIX, GAP);

    expect(result).toBe(MonthGridColumns.Four);
  });

  it('with four requested on a wide screen, never widens past four', () => {
    const result = fitMonthGridColumns(MonthGridColumns.Four, DESKTOP_CONTENT_WIDTH, GAP);

    expect(result).toBe(MonthGridColumns.Four);
  });
});

describe('chunkIntoRows', () => {
  it('with five items in rows of two, keeps the remainder in a short last row', () => {
    const rows = chunkIntoRows([1, 2, 3, 4, 5], 2);

    expect(rows).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('MonthStatusGrid', () => {
  it('when a cell is pressed, calls onSelect with its id', () => {
    const onSelect = jest.fn();
    renderGrid({ onSelect });

    fireEvent.click(screen.getByTestId(monthCellTestID(TEST_ID, 'm3')));

    expect(onSelect).toHaveBeenCalledWith('m3');
  });

  it('with a selected id, marks only that cell as pressed', () => {
    renderGrid({ selectedId: 'm2' });

    const selected = screen.getByTestId(monthCellTestID(TEST_ID, 'm2'));
    const other = screen.getByTestId(monthCellTestID(TEST_ID, 'm1'));

    expect(selected.getAttribute('aria-pressed')).toBe('true');
    expect(other.getAttribute('aria-pressed')).toBe('false');
  });

  it('with a status label, names the cell with its label and status', () => {
    renderGrid({ cells: [{ id: 'a', label: 'Jan', statusLabel: 'Done' }] });

    const cell = screen.getByTestId(monthCellTestID(TEST_ID, 'a'));

    expect(cell.getAttribute('aria-label')).toBe('Jan, Done');
  });

  it('with four columns requested, renders twelve cells in three rows', () => {
    renderGrid({ columns: MonthGridColumns.Four });

    const rows = screen.getAllByTestId(`${TEST_ID}-row`);

    expect(rows).toHaveLength(3);
  });
});
