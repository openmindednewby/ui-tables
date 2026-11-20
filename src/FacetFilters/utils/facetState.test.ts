import type { FacetDefinition, FilterChipBarLabels } from '../types';
import { activeFacetKeys, facetSummary, isSameFacets, removeFacet, toggleFacetValue } from './facetState';

const STATUS: FacetDefinition = {
  key: 'vs',
  label: 'Status',
  options: [
    { value: 'review', label: 'Review' },
    { value: 'correction', label: 'Correction' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
  ],
};
const RISK: FacetDefinition = { key: 'risk', label: 'Risk', options: [{ value: 'high', label: 'High' }] };
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

describe('toggleFacetValue', () => {
  it('with an absent value, adds it', () => {
    const values = { vs: ['review'] };

    const result = toggleFacetValue(values, 'vs', 'correction');

    expect(result).toEqual({ vs: ['review', 'correction'] });
  });

  it('with the last value of a facet, removes the facet', () => {
    const values = { vs: ['review'], risk: ['high'] };

    const result = toggleFacetValue(values, 'vs', 'review');

    expect(result).toEqual({ risk: ['high'] });
  });
});

describe('removeFacet', () => {
  it('with an active facet, drops only that facet', () => {
    const values = { vs: ['review'], risk: ['high'] };

    const result = removeFacet(values, 'risk');

    expect(result).toEqual({ vs: ['review'] });
  });
});

describe('activeFacetKeys', () => {
  it('with values out of order, returns keys in definition order', () => {
    const values = { risk: ['high'], vs: ['review'] };

    const result = activeFacetKeys([STATUS, RISK], values);

    expect(result).toEqual(['vs', 'risk']);
  });
});

describe('isSameFacets', () => {
  it('with the same values in another order, returns true', () => {
    const a = { vs: ['review', 'correction'] };
    const b = { vs: ['correction', 'review'] };

    const result = isSameFacets(a, b);

    expect(result).toBe(true);
  });

  it('with an extra facet on one side, returns false', () => {
    const a = { vs: ['review'] };
    const b = { vs: ['review'], risk: ['high'] };

    const result = isSameFacets(a, b);

    expect(result).toBe(false);
  });
});

describe('facetSummary', () => {
  it('with two picked values, returns their labels', () => {
    const picked = ['correction', 'review'];

    const result = facetSummary(STATUS, picked, LABELS);

    expect(result).toBe('Review, Correction');
  });

  it('with three of four picked, returns the count', () => {
    const picked = ['review', 'correction', 'approved'];

    const result = facetSummary(STATUS, picked, LABELS);

    expect(result).toBe('3 selected');
  });

  it('with every option picked, returns the all label', () => {
    const picked = ['high'];

    const result = facetSummary(RISK, picked, LABELS);

    expect(result).toBe('All');
  });
});
