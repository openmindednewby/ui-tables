import { render, screen } from '@testing-library/react';

import { ChipBarLayout } from '../ChipBarLayout';
import { FACET_TEST_IDS } from '../constants';
import type { FacetDefinition, FilterChipBarLabels } from '../types';
import { FilterChipBar } from './FilterChipBar';

const FACETS: FacetDefinition[] = [{ key: 'risk', label: 'Risk', options: [{ value: 'high', label: 'High' }] }];
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
const SCROLL_ID = `${FACET_TEST_IDS.bar}-scroll`;

describe('FilterChipBar layout', () => {
  it('with the Scroll layout, renders the chips inside one sideways scroller', () => {
    const layout = ChipBarLayout.Scroll;

    render(<FilterChipBar facets={FACETS} labels={LABELS} layout={layout} onChange={jest.fn()} values={{ risk: ['high'] }} />);

    expect(screen.getByTestId(SCROLL_ID)).toBeInTheDocument();
  });

  it('with no layout, keeps the wrapping row and no scroller', () => {
    const values = { risk: ['high'] };

    render(<FilterChipBar facets={FACETS} labels={LABELS} onChange={jest.fn()} values={values} />);

    expect(screen.queryByTestId(SCROLL_ID)).toBeNull();
  });

  it('with chevron on, adds the down chevron to the chip text', () => {
    const chevron = true;

    render(<FilterChipBar chevron={chevron} facets={FACETS} labels={LABELS} onChange={jest.fn()} values={{ risk: ['high'] }} />);

    expect(screen.getByText('\u25BE', { exact: false })).toBeInTheDocument();
  });
});
