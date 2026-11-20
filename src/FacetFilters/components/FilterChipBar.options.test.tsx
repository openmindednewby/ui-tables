import { fireEvent, render, screen } from '@testing-library/react';

import { FACET_TEST_IDS } from '../constants';
import { facetTestIds } from '../testIds';
import type { FacetDefinition, FacetValues, FilterChipBarLabels } from '../types';
import { FilterChipBar, type FilterChipBarProps } from './FilterChipBar';

const PREFIX = 'list';
const ids = facetTestIds(PREFIX);
const FACETS: FacetDefinition[] = [
  { key: 'vs', label: 'Status', options: [{ value: 'review', label: 'Review' }] },
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

function renderBar(values: FacetValues, extra: Partial<FilterChipBarProps> = {}): jest.Mock {
  const onChange = jest.fn();
  render(<FilterChipBar facets={FACETS} labels={LABELS} onChange={onChange} values={values} {...extra} />);
  return onChange;
}

describe('FilterChipBar options', () => {
  it('with pinned keys and no values, shows the pinned chips marked inactive', () => {
    const values = {};

    renderBar(values, { pinnedKeys: ['vs', 'risk'], testIDPrefix: PREFIX });

    expect([ids.chip('vs'), ids.chip('risk')].map((id) => screen.getByTestId(id).getAttribute('data-active'))).toEqual(['false', 'false']);
  });

  it('with a pinned key that has a value, marks that chip active', () => {
    const values = { risk: ['high'] };

    renderBar(values, { pinnedKeys: ['vs', 'risk'], testIDPrefix: PREFIX });

    expect(screen.getByTestId(ids.chip('risk')).getAttribute('data-active')).toBe('true');
  });

  it('with pinned keys, offers only the other facets under Add filter', () => {
    renderBar({}, { pinnedKeys: ['vs', 'risk'], testIDPrefix: PREFIX });

    fireEvent.click(screen.getByTestId(ids.addFilter));

    expect([screen.queryByTestId(ids.addFacet('mon')), screen.queryByTestId(ids.addFacet('vs'))].map((el) => el !== null)).toEqual([true, false]);
  });

  it('with a prefix, an open pinned chip emits the option picked by its prefixed id', () => {
    const onChange = renderBar({}, { pinnedKeys: ['risk'], testIDPrefix: PREFIX });
    fireEvent.click(screen.getByTestId(ids.chip('risk')));

    fireEvent.click(screen.getByTestId(ids.option('risk', 'high')));

    expect(onChange).toHaveBeenCalledWith({ risk: ['high'] });
  });

  it('with alwaysShowReset on the default values, still offers Reset', () => {
    const values = {};

    renderBar(values, { alwaysShowReset: true, testIDPrefix: PREFIX });

    expect(screen.queryByTestId(ids.reset)).not.toBeNull();
  });

  it('with onReset, Reset calls onReset and not onChange', () => {
    const onReset = jest.fn();
    const onChange = renderBar({ risk: ['high'] }, { onReset });

    fireEvent.click(screen.getByTestId(FACET_TEST_IDS.reset));

    expect([onReset.mock.calls.length, onChange.mock.calls.length]).toEqual([1, 0]);
  });
});
