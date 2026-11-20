import { fireEvent, render, screen } from '@testing-library/react';

import { FACET_TEST_IDS, dateFieldTestID, dateRangeTestID } from '../constants';
import type { DateFieldChipLabels, DateFilterValue } from '../types';
import { DateFieldChip } from './DateFieldChip';

const FIELDS = [
  { value: 'updated', label: 'Updated' },
  { value: 'created', label: 'Created' },
];
const RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];
const LABELS: DateFieldChipLabels = {
  title: 'Date',
  fieldGroup: 'Which date',
  rangeGroup: 'Range',
  fieldHint: 'Filters on this date',
  rangeHint: 'Uses this range',
  clear: 'Clear',
  clearHint: 'Removes the date filter',
};

function renderChip(value: DateFilterValue | null): jest.Mock {
  const onChange = jest.fn();
  render(<DateFieldChip fields={FIELDS} labels={LABELS} onChange={onChange} ranges={RANGES} value={value} />);
  return onChange;
}

describe('DateFieldChip', () => {
  it('with no date filter, picking a field uses the first range', () => {
    const onChange = renderChip(null);

    fireEvent.click(screen.getByTestId(dateFieldTestID('created')));

    expect(onChange).toHaveBeenCalledWith({ field: 'created', range: '7d' });
  });

  it('with a date filter, picking a range keeps the field', () => {
    const onChange = renderChip({ field: 'created', range: '7d' });

    fireEvent.click(screen.getByTestId(dateRangeTestID('30d')));

    expect(onChange).toHaveBeenCalledWith({ field: 'created', range: '30d' });
  });

  it('with a date filter, Clear emits null', () => {
    const onChange = renderChip({ field: 'updated', range: '7d' });

    fireEvent.click(screen.getByTestId(FACET_TEST_IDS.dateClear));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
