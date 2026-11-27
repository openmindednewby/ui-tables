import { fireEvent, render, screen } from '@testing-library/react';
import { StyleSheet } from 'react-native';

import { MIN_TARGET_PX } from '../../minTarget';
import { ChipSize } from '../ChipSize';
import { facetTestIds } from '../testIds';
import { TextButtonVariant } from '../TextButtonVariant';
import type { FilterChipBarLabels } from '../types';
import { ChipLookProvider } from './ChipLook';
import { COMPACT_PILL_PX, chipSizeStyles } from './chipSizeStyles';
import { DateFilterChip } from './DateFilterChip';
import { FilterChipBar } from './FilterChipBar';

const PREFIX = 'list';
const ids = facetTestIds(PREFIX);
const FACETS = [
  { key: 'risk', label: 'Risk', options: [{ value: 'high', label: 'High' }] },
  { key: 'mon', label: 'Monitoring', options: [{ value: 'on', label: 'On' }] },
];
const LABELS: FilterChipBarLabels = {
  addFilter: 'Add filter',
  addFilterHint: 'Adds a filter',
  reset: 'Reset',
  resetHint: 'Resets filters',
  remove: (l) => `Remove ${l}`,
  removeHint: 'Removes this filter',
  editHint: 'Edits this filter',
  optionHint: 'Toggles this value',
  allSelected: 'All',
  countSelected: (n) => `${String(n)} selected`,
};
const DATE_LABELS = { title: 'Date', anyDate: 'Any time', editHint: 'Changes the date filter' };

function renderBar(look?: { size?: ChipSize; addFilter?: TextButtonVariant }): void {
  const bar = <FilterChipBar facets={FACETS} labels={LABELS} onChange={jest.fn()} pinnedKeys={['risk']} testIDPrefix={PREFIX} values={{}} />;
  render(look === undefined ? bar : <ChipLookProvider look={look}>{bar}</ChipLookProvider>);
}

describe('chipSizeStyles', () => {
  it('with the compact pill, keeps a 44 px tap box and insets a 30 px pill inside it', () => {
    const backdrop = StyleSheet.flatten(chipSizeStyles.backdrop);

    const pill = MIN_TARGET_PX - Number(backdrop.top) - Number(backdrop.bottom);

    expect([StyleSheet.flatten(chipSizeStyles.body).minHeight, pill]).toEqual([MIN_TARGET_PX, COMPACT_PILL_PX]);
  });
});

describe('ChipLookProvider', () => {
  it('with no provider, draws no compact pill and no dashed Add filter', () => {
    renderBar();

    expect([screen.queryByTestId(`${ids.chip('risk')}-pill`), screen.queryByTestId(`${ids.addFilter}-pill`)]).toEqual([null, null]);
  });

  it('with the compact size, draws the thin pill behind each facet chip', () => {
    renderBar({ size: ChipSize.Compact });

    expect(screen.queryByTestId(`${ids.chip('risk')}-pill`)).not.toBeNull();
  });

  it('with the dashed Add filter, draws the dashed pill and still opens the add menu', () => {
    renderBar({ size: ChipSize.Compact, addFilter: TextButtonVariant.DashedChip });

    fireEvent.click(screen.getByTestId(ids.addFilter));

    expect([screen.queryByTestId(`${ids.addFilter}-pill`) !== null, screen.queryByTestId(ids.addFacet('mon')) !== null]).toEqual([true, true]);
  });

  it('with the compact size, the date chip draws its pill and still calls onPress', () => {
    const onPress = jest.fn();
    render(
      <ChipLookProvider look={{ size: ChipSize.Compact }}>
        <DateFilterChip fields={[]} labels={DATE_LABELS} onPress={onPress} open={false} ranges={[]} testIDPrefix={PREFIX} value={null} />
      </ChipLookProvider>,
    );

    fireEvent.click(screen.getByTestId(ids.dateTrigger));

    expect([screen.queryByTestId(`${ids.dateTrigger}-pill`) !== null, onPress.mock.calls.length]).toEqual([true, 1]);
  });
});
