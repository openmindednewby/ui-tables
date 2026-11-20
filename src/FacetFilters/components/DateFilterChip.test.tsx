import { fireEvent, render, screen } from '@testing-library/react';

import { facetTestIds } from '../testIds';
import type { DateFilterChipLabels, DateFilterValue } from '../types';
import { DateFilterChip } from './DateFilterChip';

const ids = facetTestIds('list');
const FIELDS = [{ value: 'created', label: 'Created' }];
const RANGES = [{ value: '7d', label: 'Last 7 days' }];
const LABELS: DateFilterChipLabels = { title: 'Date', anyDate: 'Any time', editHint: 'Changes the date filter' };

function renderChip(value: DateFilterValue | null, onPress: () => void = jest.fn()): HTMLElement {
  render(<DateFilterChip fields={FIELDS} labels={LABELS} onPress={onPress} open={false} ranges={RANGES} testIDPrefix="list" value={value} />);
  return screen.getByTestId(ids.dateTrigger);
}

describe('DateFilterChip', () => {
  it('with a date value, names the mode and range and is marked active', () => {
    const value = { field: 'created', range: '7d' };

    const chip = renderChip(value);

    expect([chip.textContent, chip.getAttribute('data-active')]).toEqual(['Date: Created · Last 7 days', 'true']);
  });

  it('with no date value, says any time and is marked inactive', () => {
    const value = null;

    const chip = renderChip(value);

    expect([chip.textContent, chip.getAttribute('data-active')]).toEqual(['Date: Any time', 'false']);
  });

  it('with a press, calls onPress', () => {
    const onPress = jest.fn();
    const chip = renderChip(null, onPress);

    fireEvent.click(chip);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
