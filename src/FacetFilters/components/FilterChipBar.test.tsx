import { fireEvent, render, screen } from '@testing-library/react';

import { FACET_TEST_IDS, addFacetTestID, facetChipRemoveTestID, facetChipTestID, facetOptionTestID } from '../constants';
import type { FacetDefinition, FacetValues, FilterChipBarLabels } from '../types';
import { FilterChipBar } from './FilterChipBar';

const FACETS: FacetDefinition[] = [
  { key: 'vs', label: 'Status', options: [{ value: 'review', label: 'Review' }, { value: 'correction', label: 'Correction' }] },
  { key: 'risk', label: 'Risk', options: [{ value: 'high', label: 'High' }] },
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

function renderBar(values: FacetValues, defaultValues?: FacetValues): jest.Mock {
  const onChange = jest.fn();
  render(<FilterChipBar defaultValues={defaultValues} facets={FACETS} labels={LABELS} onChange={onChange} values={values} />);
  return onChange;
}

describe('FilterChipBar', () => {
  it('with Add filter then a facet then an option, emits that facet value', () => {
    const onChange = renderBar({});
    fireEvent.click(screen.getByTestId(FACET_TEST_IDS.addFilter));
    fireEvent.click(screen.getByTestId(addFacetTestID('risk')));

    fireEvent.click(screen.getByTestId(facetOptionTestID('risk', 'high')));

    expect(onChange).toHaveBeenCalledWith({ risk: ['high'] });
  });

  it('with the remove cross on a chip, emits the values without that facet', () => {
    const onChange = renderBar({ vs: ['review'], risk: ['high'] });

    fireEvent.click(screen.getByTestId(facetChipRemoveTestID('vs')));

    expect(onChange).toHaveBeenCalledWith({ risk: ['high'] });
  });

  it('with an open chip, toggling an option adds it to the facet', () => {
    const onChange = renderBar({ vs: ['review'] });
    fireEvent.click(screen.getByTestId(facetChipTestID('vs')));

    fireEvent.click(screen.getByTestId(facetOptionTestID('vs', 'correction')));

    expect(onChange).toHaveBeenCalledWith({ vs: ['review', 'correction'] });
  });

  it('with values away from the default, Reset emits the default values', () => {
    const onChange = renderBar({ risk: ['high'] }, { vs: ['review'] });

    fireEvent.click(screen.getByTestId(FACET_TEST_IDS.reset));

    expect(onChange).toHaveBeenCalledWith({ vs: ['review'] });
  });

  it('with values equal to the default, offers no Reset', () => {
    const values = { vs: ['review'] };

    renderBar(values, { vs: ['review'] });

    expect(screen.queryByTestId(FACET_TEST_IDS.reset)).toBeNull();
  });
});
